import { ESCALATION_LADDER } from "./escalation";
import type { EscalationStep } from "./types";

/* ============================================================
   What a route actually costs the person taking it.

   Every list of options in this domain — ours included, until now —
   is priced in days. File a grievance, wait fifteen days. Apply under
   the RTI Act, thirty days. Which is the right unit for the office
   and the wrong one for the member, because days are not what a route
   costs them.

   What it costs them is a day's wages.

   A member earning ₹600 a day who takes a morning off to reach a
   regional office has spent ₹600 before the bus fare, and a queue
   that overruns costs the whole day. Set against that, every fee in
   this entire process is a rounding error: the RTI application is
   ₹10, the appeal is free, the grievance is free, the forms are free.
   The expensive thing is never the fee. It is the travel and the lost
   shift, and nobody prices those because nobody in the building loses
   a shift.

   Two consequences follow, and both are worth putting in front of
   somebody.

   The cheapest routes are the ones nobody mentions. An RTI costs ten
   rupees and a stamp and needs no travel at all. A visit to a counter
   to ask the same question costs a day of somebody's life. They are
   presented to members as though they were comparable options.

   And "just go to the office" is advice with a price on it. It is
   given freely, by helplines, by relatives, by this kind of site. For
   a daily-wage member with a four-hour journey it is a
   thousand-rupee instruction, and it should be said out loud that
   that is what it is.

   ------------------------------------------------------------
   What the numbers are and are not

   The fees are real and published. The travel and the queue are
   estimates, and the interface says so — an office forty minutes away
   is not an office four hours away, and this cannot know which one a
   member has. They are there to get the comparison right, not the
   total: the ratio between a route with no travel and a route with
   two trips holds however wrong the individual numbers are.
   ============================================================ */

export type Effort = "none" | "some" | "high";

export interface RouteCost {
  id: string;
  /** Matches an escalation step where there is one. */
  label: string;
  /** Fees, in rupees. Published, and almost always nothing. */
  fee: number;
  /** What the fee is, where there is one. */
  feeNote?: string;
  /** Trips to an office, a bank or a post office. */
  trips: number;
  /** Whole working days lost, including the queue and the journey. */
  daysOff: number;
  /** Out-of-pocket beyond the fee: fare, photocopies, postage. */
  incidentals: number;
  /** Elapsed days before an answer is due or expected. */
  elapsedDays: number;
  /** Whether the elapsed period binds anybody. */
  binding: "soft" | "hard";
  effort: Effort;
  /** The thing worth knowing before choosing it. */
  note: string;
}

/* Estimates, stated once here rather than scattered through the
   interface. A bus fare and a photocopy are small and local; the
   figures below are the ones this page shows and can be argued with
   in one place. */
const FARE_PER_TRIP = 120;

/* Rule 4 of the RTI Rules 2012 charges ₹2 a page for a copy on A4 or
   smaller, on top of the ₹10 application fee under rule 3. A note
   sheet with its deficiency memos and order sheet runs to more pages
   than people expect, so it is worth naming — and worth naming
   alongside section 7(6), which waives it entirely when the reply is
   late. */
const RTI_PER_PAGE = 2;
const PHOTOCOPY = 30;
const REGISTERED_POST = 45;

export const ROUTE_COSTS: RouteCost[] = [
  {
    id: "portal",
    label: "Refile on the member portal",
    fee: 0,
    trips: 0,
    daysOff: 0,
    incidentals: 0,
    elapsedDays: 20,
    binding: "soft",
    effort: "none",
    note: "Costs nothing and needs no travel. Also achieves nothing at all if the underlying record is still wrong, which is why it is worth being sure before refiling rather than after.",
  },
  {
    id: "employer-email",
    label: "Write to your employer",
    fee: 0,
    trips: 0,
    daysOff: 0,
    incidentals: 0,
    elapsedDays: 15,
    binding: "soft",
    effort: "none",
    note: "An email costs nothing and creates the written record every later step relies on. Registered post costs a little more and proves delivery, which matters where the employer may later say they were never asked.",
  },
  {
    id: "employer-post",
    label: "Written request by registered post",
    fee: 0,
    trips: 1,
    daysOff: 0,
    incidentals: REGISTERED_POST + PHOTOCOPY + FARE_PER_TRIP,
    elapsedDays: 20,
    binding: "soft",
    effort: "some",
    note: "A post office is nearer than a regional office and the trip rarely costs a whole day. What you are buying is the acknowledgement, which is the difference between having asked and being able to show you asked.",
  },
  {
    id: "epfigms",
    label: "Raise a grievance on EPFiGMS",
    fee: 0,
    trips: 0,
    daysOff: 0,
    incidentals: 0,
    elapsedDays: 15,
    binding: "soft",
    effort: "none",
    note: "Free, online, and the reply may resolve nothing — a grievance can be closed with an answer that does not answer, and closure counts as disposal. Its value is the timestamp the statutory steps later rest on.",
  },
  {
    id: "office-visit",
    label: "Visit the regional office",
    fee: 0,
    trips: 1,
    daysOff: 1,
    incidentals: FARE_PER_TRIP + PHOTOCOPY,
    elapsedDays: 1,
    binding: "soft",
    effort: "high",
    note: "The most expensive thing on this list and the one most often recommended. A counter can look up your file and tell you what it says; it cannot approve what your employer has not, and being sent away for one missing paper costs the whole day again.",
  },
  {
    id: "attestation",
    label: "Get a form attested by a bank manager",
    fee: 0,
    trips: 1,
    daysOff: 0,
    incidentals: FARE_PER_TRIP + PHOTOCOPY,
    elapsedDays: 3,
    binding: "soft",
    effort: "some",
    note: "The branch is usually near and the signature takes minutes. Fill the form before you go: an attesting authority signs what is in front of them, and a half-filled form is a second trip.",
  },
  {
    id: "rti",
    label: "Apply under the Right to Information Act",
    fee: 10,
    feeNote:
      "₹10 to apply, nothing at all if you hold a below-poverty-line card — and no charge for the pages if they answer late",
    trips: 0,
    daysOff: 0,
    incidentals: REGISTERED_POST,
    elapsedDays: 30,
    binding: "hard",
    effort: "none",
    note: "The cheapest instrument here and the only one with a deadline behind it. Thirty days, then a deemed refusal, and a penalty of ₹250 a day on the officer personally. It can be filed online without leaving the house — and section 7(6) says that where they miss the thirty days, the information itself must be supplied free of charge, so the per-page copying fee falls away too.",
  },
  {
    id: "rti-appeal",
    label: "First appeal under section 19(1)",
    fee: 0,
    feeNote: "No fee. An appeal is free by statute",
    trips: 0,
    daysOff: 0,
    incidentals: REGISTERED_POST,
    elapsedDays: 30,
    binding: "hard",
    effort: "none",
    note: "Free, and the step most people never take because nobody tells them silence is itself an appealable refusal. It does not need a lawyer and it does not need a hearing.",
  },
];

