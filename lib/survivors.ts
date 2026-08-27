/* ============================================================
   What a family is owed when a member dies.

   This is the worst-served moment in the whole scheme, and the
   reason is structural rather than anybody's fault. Every screen in
   the member portal is addressed to the member. The person who now
   needs it has never used it, does not have the password, frequently
   does not know the UAN, and is doing this in the weeks after a death.

   The single most useful fact, and the one this page exists to state
   before anything else, is that there are three separate entitlements
   with three separate forms. A great many families claim the
   provident fund balance, are paid, and never learn that a monthly
   pension and an insurance lump sum were also owed. Nothing tells
   them. The fund claim being settled looks, from outside, exactly
   like the matter being closed.

   The second most useful fact is that the ten-year qualifying service
   rule — the one that governs every other pension conversation —
   does not apply to a death in service. A family whose member worked
   for fourteen months is often told, or assumes, that there is no
   pension. There is.

   Figures below that carry a rupee amount are revised from time to
   time by notification, and the interface says so rather than
   presenting them as fixed.
   ============================================================ */

export interface Entitlement {
  id: string;
  /** What it is, in the words a family would use. */
  title: string;
  titleHi: string;
  form: string;
  /** What is actually paid. */
  what: string;
  /** The thing about it that families are not told. */
  missed: string;
  /** Who it goes to. */
  to: string;
  tone: "noting" | "verify" | "pending";
}

export const ENTITLEMENTS: Entitlement[] = [
  {
    id: "fund",
    title: "The provident fund balance",
    titleHi: "भविष्य निधि की जमा राशि",
    form: "Form 20",
    what: "The whole accumulated balance — the member's own contributions, the employer's, and all the interest credited on both.",
    missed:
      "This is the one nearly every family does claim, and being paid it feels like the end of the matter. It is one of three.",
    to: "The nominee named on the record. Where none was named, the family as the scheme defines it.",
    tone: "noting",
  },
  {
    id: "pension",
    title: "A monthly pension",
    titleHi: "मासिक पेंशन",
    form: "Form 10D",
    what: "A pension every month for life to the widow or widower, and a children's pension for up to two children until they turn twenty-five.",
    missed:
      "The ten-year service rule does not apply to a death in service. A member who worked a single year still leaves a pension behind, and families are routinely told otherwise — sometimes by people who believe it.",
    to: "The spouse, and the children. It does not depend on who was nominated for the fund.",
    tone: "verify",
  },
  {
    id: "edli",
    title: "An insurance payment",
    titleHi: "बीमा राशि",
    form: "Form 5-IF",
    what: "A lump sum under the Employees' Deposit Linked Insurance scheme, calculated from the member's wages, subject to a floor and a ceiling.",
    missed:
      "The member never paid for this and almost certainly never knew it existed — the employer funds it at half a per cent, which is why it appears on no payslip. It is the most frequently unclaimed of the three.",
    to: "The nominee, or the family where none was named.",
    tone: "pending",
  },
];

export interface Need {
  id: string;
  label: string;
  detail: string;
  /** True where its absence stops everything rather than delaying it. */
  blocking: boolean;
}

/* Ordered by what stops the claim soonest, not by what is easiest to
   collect. A family that gathers the simple things first and
   discovers the hard one in week three has lost three weeks. */
export const NEEDED: Need[] = [
  {
    id: "uan",
    label: "The member's UAN, or their PF member ID",
    detail:
      "It is printed on old payslips and on the annual statement. If neither can be found, the employer's HR or accounts office holds it and is obliged to give it.",
    blocking: true,
  },
  {
    id: "death-certificate",
    label: "The death certificate",
    detail:
      "Issued by the municipal authority. Get several certified copies at once — every one of the three claims wants one, and so will the bank.",
    blocking: true,
  },
  {
    id: "claimant-bank",
    label: "The claimant's own bank account and its IFSC",
    detail:
      "It must belong to the person claiming, not to the person who died. A joint account held with the member is usually accepted; the member's sole account is not.",
    blocking: true,
  },
  {
    id: "claimant-aadhaar",
    label: "The claimant's Aadhaar",
    detail:
      "The name on it has to match the name written on the claim, character for character. This is the single most common cause of a rejection at this stage.",
    blocking: true,
  },
  {
    id: "relationship",
    label: "Proof of the relationship to the member",
    detail:
      "A ration card, a school record naming the parent, a marriage certificate, or the nomination itself where one was filed.",
    blocking: false,
  },
  {
    id: "guardian",
    label: "A guardianship certificate, if a child is claiming",
    detail:
      "Needed where the person claiming on a minor's behalf is not the natural guardian. It comes from a court and it is slow, so start it the same week.",
    blocking: false,
  },
  {
    id: "succession",
    label: "A succession or legal heirship certificate, if nobody was nominated",
    detail:
      "Only where no nomination exists and there is no surviving family as the scheme defines it. This is the slowest document in the whole process — months, not weeks — which is the real cost of a blank nomination.",
    blocking: false,
  },
];

export interface Stall {
  when: string;
  why: string;
  doThis: string;
}

export const STALLS: Stall[] = [
  {
    when: "The employer will not attest the forms",
    why: "Every one of the three claims is submitted through the establishment, which signs to confirm the member's service and the date of death.",
    doThis:
      "Ask in writing and keep the reply. Where the employer has closed, moved or simply stopped responding, the forms may be attested instead by a bank manager, a gazetted officer, a magistrate, or the head of a village panchayat — and a great many families are never told this.",
  },
  {
    when: "The date of exit was never recorded",
    why: "An employer who never marked the member as having left leaves the account looking active, and a claim against an active account stalls at the first desk.",
    doThis:
      "The date of exit here is the date of death, and the establishment must record it. Raise it in writing, then through the grievance channel with the establishment code named.",
  },
  {
    when: "Nobody was ever nominated",
    why: "The scheme then has to establish who the family is, which it cannot do from its own records.",
    doThis:
      "Where there is a surviving spouse, children or dependent parents, the scheme's own definition of family usually settles it without a court. A succession certificate is needed only where there is nobody who fits that definition — so establish this before starting a court process nobody may need.",
  },
  {
    when: "The pension claim was never made at all",
    why: "Settling the fund closes the case as far as the file is concerned. Nothing prompts a family to ask about the pension, and nothing tells them the service rule does not apply.",
    doThis:
      "File Form 10D separately. It is not too late because the fund was already paid, and there is no deadline on claiming it.",
  },
];
