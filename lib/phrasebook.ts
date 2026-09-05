/* ============================================================
   How people actually type, and what they mean by it.

   This site's search index is built out of the vocabulary of the
   institution — "Date of exit not updated by employer",
   "Demographic discrepancy". Its own landing page says the question
   people arrive with is *why has my money not come*, and until this
   file existed, typing exactly that in the words most of India would
   use returned nothing at all:

       paisa nahi aaya          → nothing
       mera pf ka paisa nahi mila → nothing
       claim reject ho gaya     → nothing
       मेरा पैसा नहीं आया        → nothing

   Which is the same failure this whole product was built to argue
   against, committed by the product. EPFO writes in the register of
   the office and expects the member to translate; the search wrote in
   the register of the index and expected the same. A member who has
   to already know the phrase "date of exit" in order to find the page
   explaining what a date of exit is has not been helped.

   ------------------------------------------------------------
   Two things this does, and one it refuses to do

   It normalises spelling. Romanised Hindi has no orthography, so
   "nahi", "nahin", "nhi" and "nai" are the same word typed by four
   people, and a phone keyboard with English autocorrect will produce
   all four. The variants are listed explicitly rather than guessed at
   by a phonetic algorithm, because an explicit table can be read,
   argued with and tested, and a phonetic algorithm produces confident
   nonsense on the words it was not designed for.

   It expands a symptom into the vocabulary of the index. Somebody
   typing "paisa nahi aaya" is describing what they can see. The index
   is written in causes — which is the entire premise of the product:
   the member cannot know the cause, that is why they are here.

   And it refuses to pretend a symptom is a diagnosis. "My money has
   not come" genuinely has six or seven possible causes, and a search
   that returned one of them at the top with quiet confidence would be
   doing the thing this product exists to stop. So a phrase is marked
   ambiguous, the interface says so in the member's own words, and the
   triage is offered rather than a guess.

   ------------------------------------------------------------
   On the languages

   The site translates rejection *titles* into all eight languages but
   keeps long explanations to English and Hindi, on the reasoning that
   a wrong sentence about a statutory period, in a language nobody in
   the loop can check, is the exact harm it exists to prevent.

   Search phrases sit on the other side of that line, and it is worth
   saying why. These are input, not output. Nothing here is ever shown
   to a member as a statement of fact; the worst a wrong entry can do
   is fail to match, which is precisely today's behaviour. That is a
   different risk from asserting a deadline, so the coverage is wider
   here than it is for prose — with Hindi and romanised Hindi deepest,
   because that is where the volume is.
   ============================================================ */

/* ------------------------------------------------------------------
   Word-level variants.

   Key is the canonical form; the values are what people type. Read as
   "all of these mean this". Kept small and specific to this domain —
   a general Hinglish dictionary would be a different project and a
   worse one, because every extra word is another chance to collide
   with a real English term already in the index.
   ------------------------------------------------------------------ */