/** What a copy costs per page under rule 4, and what section 7(6)
 *  does to that when the authority is late.
 *
 *  This is the only place in the whole process where the office's
 *  delay costs the office rather than the member. Everywhere else a
 *  late reply means another trip, another day off, another fare. Here
 *  it means the pages arrive free and a penalty starts running
 *  against the officer personally. Worth stating on a page whose
 *  argument is that delay is always paid for by the person waiting. */
export const RTI_COPY = {
  perPage: RTI_PER_PAGE,
  applicationFee: 10,
  waivedWhenLate: true,
} as const;

export function routeCost(id: string): RouteCost | undefined {
  return ROUTE_COSTS.find((r) => r.id === id);
}

/** The escalation step a costed route corresponds to, where one
 *  exists. Some routes here — the office visit, the attestation —
 *  are not rungs on the ladder at all, which is itself worth
 *  noticing: the two most expensive things a member does are not
 *  steps in any documented process. */
export function ladderStep(id: string): EscalationStep | undefined {
  const map: Record<string, string> = {
    portal: "epfo-settlement",
    "employer-email": "employer-email",
    "employer-post": "employer-email",
    epfigms: "epfigms",
    rti: "rti",
    "rti-appeal": "rti-appeal",
  };
  const stepId = map[id];
  return stepId
    ? ESCALATION_LADDER.find((s) => s.id === stepId)
    : undefined;
}

export interface Priced extends RouteCost {
  /** Wages forgone, at the member's own daily rate. */
  wagesLost: number;
  /** Everything, in rupees. */
  total: number;
}

/** Prices every route at a given daily wage.
 *
 *  A wage of zero is meaningful rather than missing: a member who is
 *  not currently earning loses no wages by going, and the ordering
 *  that produces is the true one for them. */
export function priceAll(dailyWage: number): Priced[] {
  const wage = Number.isFinite(dailyWage) && dailyWage > 0 ? dailyWage : 0;

  return ROUTE_COSTS.map((r) => {
    const wagesLost = Math.round(r.daysOff * wage);
    return {
      ...r,
      wagesLost,
      total: r.fee + r.incidentals + wagesLost,
    };
  });
}

/** Cheapest first. Ties break towards the route that binds somebody,
 *  because between two routes of equal price the one with a deadline
 *  behind it is strictly the better use of the money. */
export function byCost(priced: Priced[]): Priced[] {
  return [...priced].sort((a, b) => {
    if (a.total !== b.total) return a.total - b.total;
    if (a.binding !== b.binding) return a.binding === "hard" ? -1 : 1;
    return a.elapsedDays - b.elapsedDays;
  });
}

export interface Comparison {
  cheapest: Priced;
  dearest: Priced;
  /** How many routes cost nothing but the member's attention. */
  free: number;
  /** The multiple between the dearest and the cheapest that is not
   *  free, which is the number worth saying out loud. */
  ratio: number;
  /** Total wages forgone if somebody did every route needing a trip. */
  ifYouDidEverything: number;
}

export function compare(priced: Priced[]): Comparison {
  const sorted = byCost(priced);
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];
  const cheapestPaid = sorted.find((r) => r.total > 0);

  return {
    cheapest,
    dearest,
    free: sorted.filter((r) => r.total === 0).length,
    ratio:
      cheapestPaid && cheapestPaid.total > 0
        ? Math.round((dearest.total / cheapestPaid.total) * 10) / 10
        : 0,
    ifYouDidEverything: sorted.reduce((sum, r) => sum + r.total, 0),
  };
}

export const EFFORT_LABEL: Record<Effort, { label: string; tag: string }> = {
  none: { label: "No travel", tag: "tag-ok" },
  some: { label: "A short trip", tag: "tag-info" },
  high: { label: "A day of your life", tag: "tag-warn" },
};
