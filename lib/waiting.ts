import { CLOCKS } from "./escalation";

/* ============================================================
   Still waiting.

   Most members with a problem have not been rejected. They are
   waiting, with a status that says "under process" and no way to tell
   whether that is normal, slow, or abandoned. Every piece of guidance
   they can find answers a different question — what to do once you
   have been refused — so the majority case is served worst.

   Two things this states that nothing else does.

   The first is that the twenty-day settlement commitment is not a
   deadline. It restarts every time a desk marks the file incomplete,
   and the member is not told when that happens. So a claim can sit
   for five months having never once formally breached a twenty-day
   commitment, and the institution's own records will show nothing
   wrong. The arithmetic below makes that visible: how many times the
   count could have restarted without anybody's figures looking bad.

   The second is about ordering. Every guidance document, including
   EPFO's own, places the RTI last — after the helpline, after the
   grievance, after the escalated grievance. But an RTI application
   about your own file can be made on the first day. It is the only
   instrument in the list that carries a deadline anybody has to keep,
   and it is placed at the end of the queue behind four things that
   carry none. Saying so is the single most useful thing this page
   does.
   ============================================================ */

export const COMMITMENT_DAYS = CLOCKS["epfo-settlement"].days;

export type Stage = "early" | "due" | "over" | "long" | "very-long";

export interface Route {
  id: string;
  channel: string;
  what: string;
  binding: "soft" | "hard";
  /** Days from filing before this may be used at all. */
  availableAfter: number;
  /** Days from filing before using it is a proportionate step. */
  sensibleAfter: number;
  /** What lapsing produces. Empty for soft routes is the point. */
  consequence: string;
  authority: string;
  href?: string;
}

export const ROUTES: Route[] = [
  {
    id: "employer",
    channel: "Written request to your employer",
    what: "Where anything is pending on their side — a KYC approval, an exit date, a signature — ask in writing and keep the reply. It is the cheapest step and the paper trail everything after it depends on.",
    binding: "soft",
    availableAfter: 0,
    sensibleAfter: 0,
    consequence:
      "Nothing enforceable by you. EPFO can act against an establishment; you cannot.",
    authority: "No statutory period applies to the member",
  },
  {
    id: "epfigms",
    channel: "EPFiGMS grievance",
    what: "Register the grievance against your establishment code and claim ID. Its value is evidentiary — it puts a dated complaint on the record that the later steps rely on.",
    binding: "soft",
    availableAfter: 0,
    sensibleAfter: COMMITMENT_DAYS,
    consequence:
      "None. It can be closed with a reply that resolves nothing, and closure counts as disposal.",
    authority: "EPFO internal grievance mechanism",
    href: "/help/",
  },
  {
    id: "cpgrams",
    channel: "CPGRAMS escalation",
    what: "Above the Regional Office. Attach the EPFiGMS number and its outcome, so it cannot be closed as a first-time complaint.",
    binding: "soft",
    availableAfter: 0,
    sensibleAfter: COMMITMENT_DAYS + 15,
    consequence:
      "None enforceable. It may be marked disposed once any reply is uploaded.",
    authority: "Department of Administrative Reforms policy",
  },
  {
    id: "rti",
    channel: "RTI application, section 6(1)",
    what: "Ask for the noting on your own file: every entry, with dates, designations and the reason recorded at each desk. This is the only route that legally compels an answer, and the answer is the internal reason you were never shown.",
    binding: "hard",
    availableAfter: 0,
    sensibleAfter: 30,
    consequence:
      "A reply is due in 30 days under section 7(1). Silence past that is a deemed refusal under section 7(2), which opens your appeal and starts a personal penalty running against the officer.",
    authority: "Right to Information Act 2005, section 6(1)",
    href: "/why/",
  },
];

export interface Assessment {
  filed: Date;
  elapsed: number;
  commitment: number;
  /** Days past the commitment, floored at zero. */
  overBy: number;
  /** How many times the count could have silently restarted. */
  possibleResets: number;
  stage: Stage;
  headline: string;
  routes: Array<
    Route & {
      openNow: boolean;
      proportionate: boolean;
      /** The date it becomes a proportionate step. */
      sensibleOn: Date;
    }
  >;
}

const DAY = 86_400_000;

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * DAY);
}

function stageOf(elapsed: number): Stage {
  if (elapsed < COMMITMENT_DAYS) return "early";
  if (elapsed === COMMITMENT_DAYS) return "due";
  if (elapsed <= 45) return "over";
  if (elapsed <= 120) return "long";
  return "very-long";
}

const HEADLINE: Record<Stage, string> = {
  early:
    "This is inside the commitment. Nothing is wrong yet, and there is one thing worth doing now rather than later.",
  due: "You have reached the commitment today. Passing it produces no consequence, which is worth knowing before you wait further.",
  over: "You are past the commitment. Nothing happened when you passed it, and nothing will.",
  long: "This is no longer ordinary slowness. The commitment has almost certainly been restarted without you being told.",
  "very-long":
    "A wait this long is not a queue. Something on the file is stopping it, and only one route can make anybody tell you what.",
};

export function assessWait(filedISO: string, now: Date = new Date()): Assessment | null {
  const filed = new Date(filedISO);
  if (Number.isNaN(filed.getTime())) return null;

  const elapsed = Math.max(0, Math.floor((now.getTime() - filed.getTime()) / DAY));
  const stage = stageOf(elapsed);

  return {
    filed,
    elapsed,
    commitment: COMMITMENT_DAYS,
    overBy: Math.max(0, elapsed - COMMITMENT_DAYS),
    /* Each reset gives the file a fresh twenty days, so this is how
       many times it could have been returned as incomplete while the
       institution's own record still shows nothing overdue. */
    possibleResets: Math.floor(elapsed / COMMITMENT_DAYS),
    stage,
    headline: HEADLINE[stage],
    routes: ROUTES.map((route) => ({
      ...route,
      openNow: elapsed >= route.availableAfter,
      proportionate: elapsed >= route.sensibleAfter,
      sensibleOn: addDays(filed, route.sensibleAfter),
    })),
  };
}
