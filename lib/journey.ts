import type { Claim, Desk } from "./types";
import { DESK_LABEL } from "./types";

/* ============================================================
   The claim journey.

   A member's first question is never "what was the noting on my
   file" — it is "where is it now, who has it, and what happens
   next". The portal answers that with one word: Under process.

   This reconstructs the actual path. It is derived from the same
   note sheet the case file shows, so the two can never contradict
   each other: the note sheet is what the office wrote, and this is
   what the member should have been able to see all along.
   ============================================================ */

export type StageState = "done" | "current" | "pending" | "failed";

export interface Stage {
  id: string;
  label: string;
  labelHi: string;
  desk?: Desk;
  state: StageState;
  /** Days after filing that this stage was reached. */
  day?: number;
  /** What happens at this stage, in the member's terms. */
  note: string;
  /** How many times the file was sent back from here. */
  returns?: number;
}

export interface Journey {
  stages: Stage[];
  /** Days the file has been open, or took to close. */
  totalDays: number;
  /** Times a desk sent it back, restarting the service clock. */
  resets: number;
  /** Who is holding it now, in plain words. */
  holder: string;
  /** The single next thing that has to happen. */
  nextStep: string;
  outcome: "settled" | "rejected" | "moving";
}

const PIPELINE: Array<{
  id: string;
  label: string;
  labelHi: string;
  desk?: Desk;
  note: string;
}> = [
  {
    id: "filed",
    label: "You filed it",
    labelHi: "आपने दाखिल किया",
    note: "Your claim entered the system and was given an ID.",
  },
  {
    id: "scrutiny",
    label: "First scrutiny",
    labelHi: "प्रारंभिक जाँच",
    desk: "dealing-assistant",
    note: "Your identity records are matched against Aadhaar. Most claims that fail, fail here.",
  },
  {
    id: "verification",
    label: "Verification",
    labelHi: "सत्यापन",
    desk: "section-supervisor",
    note: "Service history and eligibility are checked against your employer's filings.",
  },
  {
    id: "accounts",
    label: "Accounts check",
    labelHi: "लेखा जाँच",
    desk: "accounts-officer",
    note: "The amount payable is computed and the ledger balance confirmed.",
  },
  {
    id: "approval",
    label: "Approval",
    labelHi: "स्वीकृति",
    desk: "assistant-commissioner",
    note: "The officer with authority to release the money signs it off.",
  },
  {
    id: "payment",
    label: "Payment",
    labelHi: "भुगतान",
    note: "The amount is transferred to your verified bank account.",
  },
];

export function journey(claim: Claim): Journey {
  const notes = claim.noteSheet ?? [];
  const resets = notes.filter((n) => n.resetsClock).length;

  /* Map each desk that acted onto its pipeline stage, taking the
     earliest day that desk touched the file. */
  const reachedOn = new Map<Desk, number>();
  for (const n of notes) {
    if (!reachedOn.has(n.desk)) reachedOn.set(n.desk, n.dayOffset);
  }
  const returnsByDesk = new Map<Desk, number>();
  for (const n of notes) {
    if (n.resetsClock) {
      returnsByDesk.set(n.desk, (returnsByDesk.get(n.desk) ?? 0) + 1);
    }
  }

  const rejectedAt = notes.find((n) => n.action === "rejected")?.desk;
  const rejectedDay = notes.find((n) => n.action === "rejected")?.dayOffset;

  const settled = claim.status === "settled";
  const rejected = claim.status === "rejected";

  const stages: Stage[] = PIPELINE.map((stage) => {
    // Filing always happened.
    if (stage.id === "filed") {
      return { ...stage, state: "done" as StageState, day: 0 };
    }

    // Payment only for settled claims.
    if (stage.id === "payment") {
      if (settled) {
        const days = claim.settledOn
          ? Math.round(
              (+new Date(claim.settledOn) - +new Date(claim.filedOn)) / 86_400_000
            )
          : undefined;
        return { ...stage, state: "done" as StageState, day: days };
      }
      return { ...stage, state: "pending" as StageState };
    }

    const desk = stage.desk!;

    if (settled) {
      // A settled claim passed every desk; spread the days evenly when
      // we have no noting, which we say plainly in the interface.
      return { ...stage, state: "done" as StageState };
    }

    const day = reachedOn.get(desk);
    const returns = returnsByDesk.get(desk);

    if (rejected && desk === rejectedAt) {
      return {
        ...stage,
        state: "failed" as StageState,
        day: rejectedDay,
        returns,
      };
    }
    if (day !== undefined) {
      return { ...stage, state: "done" as StageState, day, returns };
    }
    return { ...stage, state: "pending" as StageState };
  });

  const lastDay = notes.length ? notes[notes.length - 1].dayOffset : 0;
  const totalDays = settled && claim.settledOn
    ? Math.round(
        (+new Date(claim.settledOn) - +new Date(claim.filedOn)) / 86_400_000
      )
    : lastDay;

  const holder = settled
    ? "Nobody — it is closed and paid."
    : rejected
      ? `Nobody. It stopped at the ${
          rejectedAt ? DESK_LABEL[rejectedAt].full : "approval"
        } desk and will not move again on its own.`
      : "The office. It has not come back to you.";

  const nextStep = settled
    ? "Nothing. This one is done."
    : rejected
      ? "Correct the specific field that failed, then file again. Nothing happens until you do."
      : "Wait, or put it on record — waiting alone does not start any clock that binds anyone.";

  return {
    stages,
    totalDays,
    resets,
    holder,
    nextStep,
    outcome: settled ? "settled" : rejected ? "rejected" : "moving",
  };
}
