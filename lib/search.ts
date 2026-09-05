import { REJECTIONS } from "./rejections";
import { GLOSSARY } from "./glossary";
import { SERVICES } from "./services";
import { DOCUMENTS } from "./documents";
import { OFFICES } from "./offices";
import { KNOWLEDGE } from "./knowledge";
import { titleAliases } from "./i18n";
import { read, type Reading } from "./phrasebook";

/* ============================================================
   One search box for the whole site.

   This exists because of a mistake every public-service site makes,
   and the one this product was built to stop making: it asks the
   member to already know which of its compartments their question
   belongs to. Is "deficiency memo" a glossary word, a rejection
   reason, or a form? Is "my money hasn't come" a service or a
   question? The taxonomy is the institution's, and requiring somebody
   to navigate it before they can ask is the same failure as a
   rejection remark written in office vocabulary.

   So there is one index over everything — rejection remarks, plain
   language terms, services, letters, offices and the written
   answers — and every result says what kind of thing it is rather
   than making the member work it out. Nobody has to choose a
   department first.

   The matching is deliberately forgiving in one direction only. It
   will complete a word somebody has half-typed and it will match an
   alias they know the thing by, because both of those are the member
   being reasonable. It will not guess at a word it does not hold: an
   empty result that says so is better than a confident wrong answer
   about somebody's money.
   ============================================================ */

export type ResultKind =
  | "reason"
  | "term"
  | "service"
  | "document"
  | "office"
  | "answer"
  | "page";

export interface Indexed {
  id: string;
  kind: ResultKind;
  title: string;
  /** Shown under the title. One line. */
  snippet: string;
  href: string;
  /** Extra words this should be findable by, never displayed. */
  aliases: string[];
  /** Everything scored against, built once. */
  haystack: string;
  /** Nudges genuinely more useful kinds up when scores tie. */
  weight: number;
}

export interface Result extends Indexed {
  score: number;
}

const DEMO_UAN = "990012345678";

export const KIND_LABEL: Record<ResultKind, string> = {
  reason: "Rejection reason",
  term: "Plain language",
  service: "Service",
  document: "Letter we can draft",
  office: "Office",
  answer: "Answer",
  page: "Page",
};

/* Pages that are not generated from data. Their aliases carry the
   words somebody would actually use — "husband died", "is this a
   scam" — rather than the words on the page. */
