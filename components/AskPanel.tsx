"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ask, SUGGESTED } from "@/lib/knowledge";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";
import { Triage } from "@/components/Triage";

/* The answer surface.

   Deliberately not a chat window. A chat box invites open-ended
   questions and implies something on the other side that can reason
   about your case; this can only find passages it already holds, so
   it looks like a search over a reference rather than a
   conversation. Every card names its source, and where nothing
   matches it says so instead of producing something plausible. */

export function AskPanel({ uan }: { uan: string }) {
  const [query, setQuery] = useState("");
  const answers = useMemo(() => ask(query), [query]);
  const asked = query.trim().length > 3;

  return (
    <div className="space-y-8 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow section-mark">Ask</p>
          <Tag kind="verified" />
        </div>
        <h2 className="display-2 measure mb-3">
          Answers about your fund, each showing its source.
        </h2>
        <p className="lede measure">
          Retrieved from cited references, never generated.
        </p>

        <Disclose label="Why it cannot make things up" className="mt-4">
          <p className="text-ink-soft leading-relaxed measure">
            A system that writes text can produce a fluent, confident, wrong
            sentence about a statutory deadline. On a page about your own money
            and your own legal rights, that is worse than no answer. This one
            can only repeat text it already holds — so when it has nothing, it
            says so.
          </p>
        </Disclose>
      </section>

      {/* Guided first. Someone who could phrase the question would not
          be stuck; the search box below is for those who can. */}
      <Triage uan={uan} />

      {/* The question */}
      <section>
        <label htmlFor="ask" className="eyebrow block mb-2">
          Or ask in your own words
        </label>
        <div className="border border-rule-heavy bg-paper-raised rounded-lg overflow-hidden">
          <input
            id="ask"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Why was my claim rejected?"
            autoComplete="off"
            className="w-full bg-transparent px-4 py-4 text-base sm:text-lg outline-none placeholder:text-ink-faint/60"
          />
        </div>

        {!asked && (
          <div className="mt-4">
            <p className="eyebrow mb-2.5">Things people ask</p>
            <ul className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => setQuery(s)}
                    className="btn btn-secondary btn-sm text-left"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Answers */}
      {asked && (
        <section>
          {answers.length === 0 ? (
            <div className="border border-rule bg-paper-raised rounded-lg px-5 py-5">
              <p className="eyebrow mb-2">Nothing matched</p>
              <p className="leading-relaxed max-w-2xl mb-4">
                We hold no sourced passage that answers that. Rather than write
                you something that sounds right, here is what we do cover:
                rejection remarks and what causes them, the correction routes,
                the deadlines and which of them bind anyone, and the documents
                you can send.
              </p>
              <ul className="flex flex-wrap gap-2">
                {SUGGESTED.slice(0, 3).map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => setQuery(s)}
                      className="btn btn-secondary btn-sm"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <p className="eyebrow mb-4">
                {answers.length} sourced{" "}
                {answers.length === 1 ? "answer" : "answers"}
              </p>
              <ul className="space-y-5">
                {answers.map(({ entry }) => (
                  <li key={entry.id} className="border border-rule-heavy rounded-lg overflow-hidden">
                    <div className="border-b border-rule bg-paper-inset/60 px-4 py-3 flex items-start justify-between gap-3 flex-wrap">
                      <p className="font-medium leading-snug min-w-0">
                        {entry.question}
                      </p>
                      <Tag kind={entry.provenance} />
                    </div>

                    <div className="px-4 py-4 sm:px-5">
                      <p className="leading-relaxed whitespace-pre-line mb-3">
                        {entry.answer}
                      </p>
                      {entry.answerHi && (
                        <p className="font-deva text-sm text-ink-soft leading-relaxed mb-3">
                          {entry.answerHi}
                        </p>
                      )}

                      <div className="border-t border-rule pt-3 flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-xs text-ink-faint">
                          Source &middot; {entry.citation}
                        </p>
                        {entry.path !== undefined && (
                          <Link
                            href={`/portal/${uan}${entry.path}`}
                            className="press text-sm border border-rule-heavy px-3.5 py-2 rounded-xs hover:border-ink hover:bg-paper-raised"
                          >
                            {entry.linkLabel}
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}
