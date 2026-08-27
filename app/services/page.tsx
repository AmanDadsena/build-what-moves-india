"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { directory, groupByLetter, matches } from "@/lib/directory";
import { SERVICE_ICONS, IconAsk } from "@/components/Icons";
import { SERVICES } from "@/lib/services";
import { PageHero } from "@/components/PageHero";

const DEMO_UAN = "990012345678";

/* The A–Z index.

   Filtering runs over hidden aliases as well as titles, so "adhaar",
   "pf nikalna" and "form 19" all land on the right entry even though
   none of those words appear in one. The letter rail is for people
   who would rather scan than type.

   Each card is colour-keyed to the part of the service it belongs to,
   which is the only ornament here that carries information: money,
   claims, identity, and what to do when it goes wrong. */

const CATEGORY_STYLE: Record<
  string,
  { ring: string; icon: string; wash: string; dot: string }
> = {
  "Your money": {
    ring: "hover:border-verify",
    icon: "text-verify",
    wash: "group-hover:bg-verify-wash",
    dot: "bg-verify",
  },
  Claims: {
    ring: "hover:border-noting",
    icon: "text-noting",
    wash: "group-hover:bg-noting-wash",
    dot: "bg-noting",
  },
  "Your identity": {
    ring: "hover:border-pending",
    icon: "text-pending",
    wash: "group-hover:bg-pending-wash",
    dot: "bg-pending",
  },
  "When it goes wrong": {
    ring: "hover:border-stamp",
    icon: "text-stamp",
    wash: "group-hover:bg-stamp-wash",
    dot: "bg-stamp",
  },
};

const FALLBACK = CATEGORY_STYLE["Claims"];

/** Which section of the portal an entry belongs to. */
function categoryOf(path: string): string {
  const svc = SERVICES.find((s) => s.path === path);
  return svc?.category ?? "Claims";
}

/** Icon for an entry, falling back to a question mark for task terms. */
function iconOf(path: string) {
  const svc = SERVICES.find((s) => s.path === path);
  return (svc && SERVICE_ICONS[svc.id]) || IconAsk;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function ServicesAZ() {
  const [query, setQuery] = useState("");
  const all = useMemo(() => directory(), []);
  const filtered = useMemo(
    () => all.filter((e) => matches(e, query)),
    [all, query]
  );
  const groups = useMemo(() => groupByLetter(filtered), [filtered]);
  const activeLetters = new Set(groups.map(([l]) => l));

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* ---- Head ---- */}
        <PageHero
          eyebrow="All services, A to Z"
          title="Every service, under the word you would look for."
          lede={'Type what you call it. "Passbook", "PF nikalna", "Form 19" and "adhaar" all find the right page.'}
        />

        <section className="border-b border-rule bg-paper-raised">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-10">

            {/* Search */}
            <div className="relative max-w-xl">
              <span
                aria-hidden
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </span>
              <label htmlFor="az" className="sr-only">
                Search services
              </label>
              <input
                id="az"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="passbook, name change, form 19…"
                autoComplete="off"
                className="w-full border border-rule-heavy bg-paper rounded-md pl-12 pr-4 py-3.5 text-base sm:text-lg outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12 placeholder:text-ink-faint/60"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="press absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink px-2 py-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Letter rail */}
            <ul
              className="flex flex-wrap gap-1.5 mt-5"
              aria-label="Jump to letter"
            >
              {ALPHABET.map((letter) => {
                const on = activeLetters.has(letter);
                return (
                  <li key={letter}>
                    {on ? (
                      <a
                        href={`#letter-${letter}`}
                        className="press inline-flex items-center justify-center min-w-[34px] min-h-[34px] text-sm font-semibold border border-rule rounded-md transition-colors hover:border-noting hover:bg-noting hover:text-paper"
                      >
                        {letter}
                      </a>
                    ) : (
                      <span
                        aria-hidden
                        className="inline-flex items-center justify-center min-w-[34px] min-h-[34px] text-sm text-ink-faint/35"
                      >
                        {letter}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ---- Results ---- */}
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14 space-y-12">
          {filtered.length === 0 ? (
            <section
              role="status"
              className="border border-rule bg-paper-raised rounded-lg card-lift px-6 py-8 text-center"
            >
              <p className="display-3 mb-2">Nothing matches that</p>
              <p className="text-ink-soft leading-relaxed measure mx-auto mb-6">
                Try a plainer word — &ldquo;money&rdquo;, &ldquo;name&rdquo;,
                &ldquo;bank&rdquo; — or let us ask you questions instead.
              </p>
              <Link
                href={`/portal/${DEMO_UAN}/ask`}
                className="btn btn-primary"
              >
                Start the guided check
              </Link>
            </section>
          ) : (
            groups.map(([letter, entries]) => (
              <section
                key={letter}
                id={`letter-${letter}`}
                className="scroll-mt-28"
              >
                <div className="flex items-center gap-4 mb-5">
                  <span className="flex items-center justify-center h-11 w-11 rounded-lg bg-noting text-paper display-3 shrink-0">
                    {letter}
                  </span>
                  <span className="h-px flex-1 bg-rule" />
                  <span className="text-sm text-ink-faint">
                    {entries.length}
                  </span>
                </div>

                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((e) => {
                    const style =
                      CATEGORY_STYLE[categoryOf(e.path)] ?? FALLBACK;
                    const Icon = iconOf(e.path);
                    return (
                      <li key={e.term}>
                        <Link
                          href={`/portal/${DEMO_UAN}${e.path}`}
                          className={`lift-hover group flex h-full flex-col border border-rule bg-paper-raised rounded-lg p-5 ${style.ring}`}
                        >
                          <span
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-lg bg-paper-inset transition-colors mb-4 ${style.icon} ${style.wash}`}
                          >
                            <Icon size={22} />
                          </span>

                          <span className="title mb-1">{e.term}</span>
                          <span className="font-deva text-sm text-ink-faint mb-2.5">
                            {e.termHi}
                          </span>
                          <span className="text-sm text-ink-soft leading-relaxed flex-1">
                            {e.description}
                          </span>

                          <span className="flex items-center gap-2 mt-4 text-sm font-semibold text-ink-soft transition-colors group-hover:text-ink">
                            <span
                              aria-hidden
                              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                            />
                            Open
                            <span
                              aria-hidden
                              className="transition-transform group-hover:translate-x-1"
                            >
                              →
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}

          <p className="text-sm text-ink-faint">
            {filtered.length} of {all.length} entries
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