const PAGES: Array<Omit<Indexed, "haystack">> = [
  {
    id: "page-why",
    kind: "page",
    title: "Every reason a claim is rejected",
    snippet: "Fifteen remarks, each translated into what it actually means.",
    href: "/why/",
    aliases: ["rejected", "why", "reason", "failed", "declined", "returned"],
    weight: 1.2,
  },
  {
    id: "page-what-it-costs",
    kind: "page",
    title: "What chasing this actually costs you",
    snippet:
      "Every route priced in a day's wages. The advice given most freely is the dearest thing on the list.",
    href: "/what-it-costs/",
    aliases: [
      "cost",
      "costs",
      "costly",
      "cheap",
      "cheapest",
      "expensive",
      "price",
      "fee",
      "fees",
      "free",
      "money",
      "rupees",
      "wage",
      "wages",
      "salary",
      "daily",
      "mazdoori",
      "kharcha",
      "paisa",
      "travel",
      "fare",
      "bus",
      "train",
      "trip",
      "visit",
      "office",
      "leave",
      "day",
      "days",
      "off",
      "lost",
      "worth",
      "time",
    ],
    weight: 1.1,
  },
  {
    id: "page-employer-gone",
    kind: "page",
    title: "My employer has closed or will not act",
    snippet:
      "Nine of the fifteen reasons need the employer. These are the routes when there is no employer.",
    href: "/employer-gone/",
    aliases: [
      "employer",
      "employers",
      "company",
      "companies",
      "firm",
      "factory",
      "establishment",
      "closed",
      "close",
      "closing",
      "shut",
      "shutdown",
      "bandh",
      "band",
      "gone",
      "left",
      "quit",
      "sold",
      "merged",
      "liquidation",
      "struck",
      "defunct",
      "nonfunctional",
      "absconding",
      "refusing",
      "refuse",
      "refused",
      "ignoring",
      "ignores",
      "unreachable",
      "untraceable",
      "contractor",
      "agency",
      "attest",
      "attestation",
      "attested",
      "signature",
      "sign",
      "countersign",
      "hr",
      "boss",
      "malik",
      "owner",
      "nobody",
      "noone",
      "stuck",
      "dead",
      "end",
    ],
    weight: 1.35,
  },
  {
    id: "page-safety",
    kind: "page",
    title: "Is this really EPFO?",
    snippet:
      "Seven questions that tell a genuine approach from a fraudulent one.",
    href: "/safety/",
    aliases: [
      "scam",
      "fraud",
      "cheat",
      "cheated",
      "fake",
      "call",
      "called",
      "otp",
      "password",
      "phishing",
      "agent",
      "commission",
      "bribe",
      "thug",
      "pay",
      "paying",
      "payment",
      "fee",
      "charge",
      "charging",
      "asked",
      "asking",
      "someone",
      "somebody",
      "trust",
      "genuine",
      "real",
      "link",
      "message",
      "whatsapp",
      "sms",
    ],
    weight: 1.3,
  },
  {
    id: "page-death",
    kind: "page",
    title: "If the member has died",
    snippet:
      "Three separate things are owed, and most families claim only one.",
    href: "/after-a-death/",
    aliases: [
      "death",
      "died",
      "deceased",
      "widow",
      "widower",
      "family",
      "survivor",
      "husband",
      "wife",
      "father",
      "mother",
      "funeral",
      "edli",
      "insurance",
      "form 20",
      "form 5if",
    ],
    weight: 1.3,
  },
  {
    id: "page-uan",
    kind: "page",
    title: "I don't know my UAN",
    snippet:
      "Seven ways to find it, and the one question that rules out three of them.",
    href: "/find-your-uan/",
    aliases: [
      "uan",
      "number",
      "account number",
      "forgot",
      "lost",
      "dont know",
      "do not know",
      "find",
      "member id",
      "activate",
      "registered mobile",
      "otp not coming",
      "no uan",
    ],
    weight: 1.3,
  },
  {
    id: "page-payslip",
    kind: "page",
    title: "Check your payslip",
    snippet:
      "Two numbers off your payslip, and you can check the arithmetic yourself.",
    href: "/check-your-payslip/",
    aliases: [
      "payslip",
      "salary slip",
      "deduction",
      "deducted",
      "12 percent",
      "12%",
      "1800",
      "ceiling",
      "15000",
      "contribution",
      "less deducted",
      "wrong amount",
      "employer not paying",
      "calculate",
      "basic da",
    ],
    weight: 1.3,
  },
  {
    id: "page-employers",
    kind: "page",
    title: "For employers - what only you can do",
    snippet:
      "Five actions a member cannot take themselves, and why each one needs the establishment.",
    href: "/for-employers/",
    aliases: [
      "employer",
      "hr",
      "company",
      "establishment",
      "kyc approval",
      "approve",
      "attest",
      "signature",
      "joint declaration",
      "not signing",
      "not approving",
      "office not doing",
    ],
    weight: 1.2,
  },
  {
    id: "page-glossary",
    kind: "page",
    title: "Plain language",
    snippet: "What the words mean, and why each one matters to you.",
    href: "/glossary/",
    aliases: ["glossary", "dictionary", "meaning", "jargon", "words"],
    weight: 1,
  },
  {
    id: "page-help",
    kind: "page",
    title: "Help & contact",
    snippet: "Four ways to raise this, and what each one can actually do.",
    href: "/help/",
    aliases: ["help", "contact", "phone", "call", "helpline", "complain"],
    weight: 1.1,
  },
  {
    id: "page-downloads",
    kind: "page",
    title: "Forms & downloads",
    snippet: "Which form you need, in words rather than numbers.",
    href: "/downloads/",
    aliases: ["form", "download", "pdf", "paper"],
    weight: 1,
  },
  {
    id: "page-waiting",
    kind: "page",
    title: "Still waiting on a claim",
    snippet:
      "How long is normal, why the count restarts, and when each escalation opens.",
    href: "/still-waiting/",
    aliases: [
      "waiting",
      "pending",
      "delay",
      "delayed",
      "under process",
      "no update",
      "how long",
      "status",
      "stuck",
      "not credited",
      "money not received",
    ],
    weight: 1.3,
  },
  {
    id: "page-offices",
    kind: "page",
    title: "Find your regional office",
    snippet: "Which office holds your file, and what to bring.",
    href: "/offices/",
    aliases: ["office", "address", "regional", "visit", "where"],
    weight: 1,
  },
  {
    id: "page-how-real",
    kind: "page",
    title: "What is real here, and what is not",
    snippet: "A line-by-line account of what is sourced and what is invented.",
    href: "/how-real/",
    aliases: ["real", "fake", "prototype", "disclaimer", "about", "honest"],
    weight: 0.8,
  },
];

