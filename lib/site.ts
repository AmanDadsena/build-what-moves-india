/* Where this build is deployed.
 *
 * Canonical URLs, the sitemap and the Open Graph image all have to be
 * absolute, because a crawler resolves a relative one against nothing.
 * That means the build has to know its own domain — and the usual way
 * that goes wrong is somebody hard-codes it, renames the project, and
 * ships eighty-four sitemap entries pointing at a domain that no
 * longer exists.
 *
 * So it is read, in order:
 *
 *   1. NEXT_PUBLIC_SITE_URL, when it is set explicitly.
 *   2. VERCEL_PROJECT_PRODUCTION_URL, which Vercel injects at build
 *      time. Note this is the project's *production* domain, not the
 *      per-deployment URL — so a preview build still points its
 *      canonicals at production, which is what a canonical is for. A
 *      preview that claimed itself as canonical would compete with
 *      the real page in a search index.
 *   3. localhost, for a local build.
 *
 * Rename the project and the next deployment corrects itself. Nothing
 * here needs editing.
 */

function resolve(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolve().replace(/\/$/, "");

/** True when the build fell through to localhost.
 *
 *  Exported rather than warned about here, so the one route that
 *  renders exactly once — the sitemap — can say it once, instead of
 *  every parallel static-generation worker saying it at the same time.
 */
export const DOMAIN_UNKNOWN =
  !process.env.NEXT_PUBLIC_SITE_URL &&
  !process.env.VERCEL_PROJECT_PRODUCTION_URL;

/** Absolute URL for a path, with the trailing slash this app serves. */
export function absolute(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const slashed = clean.endsWith("/") ? clean : `${clean}/`;
  return SITE_URL + (slashed === "//" ? "/" : slashed);
}
