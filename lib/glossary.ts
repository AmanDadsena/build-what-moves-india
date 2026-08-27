/* ============================================================
   The words, in plain language.

   This whole product exists because a system speaks in a register
   its users do not. The rejection decoder handles one sentence at a
   time; this handles the vocabulary underneath it.

   Every entry answers two questions rather than one: what the word
   means, and why it matters to the person reading. A definition that
   stops at the first is a dictionary. The second is the part that
   changes what somebody does next.
   ============================================================ */

export interface Term {
  term: string;
  termHi: string;
  /** Other names people meet the same thing under. */
  aliases: string[];
  meaning: string;
  /** Why a member should care. */
  matters: string;
  category: "Your account" | "Money" | "Paperwork" | "When it goes wrong";
}

export const GLOSSARY: Term[] = [
  {
    term: "UAN",
    termHi: "यूएएन",
    aliases: ["universal account number", "uan number"],
    meaning:
      "A twelve-digit number that belongs to you, not to a job. It stays the same across every employer you ever have.",
    matters:
      "If a new employer gives you a second one, your service splits in two and your pension eligibility is counted separately in each. That is the most expensive clerical error in the scheme.",
    category: "Your account",
  },
  {
    term: "Establishment code",
    termHi: "प्रतिष्ठान कोड",
    aliases: ["establishment id", "employer code"],
    meaning:
      "The code identifying your employer to EPFO. It is on your payslip, and its first letters name the office holding your file.",
    matters:
      "Every grievance, RTI and office visit needs it. Once you leave and lose access to payslips it becomes genuinely hard to obtain.",
    category: "Your account",
  },
  {
    term: "ECR",
    termHi: "ईसीआर",
    aliases: ["electronic challan cum return", "monthly filing"],
    meaning:
      "The monthly return an employer files listing everyone's wages and contributions. Your passbook is built from it.",
    matters:
      "A deduction on your payslip only reaches the fund when the ECR is filed. If your employer skips it, the money left your salary and did not arrive, and nothing tells you.",
    category: "Money",
  },
  {
    term: "EPS",
    termHi: "ईपीएस",
    aliases: ["pension scheme", "eps-95", "employees pension scheme"],
    meaning:
      "The pension half of the scheme. Most of your employer's contribution goes here rather than into your withdrawable fund.",
    matters:
      "It needs ten years of qualifying service to pay a monthly pension for life. Under ten years, you can only withdraw it once and the entitlement ends.",
    category: "Money",
  },
  {
    term: "Wage ceiling",
    termHi: "वेतन सीमा",
    aliases: ["15000 ceiling", "pension ceiling"],
    meaning:
      "The pension contribution is calculated on wages up to ₹15,000, whatever you actually earn.",
    matters:
      "It is why the pension column in your passbook stops growing once your salary passes that figure, and why a large salary does not produce a large pension.",
    category: "Money",
  },
  {
    term: "Qualifying service",
    termHi: "पात्र सेवा",
    aliases: ["eligible service", "ten years"],
    meaning:
      "The total months counted toward a pension. It need not be continuous, and service from earlier employers counts once transferred.",
    matters:
      "Ten years is the line. Withdrawing rather than transferring resets it to zero, which is the single most common way people lose a pension without knowing.",
    category: "Money",
  },
  {
    term: "KYC",
    termHi: "केवाईसी",
    aliases: ["know your customer", "verification", "aadhaar seeding"],
    meaning:
      "Linking your Aadhaar, PAN and bank account to your UAN, and having your employer approve each one.",
    matters:
      "It is a two-party action. Most members complete their half and assume it is done — the approval sits unactioned in the employer's login, and every claim fails the same check.",
    category: "Your account",
  },
  {
    term: "Digital signature",
    termHi: "डिजिटल हस्ताक्षर",
    aliases: ["dsc", "e-sign", "authorised signatory"],
    meaning:
      "The certificate an employer's authorised signatory uses to approve things in their EPFO login.",
    matters:
      "When a signatory leaves and the certificate is not re-registered, every pending approval in that company freezes at once. Members read it as a personal problem; it is an outage nobody announced.",
    category: "Paperwork",
  },
  {
    term: "Date of exit",
    termHi: "निकास तिथि",
    aliases: ["exit date", "cessation", "date of leaving"],
    meaning:
      "The date your employment ended, recorded in the monthly filing by your employer.",
    matters:
      "Without it you are shown as still employed and no final settlement can be paid. Two months after your last contribution you can record it yourself.",
    category: "Your account",
  },
  {
    term: "Joint Declaration",
    termHi: "संयुक्त घोषणा",
    aliases: ["jd", "correction form", "name correction"],
    meaning:
      "The document correcting a name, date of birth or relation name held against your UAN. Signed by you and countersigned by your employer.",
    matters:
      "One signed only by you will not be processed. This is the step that stalls, and it stalls hardest after you have left the company.",
    category: "Paperwork",
  },
  {
    term: "Deficiency memo",
    termHi: "कमी ज्ञापन",
    aliases: ["deficiency", "returned incomplete", "memo"],
    meaning:
      "A note issued when a desk finds something missing, sending your file back a step.",
    matters:
      "Each one restarts the twenty-day settlement count. It is how a claim sits for months without the service commitment ever being formally breached.",
    category: "When it goes wrong",
  },
  {
    term: "Note sheet",
    termHi: "नोट शीट",
    aliases: ["order sheet", "file noting", "noting"],
    meaning:
      "The running record inside your file where each officer writes what they decided and why.",
    matters:
      "It contains the real reason your claim failed. You are never shown it, and an RTI is the only route that compels its release.",
    category: "When it goes wrong",
  },
  {
    term: "CPIO",
    termHi: "सीपीआईओ",
    aliases: ["public information officer", "pio"],
    meaning:
      "The officer in each EPFO office legally responsible for answering RTI applications.",
    matters:
      "They must reply within thirty days. If they do not, that silence is itself a refusal you can appeal, and a penalty can fall on them personally.",
    category: "When it goes wrong",
  },
  {
    term: "Deemed refusal",
    termHi: "मानी गई अस्वीकृति",
    aliases: ["section 7(2)", "no reply"],
    meaning:
      "When an RTI goes unanswered past thirty days, the law treats the silence as a refusal.",
    matters:
      "You do not have to keep waiting or ask again. The silence itself is the ground for your appeal, and the clock on a penalty has already started.",
    category: "When it goes wrong",
  },
  {
    term: "EPFiGMS",
    termHi: "ईपीएफआईजीएमएस",
    aliases: ["grievance portal", "igms", "complaint"],
    meaning: "EPFO's own online grievance system.",
    matters:
      "It has no enforceable deadline and can be closed with a reply that resolves nothing. File it anyway — the dated reference number is what every later step relies on.",
    category: "When it goes wrong",
  },
  {
    term: "TDS",
    termHi: "टीडीएस",
    aliases: ["tax deducted at source", "tax", "deduction"],
    meaning:
      "Tax taken out of your withdrawal before it reaches your account.",
    matters:
      "Under five years of service it applies. With an unverified PAN it is charged at double the normal rate, and recovering it means waiting for a tax refund a year later.",
    category: "Money",
  },
  {
    term: "Form 15G / 15H",
    termHi: "फॉर्म 15G / 15H",
    aliases: ["15g", "15h", "no tax declaration"],
    meaning:
      "A declaration that your total income is below the taxable limit, so no tax should be deducted. 15H is the version for senior citizens.",
    matters:
      "It stops the deduction at source. Only file it if it is true — a wrong declaration is an offence and the tax is recovered later anyway.",
    category: "Money",
  },
  {
    term: "Scheme certificate",
    termHi: "योजना प्रमाणपत्र",
    aliases: ["form 10c certificate", "preserve service"],
    meaning:
      "A certificate preserving your pension service instead of cashing it out when you leave.",
    matters:
      "If you expect to work in covered employment again, it keeps your months on record so they add to your next spell rather than starting from nothing.",
    category: "Money",
  },
  {
    term: "Nomination",
    termHi: "नामांकन",
    aliases: ["nominee", "form 2", "beneficiary"],
    meaning: "Naming who receives your fund and pension if you die.",
    matters:
      "Without one your family must establish their claim through succession — months of delay and court costs, at the point the money is needed most.",
    category: "Paperwork",
  },
  {
    term: "Transfer",
    termHi: "स्थानांतरण",
    aliases: ["form 13", "merge accounts", "one member one epf"],
    meaning:
      "Moving an old employer's balance and service into your current account.",
    matters:
      "Do it before any withdrawal. A settlement computed on one account cannot be reopened later to count the other.",
    category: "Paperwork",
  },
];

export const CATEGORIES = [
  "Your account",
  "Money",
  "Paperwork",
  "When it goes wrong",
] as const;

export function searchTerms(query: string): Term[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOSSARY;
  return GLOSSARY.filter(
    (t) =>
      t.term.toLowerCase().includes(q) ||
      t.termHi.includes(q) ||
      t.meaning.toLowerCase().includes(q) ||
      t.matters.toLowerCase().includes(q) ||
      t.aliases.some((a) => a.includes(q))
  );
}