/* \p{M} — combining marks — has to be kept, and leaving it out was a
   real bug rather than a nicety.
 
   Every Indic vowel sign, matra and virama is a mark, not a letter.
   Stripping them did not just lose accents: it shredded each word
   into loose consonants, so "પાસબુક" became "પ સબ ક" and "ನಿಮ್ಮ"
   became "ನ ಮ ಮ". Single consonants then matched almost everything,
   which is why a generic query returned a confident and wrong page.
 
   It had been quietly breaking the Hindi aliases since long before
   the other scripts arrived; nothing failed, results were just
   subtly wrong. */
function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function build(): Indexed[] {
  const items: Indexed[] = [];

  for (const r of REJECTIONS) {
    items.push({
      id: `reason-${r.id}`,
      kind: "reason",
      title: r.title,
      snippet: r.verbatim[0],
      href: `/why/${r.id}/`,
      /* Every translated title, so a query spoken in Bengali or
         Kannada reaches the page even though the explanation on it
         is in English. */
      aliases: [...r.verbatim, r.titleHi, ...titleAliases(r.id)],
      haystack: "",
      weight: 1.4,
    });
  }

  for (const t of GLOSSARY) {
    items.push({
      id: `term-${t.term}`,
      kind: "term",
      title: t.term,
      snippet: t.meaning,
      href: "/glossary/",
      aliases: [...t.aliases, t.termHi, t.category],
      haystack: "",
      weight: 1.1,
    });
  }

  for (const s of SERVICES) {
    items.push({
      id: `service-${s.id}`,
      kind: "service",
      title: s.title,
      snippet: s.blurb,
      href: `/portal/${DEMO_UAN}${s.path}/`,
      aliases: [s.titleHi, s.nav, s.formLabel ?? "", s.category],
      haystack: "",
      weight: 1,
    });
  }

  for (const d of DOCUMENTS) {
    items.push({
      id: `doc-${d.id}`,
      kind: "document",
      title: d.title,
      snippet: d.purpose,
      href: "/downloads/",
      aliases: [d.titleHi, d.channel, d.format],
      haystack: "",
      weight: 0.9,
    });
  }

  for (const o of OFFICES) {
    items.push({
      id: `office-${o.id}`,
      kind: "office",
      title: `${o.name}, ${o.city}`,
      snippet: o.address,
      href: "/offices/",
      aliases: [o.state, ...o.covers],
      haystack: "",
      weight: 0.7,
    });
  }

  for (const k of KNOWLEDGE) {
    items.push({
      id: `answer-${k.id}`,
      kind: "answer",
      title: k.question,
      snippet: k.answer,
      /* KnowledgeEntry.path is portal-relative — "/claims", not
         "/portal/.../claims" — because its other consumer supplies the
         member's own UAN. Using it raw here produced links to "/file/"
         that went nowhere. */
      href: k.path !== undefined ? `/portal/${DEMO_UAN}${k.path}/` : "/glossary/",
      aliases: [k.citation],
      haystack: "",
      weight: 0.95,
    });
  }

  for (const p of PAGES) {
    items.push({ ...p, haystack: "" });
  }

  // One pass to build what everything is actually scored against.
  for (const item of items) {
    item.haystack = normalise(
      [item.title, item.snippet, ...item.aliases].join(" "),
    );
  }

  return items;
}

export const INDEX = build();

/* Words carried by nearly every entry. Left in the haystack, because
   an exact phrase should still match, but they earn nothing on their
   own — otherwise "my claim" ranks the entire index. */
const WEAK = new Set([
  "the", "a", "an", "is", "was", "are", "of", "to", "and", "or", "in",
  "on", "for", "with", "your", "you", "my", "me", "i", "it", "this",
  "that", "be", "have", "has", "not", "no", "epf", "epfo", "pf",
  "provident", "fund", "claim", "member", "portal", "money",
]);

