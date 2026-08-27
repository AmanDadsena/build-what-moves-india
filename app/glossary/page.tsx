"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { GLOSSARY, CATEGORIES, searchTerms, type Term } from "@/lib/glossary";
import { ReadAloud } from "@/components/ReadAloud";
import { PageHero } from "@/components/PageHero";

const DEMO_UAN = "990012345678";

/* Every entry answers two questions, not one.

   A definition that stops at "what it means" is a dictionary. The
   second line — why it matters to the person reading — is the part
   that changes what they do next, and it is the part every official
   glossary leaves out. */

const TONE: Record<string, { border: string; dot: string; text: string }> = {
  "Your account": {
    border: "hover:border-noting",
    dot: "bg-noting",
    text: "text-noting",
  },
  Money: {
    border: "hover:border-verify",
    dot: "bg-verify",
    text: "text-verify",
  },
  Paperwork: {
    border: "hover:border-pending",
    dot: "bg-pending",
    text: "text-pending",
  },
  "When it goes wrong": {
    border: "hover:border-stamp",
    dot: "bg-stamp",
    text: "text-stamp",
  },
};

export default function Glossary() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const results = useMemo(() => {
    const found = searchTerms(query);
    return filter ? found.filter((t) => t.category === filter) : found;
  }, [query, filter]);

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Plain language"
          provenance="verified"
          title="The words this system uses, and what they cost you."
          lede="Every entry says what the word means and why it matters to you. The second part is the one official glossaries leave out."
        />

        {/* Controls get their own light band. A search field on navy
            needs its own contrast handling and gains nothing from it. */}
        <section className="border-b border-rule bg-paper-raised">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-7">

            <div className="max-w-xl mb-5">
              <label htmlFor="gl" className="sr-only">
                Search the glossary
              </label>
              <input
                id="gl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ECR, deficiency, ten years, tax…"
                autoComplete="off"
                className="w-full border border-rule-heavy bg-paper rounded-md px-4 py-3.5 text-base sm:text-lg outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12 placeholder:text-ink-faint/60"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter(null)}
                aria-pressed={filter === null}
                className={`btn btn-sm ${filter === null ? "btn-primary" : "btn-secondary"}`}
              >
                All {GLOSSARY.length}
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(filter === c ? null : c)}
                  aria-pressed={filter === c}
                  className={`btn btn-sm ${filter === c ? "btn-primary" : "btn-secondary"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14 space-y-8">
          {results.length === 0 ? (
            <div
              role="status"
              className="border border-rule bg-paper-raised rounded-lg px-6 py-8 text-center"
            >
              <p className="display-3 mb-2">No entry for that</p>
              <p className="text-ink-soft leading-relaxed measure mx-auto mb-5">
                Try the word as it appeared on screen, even if it looked like
                nonsense — that is usually the one worth looking up.
              </p>
              <Link
                href={`/portal/${DEMO_UAN}/ask`}
                className="btn btn-primary btn-sm"
              >
                Ask instead
              </Link>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {results.map((t) => (
                <Entry key={t.term} term={t} />
              ))}
            </ul>
          )}

          <p className="text-sm text-ink-faint">
            {results.length} of {GLOSSARY.length} entries
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function Entry({ term }: { term: Term }) {
  const tone = TONE[term.category];

  return (
    <li>
      <div
        className={`lift-hover h-full border border-rule bg-paper-raised rounded-lg p-5 ${tone.border}`}
      >
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full shrink-0 ${tone.dot}`}
          />
          <h2 className="display-3">{term.term}</h2>
        </div>
        <p className="font-deva text-sm text-ink-faint mb-3">{term.termHi}</p>

        <p className="text-ink-soft leading-relaxed mb-4">{term.meaning}</p>

        <div className="pt-4 border-t border-rule">
          <p className={`eyebrow mb-1.5 ${tone.text}`}>Why it matters to you</p>
          <p className="text-sm leading-relaxed">{term.matters}</p>
        </div>

        <ReadAloud
          className="mt-4"
          en={`${term.term}. ${term.meaning} Why it matters to you. ${term.matters}`}
        />
      </div>
    </li>
  );
}
