import { REJECTIONS } from "./rejections";
import type { Provenance, RejectionReason } from "./types";

/* ============================================================
   When there is no employer left to ask.

   Nine of the fifteen rejection reasons in this knowledge base
   contain at least one step whose actor is the employer. Read them
   in order and they are perfectly sensible instructions — ask your
   employer to approve the KYC, ask them to mark the date of exit,
   ask them to countersign the Joint Declaration. Every one of them
   assumes a company that exists, answers its post, and has somebody
   still authorised to sign.

   A great many members do not have that. The establishment closed.
   It was a contractor who moved on. It was a staffing agency whose
   client changed. It still trades but nobody returns the call, and
   there is no penalty anywhere for not returning it. At that point
   the member is holding a set of instructions that cannot be
   followed, and the portal — and, until now, this site — simply
   stops talking.

   ------------------------------------------------------------
   The reframe this module is built on

   An employer's attestation is not new information. It is a
   signature confirming facts the same employer already filed with
   EPFO, every month, in the electronic challan-cum-return: that this
   member worked there, on these wages, from this date. EPFO holds
   all of it. The attestation is a countersignature on a record the
   office is already sitting on.

   Once that is said plainly, the question changes. It stops being
   "how do I find a company that no longer exists" and becomes "how
   do I get the office to read its own file" — and that second
   question has answers, several of which need nobody's cooperation
   at all.

   ------------------------------------------------------------
   What this module refuses to do

   It does not promise an outcome. Some of these routes are ordinary
   and quick; some depend on an officer exercising judgement, and an
   officer exercising judgement can decide either way. Where that is
   true it is said. A page that told a member with a closed
   establishment that this was all straightforward would be the same
   failure as the remark that sent them here.
   ============================================================ */

/** The three ways an employer stops being available. They are not
 *  interchangeable: what you can prove, and which route opens,
 *  differs for each. */
export type Situation = "closed" | "refusing" | "untraceable";

export interface SituationInfo {
  id: Situation;
  label: string;
  /** How a member recognises they are in this one. */
  recognise: string;
  /** The distinction that matters procedurally. */
  consequence: string;
  /** What establishes it, in the sense of something an office accepts. */
  establishBy: string[];
}

export const SITUATIONS: SituationInfo[] = [
  {
    id: "closed",
    label: "The establishment has closed",
    recognise:
      "The company has shut, been struck off, gone into liquidation, or was a contractor whose contract ended and who no longer files anything.",
    consequence:
      "There is no authorised signatory in existence, so no amount of asking will produce one. This is the strongest position to be in, oddly: an office cannot ask you to obtain a signature from a party that has ceased to exist, and the procedure recognises that.",
    establishBy: [
      "The establishment's contribution history in your own passbook, which stops on a particular month and never resumes.",
      "A Ministry of Corporate Affairs record showing the company struck off, dissolved or under liquidation, if it was a registered company.",
      "Returned post — a letter sent to the registered address and returned undelivered is itself evidence, and costs the price of a registered envelope.",
      "EPFO's own establishment search, which shows whether the code is still filing returns.",
    ],
  },
  {
    id: "refusing",
    label: "They exist, but will not act",
    recognise:
      "The company trades, the office is there, somebody answers — and the request has been made three times and nothing has happened.",
    consequence:
      "Procedurally the hardest of the three, because the office can always say the employer is available. What changes it is a written record: an unanswered written request is a fact, where an unanswered phone call is not.",
    establishBy: [
      "A dated written request, sent by email or by registered post, with no reply. This is why the request should never be made by telephone alone.",
      "The postal acknowledgement, or the email with its sent timestamp.",
      "A second and third request at intervals, which together establish a pattern rather than an oversight.",
    ],
  },
  {
    id: "untraceable",
    label: "You cannot find them",
    recognise:
      "You were placed by an agency, or worked at a site for a contractor whose name you never fully knew, or the company was renamed, merged or moved and nothing you have leads anywhere.",
    consequence:
      "Your passbook still names the establishment code that was contributing for you, and an establishment code is a permanent identifier. You may not know who they were. EPFO does.",
    establishBy: [
      "The establishment code from your own passbook — every contribution row carries it, and it is the identifier the office works from, not the trading name.",
      "Your appointment letter, salary slips, identity card or attendance record, any of which ties you to the workplace.",
      "The names of two colleagues from the same establishment, whose UANs will carry the same code.",
    ],
  },
];

/* ------------------------------------------------------------------
   The routes.

   Ordered by whose permission they need, which is the only ordering
   that helps somebody who has just discovered they need nobody's.
   ------------------------------------------------------------------ */

