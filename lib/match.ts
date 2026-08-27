import { REJECTIONS } from "./rejections";
import type { RejectionReason } from "./types";

/* Matching a pasted remark to a known failure.

   Members rarely copy the remark exactly. They retype it, truncate
   it, translate half of it, or paraphrase what a helpline told them.
   So we score on informative token overlap rather than looking for
   an exact string, and we return a confidence the interface can be
   honest about rather than presenting a guess as a finding. */

const STOP = new Set([
  "the", "a", "an", "is", "was", "not", "in", "on", "of", "to", "and",
  "with", "for", "your", "my", "claim", "rejected", "rejection",
  "reason", "epfo", "pf", "please", "sir", "due", "as", "per", "by",
  "has", "been", "it", "this", "that", "at", "from",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

export interface Match {
  rejection: RejectionReason;
  score: number;
  confidence: "high" | "likely" | "uncertain";
}

export function matchRemark(input: string): Match[] {
  const q = tokens(input);
  if (q.length === 0) return [];

  const scored = REJECTIONS.map((rejection) => {
    const haystack = tokens(
      [rejection.title, ...rejection.verbatim, rejection.plain].join(" ")
    );
    const bag = new Set(haystack);

    let hits = 0;
    for (const t of q) {
      if (bag.has(t)) hits += 1;
      // Reward stem-level agreement: "matching" against "match".
      else if (haystack.some((h) => h.startsWith(t) || t.startsWith(h))) {
        hits += 0.5;
      }
    }

    // Exact containment of a known remark is close to conclusive.
    const verbatimHit = rejection.verbatim.some((v) =>
      input.toLowerCase().includes(v.toLowerCase().slice(0, 24))
    );

    const score = hits / q.length + (verbatimHit ? 1 : 0);
    return { rejection, score };
  });

  return scored
    .filter((s) => s.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ rejection, score }) => ({
      rejection,
      score,
      confidence:
        score >= 1 ? "high" : score >= 0.5 ? "likely" : "uncertain",
    }));
}
