/* ============================================================
   The case file: what a member has done so far, and how it travels.

   There is no account here and there is not going to be one, so every
   tick on a plan, every document gathered for a death claim and every
   reading preference lives in one browser and nowhere else. That is
   the right trade — nothing about somebody's blocked money sits on a
   server I control — but it has a cost, and the cost lands on exactly
   the people least able to absorb it.

   Two shapes of that cost, and this module answers both.

   The first is time. A claim runs for months. In that time a shared
   phone gets cleared, a cyber-café machine is wiped nightly, a
   browser is reinstalled. So the state can be written to a file and
   read back: no account, no upload, the member holds it.

   The second is other people, and it is the bigger one. A large share
   of the members this is written for do not do this alone. A daughter
   with a smartphone does the typing; a union clerk or an NGO
   caseworker handles thirty of these at once; a son in another city
   is the one who will actually walk into the office. Today the only
   way to hand the case over is to read it out.

   So the same state also encodes into a link. The payload rides in
   the URL *fragment* — everything after the # — which browsers never
   put in an HTTP request. It does not reach this site's host, it does
   not reach a CDN log, and a link-preview crawler that fetches the
   URL gets the page without it. The data goes from one device to
   another through whatever the two people already use, and nothing in
   between sees it.

   What is in the payload is deliberately narrow: which steps have
   been ticked, which documents have been gathered, and how the
   reader likes their text. No identity document, no bank detail, no
   figure. It is a progress record, and it is worth being able to say
   that in one sentence to somebody deciding whether to send it.
   ============================================================ */

/** Only the keys this build owns, listed rather than swept up, so a
 *  future key cannot be exported by accident. */
export const KEYS = [
  "rk-reader", // reading preferences
  "rk-lang", // chosen language
  "rk-voice-lang", // dictation language
  "rk-survivor-checklist", // documents gathered after a death
  "rk-install-dismissed",
  "epf.install.dismissed",
] as const;

/** One entry per claim being worked. */
export const PLAN_PREFIX = "rk-plan-";

/** The dated record of what a member actually did about a claim —
 *  again one per claim. Swept in by prefix for the same reason the
 *  plan is: the number of claims is not known here, and a key that
 *  neither the fixed list nor a prefix matched would be silently
 *  dropped from every backup and every handover link, which for this
 *  one would mean losing the evidence rather than the progress. */
export const JOURNAL_PREFIX = "rk-journal-";

export const FORMAT = "reject-kyun/case-backup";
export const VERSION = 1;

/* A fragment has no formal length limit, but proxies, chat clients
   and address bars all start truncating somewhere. Anything past this
   is a sign something unexpected got in, and a truncated case that
   restores half a plan is worse than one that refuses. */
export const MAX_TOKEN = 6000;

export interface Backup {
  format: string;
  version: number;
  savedAt: string;
  data: Record<string, string>;
}

function known(key: string): boolean {
  return (
    (KEYS as readonly string[]).includes(key) ||
    key.startsWith(PLAN_PREFIX) ||
    key.startsWith(JOURNAL_PREFIX)
  );
}

/** Everything this build has stored, from whatever storage exists. */
export function collect(storage: Storage): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (const key of KEYS) {
      const value = storage.getItem(key);
      if (value !== null) out[key] = value;
    }
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;
      if (key.startsWith(PLAN_PREFIX) || key.startsWith(JOURNAL_PREFIX)) {
        out[key] = storage.getItem(key) ?? "";
      }
    }
  } catch {
    // Private mode. Nothing to collect, and nothing to report.
  }
  return out;
}

/** Writes back only keys this build recognises, and reports how many.
 *  A file or a link from somewhere else would otherwise overwrite a
 *  member's real progress with whatever it happened to contain. */
export function restore(
  storage: Storage,
  data: Record<string, unknown>,
): number {
  let written = 0;
  for (const [key, value] of Object.entries(data)) {
    if (!known(key) || typeof value !== "string") continue;
    try {
      storage.setItem(key, value);
      written += 1;
    } catch {
      // Quota, or private mode. Keep going: a partial restore of the
      // plan is still better than none, and the count stays honest.
    }
  }
  return written;
}

export function wrap(data: Record<string, string>): Backup {
  return { format: FORMAT, version: VERSION, savedAt: new Date().toISOString(), data };
}

/** True where the object is one of ours and safe to read. */
export function isBackup(value: unknown): value is Backup {
  if (typeof value !== "object" || value === null) return false;
  const b = value as Partial<Backup>;
  return (
    b.format === FORMAT &&
    typeof b.data === "object" &&
    b.data !== null &&
    !Array.isArray(b.data)
  );
}

/* base64url rather than plain base64: a URL fragment carrying + and /
   survives most of the time and then does not, depending on whose
   chat client rewrote it. Padding is dropped for the same reason. */

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): Uint8Array {
  const padded = token
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(token.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** The case as a fragment token, or null if it is implausibly large. */
export function encode(data: Record<string, string>): string | null {
  const json = JSON.stringify(wrap(data));
  const token = toBase64Url(new TextEncoder().encode(json));
  return token.length > MAX_TOKEN ? null : token;
}

/** The data a token carries, or null if it is not one of ours.
 *  Never throws: this runs on whatever a stranger pasted. */
export function decode(token: string): Record<string, string> | null {
  if (!token || token.length > MAX_TOKEN) return null;
  try {
    const json = new TextDecoder().decode(fromBase64Url(token));
    const parsed: unknown = JSON.parse(json);
    if (!isBackup(parsed)) return null;

    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (known(key) && typeof value === "string") out[key] = value;
    }
    return out;
  } catch {
    return null;
  }
}

/** How many claims a payload carries progress for. Used to describe
 *  the thing in the interface before anybody agrees to load it. */
export function describe(data: Record<string, string>): {
  plans: number;
  journals: number;
  checklists: number;
  settings: number;
} {
  let plans = 0;
  let journals = 0;
  let checklists = 0;
  let settings = 0;
  for (const key of Object.keys(data)) {
    if (key.startsWith(PLAN_PREFIX)) plans += 1;
    else if (key.startsWith(JOURNAL_PREFIX)) journals += 1;
    else if (key === "rk-survivor-checklist") checklists += 1;
    else settings += 1;
  }
  return { plans, journals, checklists, settings };
}

/** The word for the count, so the interface never says "1 items". */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
