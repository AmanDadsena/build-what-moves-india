import type { Clock, EscalationStep } from "./types";

/* ============================================================
   The escalation ladder, and the distinction that runs through it.

   A member chasing a stuck claim is given a series of numbers —
   20 days, 21 days, 30 days — and told to wait. They are not told
   that only one of those numbers is enforceable.

   A "soft" clock is an administrative service commitment. When it
   lapses, nothing happens. Nobody is penalised, no remedy opens,
   and in EPFO's case the count restarts each time a desk marks the
   file incomplete — so the same claim can sit for months without
   the commitment ever formally being breached.

   A "hard" clock is created by statute. When it lapses, a named
   consequence follows and a specific person becomes answerable.

   Teaching a member to tell the two apart is the point of this
   product. Everything else is scaffolding around that.
   ============================================================ */

export const CLOCKS: Record<string, Clock> = {
  "epfo-settlement": {
    id: "epfo-settlement",
    label: "EPFO claim settlement commitment",
    kind: "soft",
    days: 20,
    authority: "EPFO Citizen's Charter (service commitment)",
    consequence:
      "None. No penalty attaches, no remedy opens, and no officer becomes answerable. The count restarts each time a desk returns the file as incomplete, so a claim can pass this mark repeatedly without the commitment being recorded as breached.",
    resettable: true,
  },

  "employer-action": {
    id: "employer-action",
    label: "Employer action on KYC or exit date",
    kind: "soft",
    days: 15,
    authority: "No fixed statutory period for the member",
    consequence:
      "None directly enforceable by you. EPFO can act against an establishment for non-compliance, but you cannot compel your employer yourself — which is why this step exists mainly to build a written record for the ones that follow.",
    resettable: true,
  },

  epfigms: {
    id: "epfigms",
    label: "EPFiGMS grievance redressal",
    kind: "soft",
    days: 15,
    authority: "EPFO internal grievance mechanism",
    consequence:
      "None. The grievance can be closed with a reply that does not resolve anything, and closure is counted as disposal. Its real value is that it timestamps your complaint, which the later statutory steps rely on.",
    resettable: true,
  },

  cpgrams: {
    id: "cpgrams",
    label: "CPGRAMS grievance",
    kind: "soft",
    days: 21,
    authority:
      "Department of Administrative Reforms and Public Grievances policy",
    consequence:
      "None enforceable. A grievance may be marked disposed once a reply is uploaded, whether or not your claim moved. You may file one appeal against disposal.",
    resettable: false,
  },

  "rti-reply": {
    id: "rti-reply",
    label: "RTI reply from the Public Information Officer",
    kind: "hard",
    days: 30,
    authority: "Right to Information Act 2005, section 7(1)",
    consequence:
      "Silence is not neutral. Failure to reply within 30 days is a deemed refusal under section 7(2), which immediately opens your right of first appeal — and starts the clock on a personal penalty against the officer.",
    resettable: false,
  },

  "rti-first-appeal": {
    id: "rti-first-appeal",
    label: "First Appellate Authority decision",
    kind: "hard",
    days: 30,
    authority: "Right to Information Act 2005, section 19(1)",
    consequence:
      "The First Appellate Authority must dispose of the appeal within 30 days, extendable to 45 with recorded reasons. This is a senior officer inside the same office, now formally on record about your file.",
    resettable: false,
  },

  "rti-second-appeal": {
    id: "rti-second-appeal",
    label: "Second appeal to the Central Information Commission",
    kind: "hard",
    days: 90,
    authority: "Right to Information Act 2005, section 19(3)",
    consequence:
      "The Commission can direct disclosure and, under section 20(1), impose a penalty of ₹250 for each day of delay up to ₹25,000 — payable by the Public Information Officer personally, not by the department.",
    resettable: false,
  },
};

export const ESCALATION_LADDER: EscalationStep[] = [
  {
    id: "refile",
    order: 1,
    channel: "Unified Member Portal",
    actor: "member",
    what: "Correct the specific field that failed, then refile the claim. Most rejections never need to go further than this — but only if you know which field failed, which is exactly what the remark withholds.",
    clock: CLOCKS["epfo-settlement"],
    documents: [],
  },
  {
    id: "employer-email",
    order: 2,
    channel: "Written request to your employer",
    actor: "employer",
    what: "Where the pending action belongs to your employer, ask in writing and keep the reply. This is the cheapest step and the one that creates the paper trail everything after it depends on.",
    clock: CLOCKS["employer-action"],
    documents: ["employer-email"],
  },
  {
    id: "epfigms",
    order: 3,
    channel: "EPFiGMS",
    actor: "epfo",
    what: "Register the grievance against your establishment code and claim ID. Treat this as timestamping rather than as a remedy — its worth is evidentiary.",
    clock: CLOCKS.epfigms,
    documents: ["epfigms"],
  },
  {
    id: "cpgrams",
    order: 4,
    channel: "CPGRAMS",
    actor: "epfo",
    what: "Escalate above the Regional Office. Attach the EPFiGMS number and its outcome so the file cannot be closed as a first-time complaint.",
    clock: CLOCKS.cpgrams,
    documents: ["cpgrams"],
  },
  {
    id: "rti",
    order: 5,
    channel: "RTI application under section 6(1)",
    actor: "epfo",
    what: "Ask for the noting on your own file: every entry, with dates, designations and the reason recorded at each desk. This is the only route that legally compels an answer, and the answer is the internal reason you were never shown.",
    clock: CLOCKS["rti-reply"],
    documents: ["rti-notesheet"],
  },
  {
    id: "rti-appeal",
    order: 6,
    channel: "First appeal under section 19(1)",
    actor: "epfo",
    what: "If the 30 days pass in silence, that silence is itself a deemed refusal. Appeal on that ground — you do not need to wait any longer or ask again.",
    clock: CLOCKS["rti-first-appeal"],
    documents: ["rti-appeal"],
  },
];

/** Soft clocks reset; hard clocks do not. Given a filing date and a
 *  note sheet, this is how long a member has actually been waiting
 *  versus how long the institution considers itself to have been. */
export function clockArithmetic(
  filedOn: string,
  resets: number[],
  asOf: Date = new Date()
): { elapsedDays: number; officialDays: number; resetCount: number } {
  const filed = new Date(filedOn);
  const elapsedDays = Math.max(
    0,
    Math.floor((asOf.getTime() - filed.getTime()) / 86_400_000)
  );
  const lastReset = resets.length ? Math.max(...resets) : 0;
  return {
    elapsedDays,
    officialDays: Math.max(0, elapsedDays - lastReset),
    resetCount: resets.length,
  };
}