export const VARIANTS: Record<string, string[]> = {
  // money
  paisa: ["paisa", "paise", "paisaa", "pesa", "pese", "peisa", "paisha", "rupaya", "rupya", "rupaye", "rakam", "rakm"],
  // negation
  nahi: ["nahi", "nahin", "nhi", "nai", "nahee", "nahii", "na"],
  // arriving / receiving
  aaya: ["aaya", "aya", "aayi", "ayi", "aae", "aaye", "aye", "aana", "ana"],
  mila: ["mila", "mili", "mile", "milaa", "milega", "milegi", "milta", "milti", "milne"],
  // asking when
  kab: ["kab", "kabtak", "kbtk", "kitne", "kitna", "kitni"],
  din: ["din", "dino", "dinon", "days", "mahina", "mahine", "month"],
  // the claim
  dava: ["dava", "davaa", "daawa", "claim"],
  reject: ["reject", "rejected", "rijekt", "kharij", "khaarij", "khariz", "namanjur", "namanzoor", "cancel", "cancelled", "fail", "failed"],
  // identity fields
  naam: ["naam", "nam", "naaam", "name"],
  galat: ["galat", "galath", "galti", "galathi", "wrong", "alag", "farak", "fark", "different", "mismatch", "match"],
  janm: ["janm", "janam", "dob", "birth", "janmtithi"],
  pita: ["pita", "pitaji", "father", "papa", "walid"],
  aadhaar: ["aadhaar", "aadhar", "adhar", "aadhaa", "adhaar", "uidai"],
  // the employer
  malik: ["malik", "maalik", "seth", "owner", "boss", "employer", "company", "kampani", "kampni", "factory", "farm", "thekedar", "thekedaar", "contractor", "hr"],
  band: ["band", "bandh", "banda", "closed", "close", "shut", "tala", "taala"],
  sign: ["sign", "signature", "dastkhat", "hastakshar", "approve", "approval", "manzoor", "manjur", "manjoor", "attest", "verify"],
  // the money being stuck
  atka: ["atka", "atak", "atki", "atke", "phansa", "fansa", "ruka", "ruk", "ruki", "pending", "stuck", "late", "der", "deri"],
  // taking it out
  nikal: ["nikal", "nikaal", "nikalna", "nikalna", "nikalne", "withdraw", "withdrawal", "settlement"],
  // leaving the job
  naukri: ["naukri", "nokri", "job", "kaam", "chhoda", "chhod", "choda", "chod", "resign", "resigned", "left", "quit", "nikala", "nikaala", "termination"],
  // the bank
  khata: ["khata", "khaata", "account", "bank", "ifsc", "passbook", "pasbook"],
  // pension
  pension: ["pension", "pensan", "pensen", "eps"],
  // death
  mrityu: ["mrityu", "mratyu", "death", "died", "guzar", "gujar", "gujar", "marna", "nidhan", "expire", "expired"],
  // asking for help
  madad: ["madad", "help", "sahayata", "sahaayata", "kaise", "kaise", "how"],
  // complaining
  shikayat: ["shikayat", "shikaayat", "complaint", "grievance", "sikayat"],
};

/** Canonical form for a typed word, or the word itself. Built once. */
const CANON: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [canon, forms] of Object.entries(VARIANTS)) {
    for (const form of forms) map.set(form, canon);
  }
  return map;
})();

/** Collapses a run of the same letter, which is how emphasis is typed
 *  on a phone: "nahiii", "paisaaa". Two letters are kept, because
 *  English has genuine doubles and this also runs over English. */
function deduplicate(word: string): string {
  return word.replace(/(.)\1{2,}/g, "$1$1");
}

export function canonical(word: string): string {
  const flat = deduplicate(word.toLowerCase());
  return CANON.get(flat) ?? flat;
}

/* ------------------------------------------------------------------
   Phrases.

   `says` is matched against the canonicalised query. `means` is the
   vocabulary of the index, appended to the query before scoring, so
   the existing matcher does the work and there is one scorer rather
   than two.
   ------------------------------------------------------------------ */

export interface Phrase {
  id: string;
  /** Canonical words that must all be present for this to fire. */
  when: string[];
  /** Index vocabulary this is translated into. */
  means: string[];
  /** True where the symptom has several genuinely different causes. */
  ambiguous: boolean;
  /** Said to the member when ambiguous. Their words, not the office's. */
  note?: string;
}

