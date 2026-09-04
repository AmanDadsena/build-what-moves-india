import { blockedReasons } from "./employer-gone";

/* ============================================================
   The page a member sends to their employer.

   In a large share of these cases the member can do nothing at all.
   The approval, the signature, the exit date, the correction — all of
   it sits in an establishment's login, and the member's only power is
   to ask. This product already drafts the letter. What it did not
   have was somewhere for the person receiving that letter to read.

   That gap matters more than it looks. The letter lands on an HR
   assistant who has not done this before, does not know which screen
   it is on, and does not know that a member cannot do it themselves.
   The commonest outcome is not refusal. It is a reply saying "please
   do it from your own login", which is wrong, and which costs the
   member another month.

   So this is written for that reader: what is being asked, why it can
   only be done by them, roughly where it is, and what it costs the
   establishment to leave it. No accusation — an employer who is being
   asked is usually not the one who caused it.
   ============================================================ */

export interface EmployerDuty {
  id: string;
  /** What the member will have asked for. */
  ask: string;
  askHi: string;
  /** Why the member cannot do it. */
  whyNotMember: string;
  /** Roughly where it lives, without pretending to be a manual. */
  where: string;
  /** What it costs the member while it waits. */
  costToMember: string;
  /** What it costs the establishment. */
  costToEmployer: string;
  /** Rejection ids this duty resolves. */
  resolves: string[];
}

export const DUTIES: EmployerDuty[] = [
  {
    id: "kyc",
    ask: "Approve the KYC already uploaded",
    askHi: "अपलोड किया गया KYC स्वीकृत करें",
    whyNotMember:
      "A member can upload their Aadhaar, PAN and bank details but cannot approve them. The approval is a digital signature made from the establishment's login, and until it happens the records count as unverified — which fails every claim automatically, before any officer looks at it.",
    where:
      "The employer portal, under the member's UAN, in the pending KYC approvals list.",
    costToMember:
      "Every claim they file is rejected on submission. They cannot withdraw, transfer or correct anything.",
    costToEmployer:
      "Nothing directly, which is exactly why it sits. But an unapproved KYC is the most common single item behind grievances filed against an establishment code.",
    /* Not pan-not-verified: PAN is checked against the income tax
       database and has no employer step at all. Listing it here would
       have told an employer they were holding up something they have
       no part in — unfair to them, and it would have sent the member
       to the wrong person. */
    resolves: ["employer-kyc-pending", "bank-not-seeded"],
  },
  {
    id: "exit",
    ask: "Record the date of exit",
    askHi: "नौकरी छोड़ने की तारीख दर्ज करें",
    whyNotMember:
      "A member may only mark their own exit once two months have passed since the last contribution, and even then only for the reason 'cessation of service'. Before that, the establishment is the only party who can do it.",
    where:
      "The employer portal, exit date entry against the member's UAN, with the reason and the last working day.",
    costToMember:
      "A final settlement cannot be filed at all. The account reads as active, so the claim stalls at the first desk with no explanation the member can see.",
    costToEmployer:
      "An establishment carrying members who left years ago has a compliance record that does not match its ECR filings.",
    resolves: ["exit-date-missing"],
  },
  {
    id: "joint-declaration",
    ask: "Sign and forward a Joint Declaration",
    askHi: "संयुक्त घोषणा पर हस्ताक्षर कर आगे भेजें",
    whyNotMember:
      "Corrections to a name, date of birth, gender or a parent's name are made on a Joint Declaration, which by design carries two signatures. A member cannot file one alone — the form exists precisely so that neither party can change a record unilaterally.",
    where:
      "Signed by the authorised signatory, then forwarded to the regional office with the supporting proof the member has provided.",
    costToMember:
      "The mismatch stays on the record, and every claim continues to fail the automated comparison against Aadhaar.",
    costToEmployer:
      "One signature, once. Left undone it usually returns as a grievance, which takes considerably longer to answer.",
    resolves: [
      "name-mismatch",
      "dob-mismatch",
      "gender-mismatch",
      "father-name-mismatch",
    ],
  },
  {
    id: "arrears",
    ask: "File the months that were deducted but never remitted",
    askHi: "काटे गए पर जमा न हुए महीनों की ECR भरें",
    whyNotMember:
      "Only an establishment can file an ECR. A member can see that months are missing from their passbook and can raise a grievance, but they have no way to deposit the amount themselves.",
    where:
      "An ECR filing for the missing wage months against the member's UAN.",
    costToMember:
      "The money never entered the fund, so it earns no interest and does not count toward pensionable service — and the loss compounds for as long as it stands.",
    costToEmployer:
      "This is the one on the list with real exposure. Amounts deducted from wages and not remitted attract interest and damages, and the liability does not expire.",
    resolves: [],
  },
  {
    id: "attestation",
    ask: "Attest a death claim submitted by the family",
    askHi: "परिवार द्वारा दाखिल मृत्यु दावे को प्रमाणित करें",
    whyNotMember:
      "The member has died. Their family is filing, and the forms require the establishment to confirm the service and the date of death.",
    where:
      "Forms 20, 10D and 5-IF, countersigned and forwarded to the regional office.",
    costToMember:
      "Three separate entitlements — the fund balance, a monthly pension and an insurance payment — are held up together, at the point a family needs them most.",
    costToEmployer:
      "Where an establishment has closed or will not respond, the forms may instead be attested by a bank manager, a gazetted officer, a magistrate or the head of a village panchayat. Families are rarely told this, and wait.",
    resolves: ["nomination-missing-death-claim"],
  },
];

/** The duty that clears a given rejection, where one does. */
export function dutyFor(rejectionId: string): EmployerDuty | undefined {
  return DUTIES.find((d) => d.resolves.includes(rejectionId));
}

/** How many of the documented rejections cannot be cleared without the
 *  employer doing something.
 *
 *  Counted from the fix steps rather than from whoMustAct, and the
 *  difference matters. whoMustAct names who moves *first* — for most
 *  of these that is the member, who starts the Joint Declaration or
 *  uploads the KYC. Reading it as "whose problem is this" gives one
 *  out of fifteen, which is both wrong and the opposite of this
 *  page's point. What decides whether a member is stuck is whether
 *  any step in the sequence belongs to the establishment. */
export function employerBlockedCount(): number {
  return blockedReasons().length;
}