export type Dependency =
  /** Works today, needs nobody's agreement. */
  | "nobody"
  /** Needs a third party who is obliged, or paid, to help. */
  | "third-party"
  /** Needs an EPFO officer to exercise judgement. */
  | "officer"
  /** Compels a response with a deadline behind it. */
  | "statutory";

export interface Route {
  id: string;
  title: string;
  /** One line, for the card. */
  summary: string;
  dependency: Dependency;
  provenance: Provenance;
  /** What it actually is. */
  detail: string;
  /** Concrete steps. */
  steps: string[];
  /** Which situations it is available in. */
  situations: Situation[];
  /** Honest limits. Never empty — every route has one. */
  limit: string;
  /** Where in this site the member goes next. */
  link?: { href: string; label: string };
}

export const ROUTES: Route[] = [
  {
    id: "aadhaar-claim",
    title: "The claim that never needed them",
    summary:
      "Where your UAN is Aadhaar-verified and your bank is seeded, a claim carries no employer attestation at all.",
    dependency: "nobody",
    provenance: "verified",
    detail:
      "The composite claim form exists in two versions, and almost nobody is told there are two. The older one has a box for the employer's signature. The Aadhaar-based one does not: where the UAN is activated, Aadhaar is verified against it, and the bank account is seeded and approved, the member submits directly and the employer is not in the transaction. A member who has been chasing a signature for four months is sometimes three verifications away from not needing it.",
    steps: [
      "Check that your UAN is activated and that Aadhaar shows as verified against it.",
      "Check that your bank account and IFSC are seeded and approved. This is the one that is most often half-finished — the member entered the account and nobody approved it.",
      "Where all three are in place, file online. There is no employer step in this route.",
      "Where the bank seeding is the part that is stuck, that is itself an employer-approval problem, and the routes below apply to it.",
    ],
    situations: ["closed", "refusing", "untraceable"],
    limit:
      "It resolves nothing where the record itself is wrong. A name that does not match Aadhaar will fail this route exactly as it failed the last one — but it will fail in a day rather than in six weeks.",
    link: { href: "/why/bank-not-seeded/", label: "If the bank seeding is what is stuck" },
  },
  {
    id: "self-exit",
    title: "Marking your own exit",
    summary:
      "Two months after your last contribution you can record the date of exit yourself. No employer, no form, no fee.",
    dependency: "nobody",
    provenance: "verified",
    detail:
      "A missing date of exit is one of the most common reasons a final settlement is rejected, and for years the only cure was an employer who could be bothered to update it. That changed: a member may record their own date of exit through the member portal once two months have passed since the last contribution was received. It is a genuine remedy, it costs nothing, and the number of people who have never heard of it is the reason this site exists.",
    steps: [
      "Wait until two months have passed since the last contribution appears in your passbook. Before that the option is not offered.",
      "Sign in to the member portal, and record the exit date and the reason for leaving.",
      "Verify with the Aadhaar OTP. It takes effect immediately.",
      "Give it a day, then reopen the passbook and confirm the date is showing before you refile anything.",
    ],
    situations: ["closed", "refusing", "untraceable"],
    limit:
      "The date you enter should be the date you actually stopped, and it must sit after the last month a contribution was received. A date that contradicts the contribution history creates a second problem in place of the first.",
    link: { href: "/why/exit-date-missing/", label: "The rejection this cures" },
  },
  {
    id: "other-attesters",
    title: "Somebody else signs it",
    summary:
      "Where a form does need attesting, EPFO's own form names eight authorities who may do it instead of the employer.",
    dependency: "third-party",
    provenance: "verified",
    detail:
      "This is printed on the claim form itself, and it is one of the best-kept open secrets in the scheme. Where the employer cannot attest, the attestation may be made by any of a list of designated authorities — most usefully, the manager of the bank branch where the account is held, who is sitting in a building the member can walk into. It is not a favour and it is not irregular. It is the form's own instruction.",
    steps: [
      "Print the non-Aadhaar composite claim form.",
      "Fill it completely before you go. An attesting authority signs what is in front of them; they do not fill it in.",
      "Take it, with your passbook and identity proof, to whichever of the authorities below is nearest.",
      "Ask for the seal as well as the signature, with a designation and a date. An unsealed signature is the most common reason one of these comes back.",
    ],
    situations: ["closed", "refusing", "untraceable"],
    limit:
      "An attesting authority confirms your identity and that the form is yours. None of them can confirm your service record, so this route does not by itself fix a wrong date of joining or a wrong wage.",
  },
  {
    id: "epfo-own-record",
    title: "Ask the office to read its own file",
    summary:
      "Everything the employer would attest, they already filed. Monthly. Under the same establishment code.",
    dependency: "officer",
    provenance: "verified",
    detail:
      "Each month an establishment files an electronic challan-cum-return naming every member, their wages and their contribution, and pays against it. That return is how the money in your passbook got there. So the office already holds documentary proof of your employment, your wage and the months you worked — filed by the employer, under their own digital signature, before anything went wrong. A grievance that asks for the record to be verified from the establishment's own returns is asking for something the office can actually do without anybody's cooperation. It is a materially different request from asking them to accept your word.",
    steps: [
      "Take the establishment code from your passbook. It identifies the employer regardless of what they were called.",
      "File the grievance naming the establishment code, the months in dispute, and the fact that the establishment is non-functional or non-responsive.",
      "Ask specifically that the fact be verified from the returns filed by that establishment, rather than asking to be believed.",
      "Keep the grievance registration number. It is the only thing that proves the request was made.",
    ],
    situations: ["closed", "refusing", "untraceable"],
    limit:
      "It relies on an officer agreeing to do it, and there is no deadline behind a grievance that anybody can enforce. Which is why the route below exists, and why the two are usually filed together.",
    link: { href: "/still-waiting/", label: "What a grievance can and cannot compel" },
  },
  {
    id: "jd-without-employer",
    title: "A Joint Declaration with only one party",
    summary:
      "Where the establishment is closed, the correction can proceed on the member's side alone, decided by the officer.",
    dependency: "officer",
    provenance: "verified",
    detail:
      "The Joint Declaration is the instrument that corrects a name, a date of birth, a father's name or a date of joining, and its name says the problem: it is joint. EPFO's procedure for it recognises that one of the two parties may no longer exist. Where the establishment is closed, the declaration is submitted by the member with documentary evidence and the establishment's status, and is decided by the officer in charge rather than refused for want of a signature. It moves more slowly than the ordinary route and it is not automatic — but it is not a dead end, which is what the member is usually told it is.",
    steps: [
      "Assemble the documentary evidence for the corrected value — the Aadhaar, the school certificate, whichever document is the authority for the field being changed.",
      "Assemble the evidence that the establishment is closed, from the list for your situation above.",
      "Submit the declaration with both, stating plainly in covering words that the establishment is non-functional and that no authorised signatory exists.",
      "Expect it to be examined rather than processed. Ask, in the same submission, to be told which desk holds it.",
    ],
    situations: ["closed", "untraceable"],
    limit:
      "A large correction — a substantially different name, or several years of date of birth — attracts more scrutiny than a small one, and may need approval at a higher level. The size of the change matters more than the reason for it.",
    link: { href: "/why/name-mismatch/", label: "How a correction is measured" },
  },
  {
    id: "rti-establishment",
    title: "Compel the answer",
    summary:
      "An RTI application about the establishment's status and its returns must be answered in thirty days.",
    dependency: "statutory",
    provenance: "statutory",
    detail:
      "This is the only instrument on the page with a deadline anybody can enforce. An application under section 6(1) of the Right to Information Act 2005 asking for the status of an establishment code, the periods for which it filed returns, and the record held in respect of your own membership, must be answered within thirty days. Silence past that is a deemed refusal that opens an appeal, and the penalty under section 20(1) — ₹250 for each day of delay, up to ₹25,000 — falls on the Public Information Officer personally, not on the department. Nothing else in this process is enforceable in that way, which is why it is usually the thing that moves it.",
    steps: [
      "Address it to the Public Information Officer of the regional office holding the establishment code.",
      "Ask for facts, not opinions. Whether the establishment is functional; the months for which returns were filed; the record held against your UAN. An RTI cannot be used to ask an officer to agree with you.",
      "Pay the ₹10 fee. Applicants below the poverty line pay nothing.",
      "Diarise the thirtieth day. That date, not the reply, is what you rely on.",
    ],
    situations: ["closed", "refusing", "untraceable"],
    limit:
      "It produces information, not a settled claim. Its use is that the information it produces is very often the thing that unblocks the claim — and that the asking is on a clock.",
    link: { href: "/still-waiting/", label: "The only clock that binds" },
  },
];