export const PHRASES: Phrase[] = [
  /* ---- The commonest arrival of all, and it is a symptom ---- */
  {
    id: "money-not-arrived",
    when: ["paisa", "nahi"],
    means: [
      "rejected", "pending", "still waiting", "settlement", "claim",
      "why was it rejected", "not received", "delay",
    ],
    ambiguous: true,
    note: "Money that has not arrived is a symptom, not a reason — it has several different causes and they need different fixes. These are the places to start.",
  },
  {
    id: "money-not-received",
    when: ["paisa", "mila"],
    means: ["rejected", "pending", "still waiting", "settlement", "not received"],
    ambiguous: true,
    note: "Money that has not arrived is a symptom, not a reason. Start with what the portal actually told you, or work through the questions.",
  },
  {
    id: "when-will-i-get-it",
    when: ["paisa", "kab"],
    means: ["still waiting", "settlement", "twenty days", "how long", "delay", "pending"],
    ambiguous: false,
  },
  {
    id: "money-stuck",
    when: ["paisa", "atka"],
    means: ["still waiting", "pending", "delay", "settlement", "escalation"],
    ambiguous: false,
  },
  {
    id: "want-to-withdraw",
    when: ["nikal"],
    means: ["file a claim", "filing", "form 19", "form 31", "advance"],
    ambiguous: false,
  },

  /* ---- The claim failed ---- */
  {
    id: "claim-rejected",
    when: ["dava", "reject"],
    means: ["rejected", "why was it rejected", "remark", "reason", "decode"],
    ambiguous: false,
  },
  {
    id: "rejected-alone",
    when: ["reject"],
    means: ["rejected", "why was it rejected", "remark", "reason"],
    ambiguous: false,
  },

  /* ---- Identity mismatches, the largest single family ---- */
  {
    id: "name-wrong",
    when: ["naam", "galat"],
    means: ["name mismatch", "name in epfo records not matching with aadhaar", "joint declaration", "correction"],
    ambiguous: false,
  },
  {
    id: "name-alone",
    when: ["naam"],
    means: ["name mismatch", "correction", "joint declaration"],
    ambiguous: false,
  },
  {
    id: "dob-wrong",
    when: ["janm", "galat"],
    means: ["date of birth mismatch with aadhaar", "correction", "joint declaration"],
    ambiguous: false,
  },
  {
    id: "father-wrong",
    when: ["pita", "galat"],
    means: ["father name mismatch", "correction", "joint declaration"],
    ambiguous: false,
  },
  {
    id: "aadhaar-trouble",
    when: ["aadhaar"],
    means: ["aadhaar", "kyc", "seeding", "verification", "mismatch"],
    ambiguous: false,
  },

  /* ---- The employer ---- */
  {
    id: "employer-closed",
    when: ["malik", "band"],
    means: ["employer closed", "establishment", "no employer", "attestation", "non functional"],
    ambiguous: false,
  },
  {
    id: "employer-not-signing",
    when: ["malik", "sign"],
    means: ["employer kyc pending", "approval", "attestation", "no employer", "joint declaration"],
    ambiguous: false,
  },
  {
    id: "employer-not-doing",
    when: ["malik", "nahi"],
    means: ["employer kyc pending", "no employer", "attestation", "grievance"],
    ambiguous: false,
  },
  {
    id: "left-the-job",
    when: ["naukri", "chhoda"],
    means: ["date of exit", "exit not updated", "leaving", "final settlement"],
    ambiguous: false,
  },
  {
    id: "job-alone",
    when: ["naukri"],
    means: ["date of exit", "leaving", "transfer", "exit"],
    ambiguous: false,
  },

  /* ---- The bank ---- */
  {
    id: "bank-trouble",
    when: ["khata", "galat"],
    means: ["bank account not seeded", "ifsc", "seeding", "bank"],
    ambiguous: false,
  },
  {
    id: "bank-alone",
    when: ["khata"],
    means: ["bank account not seeded", "seeding", "ifsc", "passbook"],
    ambiguous: false,
  },

  /* ---- The rest ---- */
  {
    id: "pension-question",
    when: ["pension"],
    means: ["pension", "monthly pension", "pension service", "eps 95"],
    ambiguous: false,
  },
  {
    id: "someone-died",
    when: ["mrityu"],
    means: ["death claim", "after a death", "nomination", "survivor", "family pension"],
    ambiguous: false,
  },
  {
    id: "want-to-complain",
    when: ["shikayat"],
    means: ["grievance", "epfigms", "cpgrams", "escalation", "complaint"],
    ambiguous: false,
  },
  {
    id: "need-help",
    when: ["madad"],
    means: ["help", "contact", "how", "assistance"],
    ambiguous: false,
  },
];

/* ------------------------------------------------------------------
   Native-script phrases.

   Matched as substrings on the raw query rather than by token,
   because these scripts do not tokenise the way the romanised forms
   do and a member typing Devanagari is not typing spaces where an
   English speaker would.
   ------------------------------------------------------------------ */

export interface ScriptPhrase {
  /** Written as somebody would actually type it. */
  says: string;
  /** The phrase id in PHRASES whose meaning this shares. */
  like: string;
}

