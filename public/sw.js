/* Service worker.
 *
 * The reason this exists is not novelty. A member checking a rejected
 * claim is often doing it on a phone with an intermittent connection,
 * frequently while standing in or near the office they are trying to
 * deal with — which in practice is where signal is worst. Losing the
 * page at that moment means losing the reference number they came to
 * read out.
 *
 * So: once a screen has been seen, it stays readable. Nothing here
 * tries to be clever about it.
 *
 * Strategy per kind of request, and why:
 *
 *   /_next/static/*   cache-first. These filenames contain a content
 *                     hash, so a given URL can never mean two
 *                     different things. Revalidating them is pure
 *                     latency for no possible benefit.
 *
 *   images, fonts     stale-while-revalidate. Show instantly, refresh
 *                     quietly. A slightly old illustration is never a
 *                     problem; waiting for one is.
 *
 *   pages, RSC        network-first. Anything a member might act on
 *                     comes from the network when the network is
 *                     there. The cache is a floor, never a shortcut —
 *                     it would be a bad failure to show somebody a
 *                     stale claim status because it was faster.
 *
 * Bump VERSION to evict everything on the next activation.
 */

const VERSION = "2026-08-27a";
const SHELL = `shell-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;
const OFFLINE_URL = "/offline/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // Best effort. One unreachable file must not abort the install
      // and leave the member with no worker at all.
      await Promise.allSettled(
        [OFFLINE_URL, "/", "/img/mark.png"].map((u) => cache.add(u)),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.endsWith(VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? network;
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const fallback = await caches.match(OFFLINE_URL);
      if (fallback) return fallback;
    }
    throw new Error("offline and not cached");
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (/\.(webp|png|jpg|jpeg|svg|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Documents, and the payloads client-side navigation fetches.
  if (request.mode === "navigate" || /\.txt$/i.test(url.pathname)) {
    event.respondWith(networkFirst(request));
  }
});