/** Scores one item against a list of tokens. Extracted so the words
 *  somebody typed and the words the phrasebook read them as can be
 *  scored on the same rules but weighted differently.
 *
 *  Returns the raw sum; the caller decides how to normalise it, which
 *  differs between a typed query and an inferred one. */
function scoreAgainst(item: Indexed, tokens: string[]): number {
  if (tokens.length === 0) return 0;

  const haystackTokens = item.haystack.split(" ");
  const bag = new Set(haystackTokens);
  const title = normalise(item.title);

  let score = 0;
  for (const token of tokens) {
    if (bag.has(token)) {
      score += title.includes(token) ? 3 : 2;
      continue;
    }
    // Half-typed word: "deficien" should reach "deficiency".
    if (token.length >= 4 && haystackTokens.some((h) => h.startsWith(token))) {
      score += title.startsWith(token) ? 2 : 1.2;
      continue;
    }
    // Over-typed: "nominations" should reach "nomination".
    if (haystackTokens.some((h) => h.length >= 4 && token.startsWith(h))) {
      score += 0.8;
    }
  }
  return score;
}

/* What an inferred word is worth against one the member actually
   typed. Below one on purpose: a genuine English match should still
   outrank a reading, so somebody searching "name" gets the name pages
   ahead of everything the phrasebook thinks "naam" implies. */
const INFERRED_WEIGHT = 0.75;

/* The typed query is a conjunction — every word is something the
   member chose, so the score is averaged over all of them and a word
   that matches nothing costs you.

   The expansion is not. It is a disjunction: a list of ways the same
   symptom is described in the index's vocabulary, and a page matching
   four of thirteen is a good match rather than a poor one. Averaging
   over the whole list punished the richest and most useful readings —
   "paisa nahi aaya" expands to eight phrases and returned one result
   because of it. So the expansion is summed, damped and capped
   instead: coverage is rewarded, breadth is not penalised, and no
   amount of expansion can outweigh a real typed match. */
function inferredScore(raw: number): number {
  return Math.min(raw / 4, 3) * INFERRED_WEIGHT;
}

export interface Interpretation {
  results: Result[];
  /** How the query was read, where the phrasebook recognised it. */
  reading: Reading;
}

/** Search, plus what the phrasebook made of the query.
 *
 *  Split from search() rather than changing its return type, because
 *  most callers want a list of results and only the results page
 *  needs to tell somebody their question was ambiguous. */
export function interpret(query: string, limit = 12): Interpretation {
  const phrase = normalise(query);
  const reading = read(query);

  if (phrase.length < 2) return { results: [], reading };

  const tokens = phrase.split(" ").filter(Boolean);
  const strong = tokens.filter((t) => !WEAK.has(t));
  // A query made only of weak words still deserves an attempt.
  const scoring = strong.length > 0 ? strong : tokens;

  /* The vocabulary the phrasebook translated the query into, reduced
     to tokens and stripped of anything already typed or too common to
     earn anything. Empty for an ordinary English query, which is why
     this changes nothing for one. */
  const typed = new Set(scoring);
  const inferred = [
    ...new Set(
      reading.expansion
        .flatMap((m) => normalise(m).split(" "))
        .filter((t) => t.length > 1 && !WEAK.has(t) && !typed.has(t)),
    ),
  ];

  const results: Result[] = [];

  for (const item of INDEX) {
    const base = scoreAgainst(item, scoring) / scoring.length;
    const extra = inferredScore(scoreAgainst(item, inferred));
    let score = base + extra;

    if (score === 0) continue;

    // The whole query appearing verbatim is close to conclusive.
    if (phrase.length >= 6 && item.haystack.includes(phrase)) score += 4;

    results.push({ ...item, score: score * item.weight });
  }

  return {
    reading,
    results: results
      .filter((r) => r.score >= 0.8)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, limit),
  };
}

export function search(query: string, limit = 12): Result[] {
  return interpret(query, limit).results;
}

/** What to offer before anybody has typed. Chosen as the things
 *  people arrive holding, not as a tour of the site. */
export const COMMON = [
  "my claim was rejected",
  "money not received",
  "name not matching aadhaar",
  "date of exit not marked",
  "someone asked me to pay",
  "member has died",
  "how long does it take",
  "deficiency memo",
];
