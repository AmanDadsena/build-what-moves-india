/* ============================================================
   What you did, and on what date.

   Every escalation route in this product asks the member, at some
   point, to establish that they asked first. A grievance is stronger
   for naming the day the employer was written to. An RTI first
   appeal turns on the date the original application was filed. A
   consumer or labour forum will ask what was done before it was
   approached, and a case that answers "I called them many times"
   loses to one that answers "on 12 June, 27 June and 14 July, and
   here are the reference numbers".

   Nothing in the real portal records any of this. There is no notes
   field, no call log, no place to put the reference number a helpline
   reads out once and never repeats. So a member spends four months
   accumulating exactly the evidence their case needs, and keeps none
   of it — and by the time somebody asks, the dates have blurred into
   "around March, I think".

   ------------------------------------------------------------
   Three decisions worth stating

   It records what happened, not what is planned. The plan already
   exists elsewhere in this product and it looks forward. This looks
   back, and the two are deliberately not merged: a list that mixes
   "I will write to them" with "I wrote to them" is a list nobody
   can rely on in front of an officer.

   The reference number is a first-class field, not a note. It is the
   single most valuable thing to come out of any interaction with any
   of these channels, it is offered exactly once, usually verbally,
   and an entry without one is worth a fraction of an entry with one.
   Giving it its own box is the interface saying: write this down.

   Nothing is required except a date and what happened. A form that
   demands the officer's name will be abandoned by somebody who did
   not catch it, and a half-remembered entry is still evidence where
   no entry is not.
   ============================================================ */

/** How the member reached, or was reached by, the other side. */
export type Channel =
  | "call"
  | "visit"
  | "email"
  | "letter"
  | "online"
  | "received";

export interface ChannelInfo {
  id: Channel;
  label: string;
  /** What to be sure to capture for this kind of contact. */
  capture: string;
  /** Whether this channel produces something the member holds. */
  leavesTrace: boolean;
}

export const CHANNELS: ChannelInfo[] = [
  {
    id: "call",
    label: "Phone call",
    capture:
      "Ask for a reference or docket number before the call ends. A call with no number left no record that it happened.",
    leavesTrace: false,
  },
  {
    id: "visit",
    label: "Visit in person",
    capture:
      "Note the counter or desk and the date. If you were sent away, write down what you were sent away to get.",
    leavesTrace: false,
  },
  {
    id: "email",
    label: "Email sent",
    capture:
      "Keep the sent copy. An email is proof of the asking whether or not it is answered.",
    leavesTrace: true,
  },
  {
    id: "letter",
    label: "Letter or form submitted",
    capture:
      "Keep the acknowledgement, the postal receipt or the stamped copy. Registered post costs little and proves delivery.",
    leavesTrace: true,
  },
  {
    id: "online",
    label: "Filed online",
    capture:
      "Screenshot the confirmation the moment it appears. Registration numbers are shown once and are hard to recover.",
    leavesTrace: true,
  },
  {
    id: "received",
    label: "Something arrived",
    capture:
      "A reply, an SMS, a rejection. Record what it said, because a later reply that contradicts it is worth pointing out.",
    leavesTrace: true,
  },
];

export function channelInfo(id: Channel): ChannelInfo {
  return CHANNELS.find((c) => c.id === id) ?? CHANNELS[0];
}

/** Who the member dealt with. Kept coarse on purpose: the useful
 *  distinction for an escalation is which institution was approached,
 *  not which individual. */
export type Counterparty = "epfo" | "employer" | "bank" | "helpline" | "other";

export const COUNTERPARTIES: Array<{ id: Counterparty; label: string }> = [
  { id: "epfo", label: "EPFO office" },
  { id: "employer", label: "Employer" },
  { id: "helpline", label: "Helpline" },
  { id: "bank", label: "Bank" },
  { id: "other", label: "Someone else" },
];

export function counterpartyLabel(id: Counterparty): string {
  return COUNTERPARTIES.find((c) => c.id === id)?.label ?? "Someone else";
}

export interface Entry {
  /** Stable id, so an edit or a delete can find its own row. */
  id: string;
  /** ISO date, day precision. Time of day is not evidence of anything. */
  on: string;
  channel: Channel;
  with: Counterparty;
  /** Reference, docket or registration number. The valuable field. */
  reference?: string;
  /** What was said or done, in the member's own words. */
  what: string;
  /** What it produced, where anything did. */
  outcome?: string;
}

export const STORAGE_PREFIX = "rk-journal-";

