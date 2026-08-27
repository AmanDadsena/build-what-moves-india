import type { Actor, Claim, RejectionReason } from "./types";
import { ESCALATION_LADDER } from "./escalation";

/* ============================================================
   The plan, and the dates it falls on.

   Everything else in this product explains. This is the part that
   accompanies. A rejected claim is not resolved in an afternoon — the
   median case here runs to twenty-six days if it goes well and four
   months if it does not — and across that span the member is expected
   to hold an ordered sequence of actions in their head, remember
   which of them they already did, and notice when a period has run
   out. Nothing in the real portal helps with any of that.

   Two design decisions are worth stating.

   The dates are relative and they move. Every item's date is computed
   by chaining durations forward from the last thing actually
   completed, not from a fixed schedule set on day one. A member who
   gets their employer's signature a fortnight late should see the
   whole remaining plan slide by a fortnight, because that is what
   really happened. A plan that keeps insisting on dates that have
   already passed stops being read.

   Soft and hard periods stay visibly different, as everywhere else
   here. A date on a soft item is a prompt to chase. A date on a hard
   item is a right becoming available. Presenting them as one list of
   deadlines would teach the exact confusion this product exists to
   undo.
   ============================================================ */

export type PlanKind = "fix" | "escalate";

export interface PlanItem {
  id: string;
  kind: PlanKind;
  title: string;
  detail: string;
  actor: Actor;
  /** Working days this step realistically takes once started. */
  days: number;
  where: string;
  /** Soft periods can be exceeded with no consequence. Hard ones
   *  create a right or a penalty when they lapse. */
  binding: "soft" | "hard";
  /** For a hard item, what lapsing actually produces. */
  consequence?: string;
  /** Documents this product can draft for this step. */
  documents: string[];
}

export interface DatedItem extends PlanItem {
  due: Date;
  done: boolean;
  doneOn?: Date;
  /** True when this is the earliest item still outstanding. */
  next: boolean;
  overdue: boolean;
}

export type PlanProgress = Record<string, string>; // item id -> ISO date done

export function buildPlan(
  claim: Claim,
  rejection: RejectionReason,
): PlanItem[] {
  const fixes: PlanItem[] = rejection.fixSteps.map((step, i) => ({
    id: `fix-${i}`,
    kind: "fix",
    title: step.instruction.split(/(?<=\.)\s/)[0],
    detail: step.instruction,
    actor: step.actor,
    days: step.days,
    where: step.where,
    binding: "soft",
    documents: [],
  }));

  /* Only the rungs this rejection actually needs, plus the two that
     always apply: refiling, and the RTI that is available whatever
     went wrong. */
  const ladder = ESCALATION_LADDER.filter(
    (step) =>
      step.id === "rti" ||
      step.id === "rti-appeal" ||
      rejection.escalation.includes(step.id),
  );

  const escalations: PlanItem[] = ladder.map((step) => ({
    id: `esc-${step.id}`,
    kind: "escalate",
    title: step.channel,
    detail: step.what,
    actor: step.actor,
    days: step.clock.days,
    where: step.channel,
    binding: step.clock.kind,
    consequence: step.clock.kind === "hard" ? step.clock.consequence : undefined,
    documents: step.documents,
  }));

  return [...fixes, ...escalations];
}

const DAY = 86_400_000;

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * DAY);
}

/** Chains the plan forward, rescheduling from whatever was last
 *  actually completed rather than from the original start. */
export function schedule(
  items: PlanItem[],
  progress: PlanProgress,
  start: Date = new Date(),
): DatedItem[] {
  let running = start;
  let nextTaken = false;
  const today = new Date();

  return items.map((item) => {
    const doneIso = progress[item.id];
    const doneOn = doneIso ? new Date(doneIso) : undefined;

    if (doneOn) {
      // A completed step moves the clock to when it was actually done.
      running = doneOn > running ? doneOn : running;
      return {
        ...item,
        due: doneOn,
        done: true,
        doneOn,
        next: false,
        overdue: false,
      };
    }

    const due = addDays(running, item.days);
    running = due;

    const isNext = !nextTaken;
    if (isNext) nextTaken = true;

    return {
      ...item,
      due,
      done: false,
      next: isNext,
      overdue: due < today,
    };
  });
}

export function remaining(items: DatedItem[]) {
  return items.filter((i) => !i.done);
}

/* ============================================================
   Calendar export.

   A plan that lives only on this site is a plan a member has to
   remember to come back to. Every phone already has something that
   interrupts you on a date, so the useful move is to put the dates
   there rather than to build a reminder system nobody asked for.

   RFC 5545 is fussy in three ways that quietly break an import, so
   all three are handled: text fields escape backslash, semicolon,
   comma and newline; lines fold at 75 octets with a leading space on
   the continuation; and an all-day event's DTEND is the day *after*
   the last day it covers.
   ============================================================ */

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function fold(line: string) {
  // Folding counts octets, not characters, so a Devanagari line
  // measured in characters would fold in the wrong place.
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;

  const out: string[] = [];
  let current = "";
  let width = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (width + size > (out.length === 0 ? 75 : 74)) {
      out.push(current);
      current = "";
      width = 0;
    }
    current += char;
    width += size;
  }
  if (current) out.push(current);
  return out.map((part, i) => (i === 0 ? part : " " + part)).join("\r\n");
}

function stamp(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate())
  );
}

export function toCalendar(
  items: DatedItem[],
  claim: Claim,
  rejection: RejectionReason,
): string {
  const now = new Date();
  const nowStamp =
    stamp(now) +
    "T" +
    String(now.getUTCHours()).padStart(2, "0") +
    String(now.getUTCMinutes()).padStart(2, "0") +
    String(now.getUTCSeconds()).padStart(2, "0") +
    "Z";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EPF Member Portal redesign concept//Case plan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`Provident fund claim ${claim.id}`)}`,
  ];

  for (const item of remaining(items)) {
    const summary =
      (item.binding === "hard" ? "Deadline: " : "Chase: ") + item.title;

    const description = [
      item.detail,
      "",
      `Whose action: ${
        item.actor === "member"
          ? "yours"
          : item.actor === "employer"
            ? "your employer's"
            : "EPFO's"
      }`,
      `Where: ${item.where}`,
      item.binding === "hard"
        ? `This period is statutory. ${item.consequence ?? ""}`
        : "This period is an administrative commitment and carries no penalty if it passes.",
      "",
      `Claim ${claim.id} — ${rejection.title}`,
      "Created by an independent prototype of a provident fund member portal. Not an official EPFO communication.",
    ].join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${claim.id}-${item.id}@epf-portal-concept.invalid`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;VALUE=DATE:${stamp(item.due)}`,
      `DTEND;VALUE=DATE:${stamp(addDays(item.due, 1))}`,
      fold(`SUMMARY:${escapeText(summary)}`),
      fold(`DESCRIPTION:${escapeText(description)}`),
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      fold(`DESCRIPTION:${escapeText(summary)}`),
      "END:VALARM",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
