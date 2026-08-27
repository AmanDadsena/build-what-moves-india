"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { search, COMMON, KIND_LABEL, type ResultKind } from "@/lib/search";
import { Tag } from "@/components/Provenance";

/* One box, everything behind it.
 *
 * Results are ranked flat rather than grouped by kind, and that is the
 * whole argument of the page. Grouping would put the member back in
 * front of the institution's filing system — glossary here, forms
 * there, services somewhere else — and deciding which drawer their
 * question belongs in is precisely the work they came to be spared.
 * The kind is shown on each result as a label, so it informs without
 * ever being a step.
 *
 * The index is compiled into the page, so this searches instantly and
 * works with the connection off. Nothing is sent anywhere: no query
 * from this box reaches a server, which on a site about somebody's
 * blocked money is a property worth having rather than an
 * optimisation.
 */

const TONE: Record<ResultKind, string> = {
  reason: "tag-danger",
  term: "tag-info",
  service: "tag-neutral",
  document: "tag-warn",
  office: "tag-neutral",
  answer: "tag-ok",
  page: "tag-neutral",
};

export function SearchPage() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* The query is read from the address bar after mount rather than
     with useSearchParams.

     On a statically exported page that hook buys nothing — the query
     string can only be known in the browser either way — but it does
     force the page behind a Suspense boundary, and React then emits
     the real content into a hidden container at the end of the
     document for a script to relocate. When that relocation does not
     complete, the page renders its fallback and nothing else: the
     search box exists, has results in it, and is invisible. Reading
     location directly removes the boundary and the failure mode with
     it. */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  const results = useMemo(() => search(query), [query]);

  /* Keep the address bar in step so a result can be sent to somebody
     else. history.replaceState rather than the router: this is the
     same page, so there is nothing to route to, and asking the router
     to navigate on every keystroke would refetch the payload each
     time. */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = query.trim();
      window.history.replaceState(
        null,
        "",
        trimmed ? `/search/?q=${encodeURIComponent(trimmed)}` : "/search/",
      );
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  const typed = query.trim().length >= 2;

  return (
    <>
      <section className="border-b border-rule bg-paper-raised">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-10 sm:py-14">
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <p className="eyebrow section-mark mb-0">Search</p>
            <Tag kind="verified" />
          </div>
          <h1 className="display-1 measure mb-4">
            Ask in your own words. You do not have to know which section it
            belongs to.
          </h1>
          <p className="lede measure mb-7">
            Every rejection reason, plain-language term, service, letter and
            office, in one place. Nothing you type here leaves your device.
          </p>

          <label htmlFor="q" className="sr-only">
            Search this site
          </label>
          <input
            id="q"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="money not received, name not matching, someone asked me to pay…"
            autoComplete="off"
            autoFocus
            enterKeyHint="search"
            className="w-full border-2 border-rule-heavy bg-paper rounded-lg px-4 py-4 text-base sm:text-lg outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12 placeholder:text-ink-faint/60"
          />

          {!typed && (
            <div className="mt-6">
              <p className="eyebrow mb-3">What people usually arrive with</p>
              <ul className="flex flex-wrap gap-2">
                {COMMON.map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => {
                        setQuery(c);
                        inputRef.current?.focus();
                      }}
                      className="press border border-rule rounded-full px-3.5 py-2 text-sm hover:border-noting hover:bg-noting-wash/50"
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-10 sm:py-14">
        {typed && (
          <p role="status" className="eyebrow mb-5">
            {results.length === 0
              ? "Nothing here matches that"
              : `${results.length} ${results.length === 1 ? "result" : "results"}`}
          </p>
        )}

        {typed && results.length === 0 && (
          <div className="border border-rule bg-paper-raised rounded-xl px-6 py-8">
            <p className="display-3 mb-3">
              This site does not hold an answer to that.
            </p>
            <p className="text-ink-soft leading-relaxed measure mb-5">
              Rather than return something that looks like an answer, it says
              so. Try the words exactly as they appeared on your screen, even
              if they read like nonsense — that is usually the phrase worth
              searching.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Link href="/why/" className="btn btn-primary btn-sm">
                Browse every rejection reason
              </Link>
              <Link href="/help/" className="btn btn-secondary btn-sm">
                Reach a person
              </Link>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <ul className="border border-rule rounded-xl divide-y divide-rule overflow-hidden">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={r.href}
                  className="press block px-5 py-4 sm:px-6 bg-paper-raised hover:bg-noting-wash/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-1.5 flex-wrap">
                    <p className="font-semibold leading-snug min-w-0">
                      {r.title}
                    </p>
                    <span className={`tag shrink-0 ${TONE[r.kind]}`}>
                      {KIND_LABEL[r.kind]}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">
                    {r.snippet}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {typed && results.length > 0 && (
          <p className="text-sm text-ink-faint leading-relaxed measure mt-6">
            Results are ranked together rather than sorted into sections,
            because working out whether your question is a &ldquo;form&rdquo;
            question or a &ldquo;glossary&rdquo; question is the institution&rsquo;s
            job, not yours.
          </p>
        )}
      </div>
    </>
  );
}