/** The key a claim's journal lives under. Mirrors the plan's
 *  convention so the case-backup sweep finds both by the same rule. */
export function storageKey(claimId: string): string {
  return STORAGE_PREFIX + claimId;
}

/* ------------------------------------------------------------------
   Reading and writing.

   Both are total: a corrupt or foreign value yields an empty journal
   rather than an exception, because the one thing worse than losing
   the log is a page that will not render because of it.
   ------------------------------------------------------------------ */

function isEntry(value: unknown): value is Entry {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Partial<Entry>;
  return (
    typeof e.id === "string" &&
    typeof e.on === "string" &&
    typeof e.what === "string" &&
    typeof e.channel === "string" &&
    typeof e.with === "string"
  );
}

export function parse(raw: string | null): Entry[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return sort(value.filter(isEntry));
  } catch {
    return [];
  }
}

export function serialise(entries: Entry[]): string {
  return JSON.stringify(sort(entries));
}

/** Newest first, which is the order somebody scanning for "when did I
 *  last chase this" reads in. Ties break on insertion order so two
 *  entries on one day keep the sequence they were written in. */
export function sort(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => (a.on < b.on ? 1 : a.on > b.on ? -1 : 0));
}

export function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

/* ------------------------------------------------------------------
   What the log is actually for.
   ------------------------------------------------------------------ */

export interface Summary {
  entries: number;
  /** Entries carrying a reference number — the ones that carry weight. */
  withReference: number;
  /** Entries on a channel that leaves the member holding something. */
  documented: number;
  /** ISO date of the earliest entry. */
  first?: string;
  /** ISO date of the most recent. */
  last?: string;
  /** Days between the first entry and today. */
  spanDays: number;
  /** Days since the last entry. Long silences are the thing to notice. */
  sinceLast: number;
  /** How many times the employer was approached, which is the number a
   *  grievance about an unresponsive employer turns on. */
  employerApproaches: number;
}

const DAY = 86_400_000;

function daysBetween(fromIso: string, to: Date): number {
  const from = new Date(fromIso + "T00:00:00");
  if (Number.isNaN(from.getTime())) return 0;
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / DAY));
}

export function summarise(entries: Entry[], today: Date = new Date()): Summary {
  const sorted = sort(entries);
  const oldest = sorted[sorted.length - 1];
  const newest = sorted[0];

  return {
    entries: sorted.length,
    withReference: sorted.filter((e) => (e.reference ?? "").trim().length > 0)
      .length,
    documented: sorted.filter((e) => channelInfo(e.channel).leavesTrace).length,
    first: oldest?.on,
    last: newest?.on,
    spanDays: oldest ? daysBetween(oldest.on, today) : 0,
    sinceLast: newest ? daysBetween(newest.on, today) : 0,
    employerApproaches: sorted.filter((e) => e.with === "employer").length,
  };
}

/* ------------------------------------------------------------------
   The chronology, as something to paste.

   This is the point of the whole feature. A grievance or an RTI that
   arrives with a dated list of what was already tried is a different
   document from one that arrives without: it moves the question from
   "have you tried asking" to "here is what asking produced".

   Rendered oldest-first, because a chronology submitted to anybody is
   read forwards even though the same list on screen is read
   backwards.
   ------------------------------------------------------------------ */

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function toChronology(entries: Entry[]): string {
  if (entries.length === 0) return "";

  const forwards = [...sort(entries)].reverse();

  const lines = forwards.map((e) => {
    const parts = [
      `${formatDate(e.on)} — ${channelInfo(e.channel).label}, ${counterpartyLabel(e.with)}.`,
      e.what.trim(),
    ];
    if (e.reference?.trim()) {
      parts.push(`Reference: ${e.reference.trim()}.`);
    }
    if (e.outcome?.trim()) {
      parts.push(`Result: ${e.outcome.trim()}`);
    }
    return parts.join(" ");
  });

  return lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
}

/** The chronology with the sentence that frames it, ready to drop
 *  into a grievance or an RTI application. */
export function toSubmission(entries: Entry[]): string {
  if (entries.length === 0) return "";
  const s = summarise(entries);

  const head =
    s.entries === 1
      ? "Record of action taken by the member:"
      : `Record of action taken by the member — ${s.entries} entries between ${formatDate(s.first!)} and ${formatDate(s.last!)}:`;

  const tail =
    s.employerApproaches >= 2
      ? `\n\nThe establishment was approached ${s.employerApproaches} times on the dates above without the matter being resolved.`
      : "";

  return `${head}\n\n${toChronology(entries)}${tail}`;
}
