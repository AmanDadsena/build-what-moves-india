/* ============================================================
   The service map.

   One source of truth for what this portal offers, used by the
   landing page and by the portal navigation, so the two can never
   disagree about what exists.

   The set mirrors the services a member actually has on the real
   unified member portal — passbook, claims, KYC, e-nomination,
   transfer, exit marking, corrections, grievance, pension and the
   digital life certificate. What differs is the `change` line: for
   each one, the single thing we do that the original does not.
   ============================================================ */

export type ServiceCategory =
  | "Your money"
  | "Claims"
  | "Your identity"
  | "When it goes wrong";

export interface Service {
  id: string;
  /** Path under /portal/[uan]. Empty string is the overview itself. */
  path: string;
  title: string;
  titleHi: string;
  /** Short nav label. */
  nav: string;
  category: ServiceCategory;
  /** The EPFO form this corresponds to, where there is one. */
  formLabel?: string;
  blurb: string;
  /** The one thing we do here that the original does not. */
  change: string;
  /** Shown in the portal's own service index. */
  inNav: boolean;
}

export const SERVICES: Service[] = [
  {
    id: "overview",
    path: "",
    title: "Overview",
    titleHi: "सारांश",
    nav: "Overview",
    category: "Your money",
    blurb:
      "Balance, service history and anything currently blocking you, on one screen.",
    change:
      "A blocked claim is the first thing you see, with the fix as a button — not a row in a table.",
    inNav: true,
  },
  {
    id: "passbook",
    path: "/passbook",
    title: "Passbook",
    titleHi: "पासबुक",
    nav: "Passbook",
    category: "Your money",
    blurb:
      "Every month of contributions, with wages, your share, your employer's and the pension split.",
    change:
      "Reads on a phone, and flags the month your contributions stopped — usually the first sign of trouble.",
    inNav: true,
  },
  {
    id: "file-claim",
    path: "/file",
    title: "File a claim",
    titleHi: "दावा दाखिल करें",
    nav: "File a claim",
    category: "Claims",
    formLabel: "Form 19 · 31 · 10C",
    blurb:
      "Withdraw your fund, take an advance, or claim pension withdrawal benefit.",
    change:
      "Checks every field that could get you rejected before you submit, instead of telling you weeks later.",
    inNav: true,
  },
  {
    id: "claims",
    path: "/claims",
    title: "Track your claims",
    titleHi: "दावों की स्थिति",
    nav: "Claims",
    category: "Claims",
    blurb:
      "Every claim on your UAN, with what happened to it and where it stands.",
    change:
      "A rejected claim opens a case file that decodes the remark and drafts your escalation.",
    inNav: true,
  },
  {
    id: "records",
    path: "/records",
    title: "Your records",
    titleHi: "आपके अभिलेख",
    nav: "Your records",
    category: "Your identity",
    blurb:
      "Aadhaar, PAN, bank and employer records, and whether each is verified.",
    change:
      "Cross-checks them character by character and ranks what would actually block a claim.",
    inNav: true,
  },
  {
    id: "nomination",
    path: "/nomination",
    title: "Nomination",
    titleHi: "नामांकन",
    nav: "Nomination",
    category: "Your identity",
    formLabel: "Form 2",
    blurb:
      "Name who receives your provident fund and pension if you die.",
    change:
      "Says plainly what happens if you leave it blank, which is the reason most people never file one.",
    inNav: true,
  },
  {
    id: "transfer",
    path: "/transfer",
    title: "Transfer old accounts",
    titleHi: "पुराना खाता स्थानांतरण",
    nav: "Transfer",
    category: "Your identity",
    formLabel: "Form 13",
    blurb:
      "Bring provident fund from an earlier employer into your current account.",
    change:
      "Shows what a split account costs you in pension eligibility, not just the fund balance.",
    inNav: true,
  },
  {
    id: "leaving",
    path: "/leaving",
    title: "Leaving a job",
    titleHi: "नौकरी छोड़ रहे हैं",
    nav: "Leaving a job",
    category: "Your identity",
    blurb:
      "The four things to settle with your fund before your last day.",
    change:
      "Says it before you leave, while your employer still has a reason to help — not after, when nothing can be fixed.",
    inNav: true,
  },
  {
    id: "exit",
    path: "/exit",
    title: "Mark your exit",
    titleHi: "निकास दर्ज करें",
    nav: "Mark exit",
    category: "Your identity",
    blurb:
      "Record the date you left an employer, when they never did it themselves.",
    change:
      "Tells you whether you are eligible to do it yourself today, and to the day when you will be.",
    inNav: true,
  },
  {
    id: "correct",
    path: "/correct",
    title: "Correct your details",
    titleHi: "विवरण सुधारें",
    nav: "Corrections",
    category: "Your identity",
    formLabel: "Joint Declaration",
    blurb:
      "Fix a name, date of birth or relation name held against your UAN.",
    change:
      "Generates the signed declaration for you and says exactly who has to countersign it.",
    inNav: true,
  },
  {
    id: "summary",
    path: "/summary",
    title: "Case summary",
    titleHi: "मामले का सारांश",
    nav: "Case summary",
    category: "When it goes wrong",
    blurb:
      "One printable page carrying every fact somebody helping you would need.",
    change:
      "Written to be handed to a relative, an NGO worker or a lawyer — the people who actually pursue most of these.",
    inNav: true,
  },
  {
    id: "ask",
    path: "/ask",
    title: "Ask a question",
    titleHi: "सवाल पूछें",
    nav: "Ask",
    category: "When it goes wrong",
    blurb:
      "Sourced answers about claims, deadlines, corrections and escalation.",
    change:
      "Answers are retrieved from cited sources, never generated — so it cannot invent a deadline that does not exist.",
    inNav: true,
  },
  {
    id: "grievance",
    path: "/grievance",
    title: "Raise a grievance",
    titleHi: "शिकायत दर्ज करें",
    nav: "Grievance",
    category: "When it goes wrong",
    formLabel: "EPFiGMS",
    blurb:
      "Register a complaint against your establishment or the regional office.",
    change:
      "Writes the complaint so it cannot be closed without an answer, and tells you what it is worth.",
    inNav: true,
  },
  {
    id: "paycheck",
    path: "/paycheck",
    title: "Where the money went",
    titleHi: "पैसा कहाँ गया",
    nav: "Where it went",
    category: "Your money",
    blurb:
      "One month of contributions recomputed from the rules, including the part diverted to pension.",
    change:
      "Names the month your pension stopped growing with your salary, and what the ceiling has cost since.",
    inNav: true,
  },
  {
    id: "growth",
    path: "/growth",
    title: "If you leave it alone",
    titleHi: "अगर आप इसे छोड़ दें",
    nav: "If you leave it",
    category: "Your money",
    blurb:
      "What this balance becomes if it stays where it is, and what taking it out today costs.",
    change:
      "Projects a band rather than a single figure, because the interest rate is declared yearly and nobody can promise one.",
    inNav: true,
  },
  {
    id: "pension",
    path: "/pension",
    title: "Pension",
    titleHi: "पेंशन",
    nav: "Pension",
    category: "Your money",
    formLabel: "EPS-95 · Form 10C · 10D",
    blurb:
      "Your pension service, what you have qualified for, and what you have not.",
    change:
      "Counts your qualifying service in years and months and says what you still need.",
    inNav: true,
  },
  {
    id: "life-certificate",
    path: "/life-certificate",
    title: "Life certificate",
    titleHi: "जीवन प्रमाण",
    nav: "Life certificate",
    category: "Your money",
    formLabel: "Jeevan Pramaan",
    blurb:
      "The annual proof a pensioner must submit to keep their pension running.",
    change:
      "Says when yours is due and what stops in which month if it is missed.",
    inNav: true,
  },
];

export const SERVICE_BY_ID = new Map(SERVICES.map((s) => [s.id, s]));

export function servicesByCategory(): Array<[ServiceCategory, Service[]]> {
  const order: ServiceCategory[] = [
    "Your money",
    "Claims",
    "Your identity",
    "When it goes wrong",
  ];
  return order.map((c) => [c, SERVICES.filter((s) => s.category === c)]);
}
