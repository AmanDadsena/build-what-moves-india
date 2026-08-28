import { REJECTIONS } from "./rejections";
import { GLOSSARY } from "./glossary";
import { SERVICES } from "./services";
import { DOCUMENTS } from "./documents";
import { OFFICES } from "./offices";
import { KNOWLEDGE } from "./knowledge";
import { titleAliases } from "./i18n";

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

export function search(query: string, limit = 12): Result[] {
  const phrase = normalise(query);
  if (phrase.length < 2) return [];

  const tokens = phrase.split(" ").filter(Boolean);
  const strong = tokens.filter((t) => !WEAK.has(t));
  // A query made only of weak words still deserves an attempt.
  const scoring = strong.length > 0 ? strong : tokens;

  const results: Result[] = [];

  for (const item of INDEX) {
    const haystackTokens = item.haystack.split(" ");
    const bag = new Set(haystackTokens);
    const title = normalise(item.title);

    let score = 0;

    for (const token of scoring) {
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

    if (score === 0) continue;

    // The whole query appearing verbatim is close to conclusive.
    if (phrase.length >= 6 && item.haystack.includes(phrase)) score += 4;

    results.push({ ...item, score: (score / scoring.length) * item.weight });
  }

  return results
    .filter((r) => r.score >= 0.8)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
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
