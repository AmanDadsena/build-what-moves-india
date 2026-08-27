import { REJECTIONS } from "./rejections";
import { CLOCKS, ESCALATION_LADDER } from "./escalation";
import { DOCUMENTS } from "./documents";
import { SERVICES } from "./services";
import type { Provenance } from "./types";

/* ============================================================
   The answer index.

   This is retrieval, not generation. Every answer returned here is
   a passage already written in this codebase, handed back with the
   source it came from attached.

   That is a deliberate product decision rather than a limitation.
   The questions people bring to a provident fund portal are about
   their own money and their statutory rights, and a model that
   writes fluent, plausible, wrong sentences about the Right to
   Information Act would be worse than no answer at all. A system
   that can only repeat sourced text cannot invent a deadline that
   does not exist.

   Entries are derived from the same data the rest of the portal
   renders, so an answer can never drift from what the interface
   says elsewhere.
   ============================================================ */

export interface KnowledgeEntry {
  id: string;
  kind: "rejection" | "clock" | "escalation" | "document" | "service";
  /** How this entry would be phrased as a question. */
  question: string;
  answer: string;
  answerHi?: string;
  /** Named source, shown with the answer. */
  citation: string;
  provenance: Provenance;
  /** Where in the portal the member acts on this. */
  path?: string;
  linkLabel?: string;
  /** Text the query is scored against. */
  haystack: string;
}

function build(): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [];

  for (const r of REJECTIONS) {
    entries.push({
      id: `rejection:${r.id}`,
      kind: "rejection",
      question: r.title,
      answer: `${r.plain} ${r.mechanism}`,
      answerHi: r.plainHi,
      citation: `Rejection remark: “${r.verbatim[0]}”`,
      provenance: "verified",
      path: "/claims",
      linkLabel: "See this in a case file",
      haystack: [
        r.title,
        r.plain,
        r.mechanism,
        ...r.verbatim,
        ...r.fixSteps.map((s) => s.instruction),
        r.whoMustAct,
      ].join(" "),
    });

    // The ordered fix is a distinct question from the diagnosis.
    entries.push({
      id: `fix:${r.id}`,
      kind: "rejection",
      question: `How do I fix “${r.title.toLowerCase()}”?`,
      answer: r.fixSteps
        .map(
          (s, i) =>
            `${i + 1}. ${s.instruction} (${
              s.actor === "member"
                ? "you"
                : s.actor === "employer"
                  ? "your employer"
                  : "EPFO"
            }, about ${s.days} ${s.days === 1 ? "day" : "days"}, at ${s.where})`
        )
        .join("\n"),
      citation: `EPFO correction procedure · typically ${r.typicalDays} days`,
      provenance: "verified",
      path: "/file",
      linkLabel: "Run a pre-flight check",
      haystack: [
        "how do i fix repair correct solve",
        r.title,
        ...r.fixSteps.map((s) => `${s.instruction} ${s.where}`),
      ].join(" "),
    });
  }

  for (const c of Object.values(CLOCKS)) {
    entries.push({
      id: `clock:${c.id}`,
      kind: "clock",
      question: `${c.label} — how long, and what happens if it passes?`,
      answer: `${c.days} days. ${c.consequence}${
        c.resettable
          ? " This clock restarts each time a desk returns the file as incomplete."
          : " This clock does not reset."
      }`,
      citation: c.authority,
      provenance: c.kind === "hard" ? "statutory" : "verified",
      path: "/grievance",
      linkLabel: "See the escalation ladder",
      haystack: [
        c.label,
        c.consequence,
        c.authority,
        c.kind === "hard" ? "statutory legal binding penalty deadline" : "service commitment courtesy target",
        "how long days deadline time limit wait",
      ].join(" "),
    });
  }

  for (const s of ESCALATION_LADDER) {
    entries.push({
      id: `escalation:${s.id}`,
      kind: "escalation",
      question: `What is ${s.channel} and is it worth using?`,
      answer: `${s.what} It runs on a ${s.clock.days}-day ${
        s.clock.kind === "hard" ? "statutory" : "administrative"
      } clock. ${s.clock.consequence}`,
      citation: s.clock.authority,
      provenance: s.clock.kind === "hard" ? "statutory" : "verified",
      path: "/grievance",
      linkLabel: "See the escalation ladder",
      haystack: [s.channel, s.what, s.clock.authority, "complain grievance escalate appeal"].join(" "),
    });
  }

  for (const d of DOCUMENTS) {
    entries.push({
      id: `document:${d.id}`,
      kind: "document",
      question: `What is the ${d.title.toLowerCase()} for?`,
      answer: `${d.purpose} ${d.standing} Sent to: ${d.channel}.`,
      answerHi: undefined,
      citation: `Document template · ${d.titleHi}`,
      provenance: d.id.startsWith("rti") ? "statutory" : "verified",
      path: "/claims",
      linkLabel: "Open your documents",
      haystack: [d.title, d.titleHi, d.purpose, d.standing, d.channel, "letter draft write send document form"].join(" "),
    });
  }

  for (const s of SERVICES) {
    entries.push({
      id: `service:${s.id}`,
      kind: "service",
      question: `Where do I ${s.title.toLowerCase()}?`,
      answer: `${s.blurb} ${s.change}`,
      answerHi: undefined,
      citation: s.formLabel ? `Service · ${s.formLabel}` : "Portal service",
      provenance: "verified",
      path: s.path,
      linkLabel: `Open ${s.nav}`,
      haystack: [s.title, s.titleHi, s.nav, s.blurb, s.change, s.formLabel ?? "", s.category].join(" "),
    });
  }

  return entries;
}

export const KNOWLEDGE = build();

/* ---------------- retrieval ---------------- */

const STOP = new Set([
  "the", "a", "an", "is", "was", "are", "not", "in", "on", "of", "to", "and",
  "with", "for", "my", "me", "i", "do", "does", "how", "what", "why", "when",
  "where", "can", "should", "will", "if", "it", "this", "that", "at", "from",
  "be", "been", "have", "has", "get", "got", "you", "your", "there", "then",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9ऀ-ॿ\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

export interface Answer {
  entry: KnowledgeEntry;
  score: number;
}

export function ask(query: string, limit = 4): Answer[] {
  const q = tokens(query);
  if (q.length === 0) return [];

  const scored = KNOWLEDGE.map((entry) => {
    const bag = tokens(entry.haystack);
    const set = new Set(bag);

    let hits = 0;
    for (const t of q) {
      if (set.has(t)) hits += 1;
      else if (bag.some((h) => h.startsWith(t) || t.startsWith(h))) hits += 0.5;
    }

    // A question that echoes the entry's own phrasing is a strong signal.
    const questionTokens = new Set(tokens(entry.question));
    const questionOverlap =
      q.filter((t) => questionTokens.has(t)).length / q.length;

    return { entry, score: hits / q.length + questionOverlap * 0.5 };
  });

  return scored
    .filter((s) => s.score >= 0.34)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Shown before anyone types, because a blank box teaches nothing. */
export const SUGGESTED = [
  "Why was my claim rejected for demographic discrepancy?",
  "My employer has not marked my exit date",
  "How long does EPFO have to settle my claim?",
  "What can I do if nobody replies to my grievance?",
  "Do I need ten years of service for a pension?",
  "What is an RTI and will it actually help?",
];