/* ------------------------------------------------------------------
   Who may attest instead.

   Taken from the list printed on EPFO's own non-Aadhaar composite
   claim form. Ordered by how easily an ordinary person can actually
   reach one, which is not the order the form uses.
   ------------------------------------------------------------------ */

export interface Attester {
  who: string;
  /** Why this one is reachable, or why it is not. */
  note: string;
  /** Roughly how hard, so somebody can choose. */
  reach: "easy" | "moderate" | "hard";
}

export const ATTESTERS: Attester[] = [
  {
    who: "The manager of the bank where your account is held",
    note: "Almost always the right answer. It is the branch you already visit, they hold the account the money is going to, and confirming your identity is something they do every day.",
    reach: "easy",
  },
  {
    who: "A gazetted officer",
    note: "Wider than most people assume — it includes a great many government servants, school and college principals in government institutions, and serving officers of the armed forces.",
    reach: "easy",
  },
  {
    who: "The postmaster or sub-postmaster",
    note: "There is a post office within reach of nearly every village in the country, which is precisely why the form names one.",
    reach: "easy",
  },
  {
    who: "The chairman, secretary or a member of the village panchayat or union board",
    note: "In a village this is usually the shortest walk on this list.",
    reach: "easy",
  },
  {
    who: "A magistrate",
    note: "Reliable, and reliably a half-day at the court.",
    reach: "moderate",
  },
  {
    who: "The president, secretary or a member of a municipal or district local board",
    note: "An elected local representative. Reachable in a town, less so between sittings.",
    reach: "moderate",
  },
  {
    who: "A member of the Central Board of Trustees or of a Regional Committee of the EPF",
    note: "Usually a union office-bearer. If you are a union member this may be the easiest route of all; if you are not, it is the hardest.",
    reach: "hard",
  },
  {
    who: "A Member of Parliament or of a State Legislative Assembly",
    note: "Named on the form, and occasionally the fastest thing that has ever happened to a stuck file. Most have a constituency office and a day for it.",
    reach: "hard",
  },
];

