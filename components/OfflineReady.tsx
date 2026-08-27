"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Two small things that only matter on a bad connection.
 *
 * The first is telling the member when the connection has gone,
 * because the alternative is worse: a page that half-works, a button
 * that appears to do nothing, and a reasonable conclusion that the
 * site is broken. Saying "you are offline, what is on screen is what
 * was last loaded" turns a fault into a fact.
 *
 * The second is the install offer. This is a service somebody has to
 * come back to across months, and the honest problem with coming back
 * is that searching for it lands on sites that impersonate it. An
 * icon the member placed themselves cannot be impersonated by a
 * search result.
 *
 * The offer is made once. If it is dismissed, that is remembered, and
 * it is never made again. A prompt that returns is an advertisement. */

const DISMISSED = "epf.install.dismissed";

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function OfflineReady() {
  const [offline, setOffline] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const deferred = useRef<InstallPrompt | null>(null);

  // Connection state.
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  // The worker. Registered only in a real build — in development a
  // cached shell would quietly serve yesterday's code, so any worker
  // found there is removed instead.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((rs) => rs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // No worker is a degraded experience, never a broken one.
      });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // The install offer.
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED) === "1";
    } catch {
      // Private mode. Treat as not dismissed; the offer is harmless.
    }
    if (dismissed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred.current = e as InstallPrompt;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setCanInstall(false));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = useCallback(() => {
    setCanInstall(false);
    try {
      localStorage.setItem(DISMISSED, "1");
    } catch {
      // Nothing to do. It will be offered once more next visit.
    }
  }, []);

  const install = useCallback(async () => {
    const prompt = deferred.current;
    if (!prompt) return;
    setCanInstall(false);
    await prompt.prompt();
    await prompt.userChoice;
    deferred.current = null;
    try {
      localStorage.setItem(DISMISSED, "1");
    } catch {
      // As above.
    }
  }, []);

  return (
    <>
      {offline && (
        <div
          role="status"
          className="fixed inset-x-0 top-0 z-[60] bg-pending text-paper px-4 py-2 text-center text-sm font-semibold"
        >
          You are offline. Anything already open stays readable.
        </div>
      )}

      {canInstall && (
        <div className="fixed z-50 bottom-5 left-4 right-4 sm:right-auto sm:max-w-sm border border-rule-heavy bg-paper-raised rounded-xl p-5 card-lift">
          <p className="title mb-1.5">Keep this on your phone</p>
          <p className="text-sm text-ink-soft leading-relaxed mb-4">
            Adds an icon to your home screen and keeps the pages you have
            already opened readable when the signal drops.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={install} className="btn btn-primary btn-sm">
              Add to home screen
            </button>
            <button onClick={dismiss} className="btn btn-ghost btn-sm">
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
