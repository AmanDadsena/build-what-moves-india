"use client";

import Link from "next/link";
import { useState } from "react";
import { TRIAGE, TRIAGE_START, isOutcome } from "@/lib/triage";

/* Three taps to an answer.

   Each step replaces the last rather than stacking, so the screen
   never grows into something to scroll. Answers already given stay
   visible as a small trail — a person who has tapped twice should be
   able to see what they said and change it. */

export function Triage({ uan }: { uan: string }) {
  const [path, setPath] = useState<string[]>([TRIAGE_START]);
  const [chosen, setChosen] = useState<string[]>([]);

  const currentId = path[path.length - 1];
  const node = TRIAGE[currentId];

  const answer = (label: string, next: string) => {
    setChosen((c) => [...c, label]);
    setPath((p) => [...p, next]);
  };

  const back = () => {
    setChosen((c) => c.slice(0, -1));
    setPath((p) => p.slice(0, -1));
  };

  const restart = () => {
    setChosen([]);
    setPath([TRIAGE_START]);
  };

  return (
    <div className="border border-rule-heavy bg-paper-raised rounded-lg overflow-hidden card-lift">
      <div className="border-b border-rule px-5 py-3.5 flex items-center justify-between gap-3">
        <p className="eyebrow">Not sure what to ask?</p>
        {path.length > 1 && (
          <button onClick={restart} className="btn btn-ghost btn-sm">
            Start over
          </button>
        )}
      </div>

      {/* Trail of what has been answered so far. */}
      {chosen.length > 0 && (
        <ol className="px-5 pt-4 space-y-1">
          {chosen.map((c, i) => (
            <li
              key={i}
              className="text-sm text-ink-faint flex items-start gap-2"
            >
              <span aria-hidden className="machine text-xs pt-0.5">
                ✓
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="p-5">
        {!isOutcome(node) ? (
          <>
            <h3 className="display-3 mb-1.5">{node.prompt}</h3>
            <p className="font-deva text-sm text-ink-faint mb-5">
              {node.promptHi}
            </p>

            <ul className="space-y-2">
              {node.options.map((opt) => (
                <li key={opt.next}>
                  <button
                    onClick={() => answer(opt.label, opt.next)}
                    className="press w-full text-left border border-rule bg-paper px-4 py-3.5 rounded-xs hover:border-ink hover:bg-paper-raised group"
                  >
                    <span className="block group-hover:text-ink">
                      {opt.label}
                    </span>
                    <span className="block font-deva text-sm text-ink-faint mt-0.5">
                      {opt.labelHi}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="eyebrow mb-3">Most likely</p>
            <h3 className="display-3 mb-1.5">{node.title}</h3>
            <p className="font-deva text-sm text-ink-faint mb-4">
              {node.titleHi}
            </p>
            <p className="leading-relaxed measure mb-5">{node.body}</p>

            <div className="flex flex-wrap items-center gap-3">
              {node.path && (
                <Link
                  href={`/portal/${uan}${node.path}`}
                  className="btn btn-primary btn-sm"
                >
                  {node.actionLabel}
                </Link>
              )}
              <button onClick={back} className="btn btn-ghost btn-sm">
                Change my answer
              </button>
            </div>

            <p className="text-xs text-ink-faint mt-5 pt-4 border-t border-rule">
              Based on &middot; {node.basis}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