export const SCRIPT_PHRASES: ScriptPhrase[] = [
  // Hindi — the deepest coverage, because it is where the volume is.
  { says: "पैसा नहीं", like: "money-not-arrived" },
  { says: "पैसे नहीं", like: "money-not-arrived" },
  { says: "पैसा नहीं आया", like: "money-not-arrived" },
  { says: "पैसा नहीं मिला", like: "money-not-received" },
  { says: "पैसा कब", like: "when-will-i-get-it" },
  { says: "कब मिलेगा", like: "when-will-i-get-it" },
  { says: "अटका", like: "money-stuck" },
  { says: "दावा खारिज", like: "claim-rejected" },
  { says: "खारिज", like: "rejected-alone" },
  { says: "अस्वीकार", like: "rejected-alone" },
  { says: "नाम गलत", like: "name-wrong" },
  { says: "नाम अलग", like: "name-wrong" },
  { says: "जन्म तिथि गलत", like: "dob-wrong" },
  { says: "पिता का नाम", like: "father-wrong" },
  { says: "आधार", like: "aadhaar-trouble" },
  { says: "कंपनी बंद", like: "employer-closed" },
  { says: "कंपनी बंद हो गई", like: "employer-closed" },
  { says: "मालिक", like: "employer-not-doing" },
  { says: "नौकरी छोड़", like: "left-the-job" },
  { says: "बैंक खाता", like: "bank-alone" },
  { says: "पेंशन", like: "pension-question" },
  { says: "मृत्यु", like: "someone-died" },
  { says: "शिकायत", like: "want-to-complain" },
  { says: "निकालना", like: "want-to-withdraw" },

  // Marathi
  { says: "पैसे मिळाले नाहीत", like: "money-not-received" },
  { says: "नाव चुकीचे", like: "name-wrong" },
  { says: "कंपनी बंद", like: "employer-closed" },

  // Bengali
  { says: "টাকা আসেনি", like: "money-not-arrived" },
  { says: "টাকা পাইনি", like: "money-not-received" },
  { says: "নাম ভুল", like: "name-wrong" },
  { says: "কোম্পানি বন্ধ", like: "employer-closed" },

  // Gujarati
  { says: "પૈસા આવ્યા નથી", like: "money-not-arrived" },
  { says: "નામ ખોટું", like: "name-wrong" },
  { says: "કંપની બંધ", like: "employer-closed" },

  // Tamil
  { says: "பணம் வரவில்லை", like: "money-not-arrived" },
  { says: "பெயர் தவறு", like: "name-wrong" },
  { says: "நிறுவனம் மூடப்பட்டது", like: "employer-closed" },

  // Telugu
  { says: "డబ్బు రాలేదు", like: "money-not-arrived" },
  { says: "పేరు తప్పు", like: "name-wrong" },
  { says: "కంపెనీ మూసివేయబడింది", like: "employer-closed" },

  // Kannada
  { says: "ಹಣ ಬಂದಿಲ್ಲ", like: "money-not-arrived" },
  { says: "ಹೆಸರು ತಪ್ಪು", like: "name-wrong" },
  { says: "ಕಂಪನಿ ಮುಚ್ಚಿದೆ", like: "employer-closed" },
];

const BY_ID = new Map(PHRASES.map((p) => [p.id, p]));

export function phraseById(id: string): Phrase | undefined {
  return BY_ID.get(id);
}

export interface Reading {
  /** Extra vocabulary to score against, in the index's own words. */
  expansion: string[];
  /** Phrases that fired, most specific first. */
  matched: Phrase[];
  /** Set where the member described a symptom with several causes. */
  ambiguity?: string;
}

/** Reads a query the way a person meant it.
 *
 *  Returns nothing at all where nothing is recognised, which is the
 *  important case: this must never invent a reading, because an
 *  invented reading becomes a confident wrong answer about somebody's
 *  money — and the plain matcher underneath is still perfectly good
 *  at English. */
export function read(query: string): Reading {
  const lower = query.toLowerCase();
  const words = lower
    .replace(/[^\p{L}\p{N}\p{M}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(canonical);

  const present = new Set(words);
  const matched: Phrase[] = [];

  for (const phrase of PHRASES) {
    if (phrase.when.every((w) => present.has(w))) matched.push(phrase);
  }

  // Native scripts, matched on the raw string.
  for (const sp of SCRIPT_PHRASES) {
    if (!lower.includes(sp.says)) continue;
    const phrase = BY_ID.get(sp.like);
    if (phrase && !matched.includes(phrase)) matched.push(phrase);
  }

  // A phrase needing two words beats one needing a single word: "naam
  // galat" is a better reading of "naam galat hai" than "naam" alone.
  matched.sort((a, b) => b.when.length - a.when.length);

  const expansion: string[] = [];
  for (const phrase of matched) expansion.push(...phrase.means);

  /* Ambiguity is only reported when the *best* reading is ambiguous.
     Somebody who typed "paisa nahi aaya naam galat" has told us
     which of the causes it is, and should not then be told their
     problem could be several things. */
  const best = matched[0];
  const ambiguity =
    best && best.ambiguous && !matched.some((m) => !m.ambiguous)
      ? best.note
      : undefined;

  return { expansion: [...new Set(expansion)], matched, ambiguity };
}