/* ------------------------------------------------------------------
   What this changes, reason by reason.
   ------------------------------------------------------------------ */

/** Every rejection reason that contains at least one step the member
 *  cannot perform alone. Computed rather than listed, so it cannot
 *  drift out of step with the knowledge base. */
export function blockedReasons(): RejectionReason[] {
  return REJECTIONS.filter((r) =>
    r.fixSteps.some((s) => s.actor === "employer"),
  );
}

/** True where this particular reason has an employer step in it. */
export function needsEmployer(reason: RejectionReason): boolean {
  return reason.fixSteps.some((s) => s.actor === "employer");
}

/** The routes worth putting in front of somebody on a given
 *  rejection page, most useful first.
 *
 *  The mapping is deliberately shallow. A reason whose employer step
 *  is "mark the date of exit" has a specific cure; the rest share the
 *  general ones, and pretending otherwise would be inventing
 *  specificity for the sake of looking thorough. */
export function routesFor(reasonId: string): Route[] {
  const specific: Record<string, string[]> = {
    "exit-date-missing": ["self-exit", "epfo-own-record", "rti-establishment"],
    "bank-not-seeded": ["aadhaar-claim", "epfo-own-record", "rti-establishment"],
    "employer-kyc-pending": [
      "aadhaar-claim",
      "epfo-own-record",
      "rti-establishment",
    ],
    "name-mismatch": [
      "jd-without-employer",
      "other-attesters",
      "rti-establishment",
    ],
    "dob-mismatch": [
      "jd-without-employer",
      "other-attesters",
      "rti-establishment",
    ],
    "father-name-mismatch": [
      "jd-without-employer",
      "other-attesters",
      "rti-establishment",
    ],
    "gender-mismatch": [
      "jd-without-employer",
      "other-attesters",
      "rti-establishment",
    ],
  };

  const ids = specific[reasonId] ?? [
    "epfo-own-record",
    "other-attesters",
    "rti-establishment",
  ];

  return ids
    .map((id) => ROUTES.find((r) => r.id === id))
    .filter((r): r is Route => Boolean(r));
}

export function routeById(id: string): Route | undefined {
  return ROUTES.find((r) => r.id === id);
}

export const DEPENDENCY_LABEL: Record<
  Dependency,
  { label: string; tag: string; note: string }
> = {
  nobody: {
    label: "Needs nobody",
    tag: "tag-ok",
    note: "Available to you today, without anyone's agreement.",
  },
  "third-party": {
    label: "Needs a third party",
    tag: "tag-info",
    note: "Someone outside EPFO signs, and they are reachable.",
  },
  officer: {
    label: "Needs an officer to decide",
    tag: "tag-warn",
    note: "It can be granted or refused. No deadline behind it.",
  },
  statutory: {
    label: "Carries a deadline",
    tag: "tag-danger",
    note: "Thirty days, with a penalty on the officer personally.",
  },
};
