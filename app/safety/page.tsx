"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { SIGNALS, NEVER, assess } from "@/lib/safety";
import { ReadAloud } from "@/components/ReadAloud";
import { PageHero } from "@/components/PageHero";

const DEMO_UAN = "990012345678";

/* Somebody has just been contacted about their claim and wants to
   know whether to believe it.

   The design follows from that. There is no reading to do first: the
   questions are the page. Each one is answerable from memory in a
   second, in any order, and a verdict appears the moment a
   conclusive answer is given rather than after the set is complete —
   because the first question alone is often enough, and making
   somebody finish a form before telling them they are being defrauded
   is a cruelty dressed as thoroughness. */

const TONE = {
  fraud: {
    border: "border-stamp",
    wash: "bg-stamp-wash",
    text: "text-stamp",
    tag: "tag-danger",
  },
  warn: {
    border: "border-pending",
    wash: "bg-pending-wash",
    text: "text-pending",
    tag: "tag-warn",
  },
  clear: {
    border: "border-verify",
    wash: "bg-verify-wash",
    text: "text-verify",
    tag: "tag-ok",
  },
} as const;

export default function Safety() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const answered = Object.keys(answers).length;
  const verdict = useMemo(() => assess(answers), [answers]);
  const tone = TONE[verdict.level];

  const set = (id: string, value: boolean) =>
    setAnswers((prev) =>
      prev[id] === value
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id))
        : { ...prev, [id]: value },
    );

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Staying safe"
          provenance="verified"
          title="Somebody has contacted you about your claim. Should you believe them?"
          lede="A member whose claim has been stuck for months is the easiest person in the country to defraud, because everything the fraud says is exactly what their own experience has taught them to expect. Seven questions, answerable from memory."
        />

        <div className="shell py-10 sm:py-14 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          {/* The questions */}
          <div>
            <p className="eyebrow mb-4">What happened</p>
            <ul className="space-y-3">
              {SIGNALS.map((s) => {
                const value = answers[s.id];
                const hit =
                  (s.id === "reference" && value === false) ||
                  (s.id !== "reference" && value === true);
                return (
                  <li key={s.id}>
                    <div
                      className={`border rounded-lg overflow-hidden transition-colors ${
                        hit
                          ? `${TONE[s.level === "clear" ? "warn" : s.level].border} border-2`
                          : "border-rule"
                      } bg-paper-raised`}
                    >
                      <div className="px-5 py-4">
                        <p className="font-semibold leading-relaxed mb-1">
                          {s.question}
                        </p>
                        <p className="font-deva text-sm text-ink-faint mb-4">
                          {s.questionHi}
                        </p>

                        <div
                          role="radiogroup"
                          aria-label={s.question}
                          className="flex gap-2"
                        >
                          {[true, false].map((v) => (
                            <button
                              key={String(v)}
                              role="radio"
                              aria-checked={value === v}
                              onClick={() => set(s.id, v)}
                              className={`press flex-1 text-sm font-semibold py-2.5 rounded-md border transition-colors ${
                                value === v
                                  ? "border-noting bg-noting text-paper"
                                  : "border-rule hover:border-noting hover:bg-noting-wash/50"
                              }`}
                            >
                              {v ? "Yes" : "No"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {hit && (
                        <div
                          className={`px-5 py-4 border-t ${TONE[s.level === "clear" ? "warn" : s.level].wash} ${TONE[s.level === "clear" ? "warn" : s.level].border}`}
                        >
                          <p className="text-sm leading-relaxed">{s.meaning}</p>
                          <p className="font-deva text-sm leading-relaxed mt-3 opacity-80">
                            {s.meaningHi}
                          </p>
                          <ReadAloud
                            className="mt-3"
                            en={s.meaning}
                            hi={s.meaningHi}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* The verdict, and the rules behind it */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div
              role="status"
              className={`border-2 rounded-xl p-6 ${tone.border} ${tone.wash}`}
            >
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <p className="eyebrow mb-0">
                  {answered === 0 ? "Answer any question" : "What this looks like"}
                </p>
                {answered > 0 && (
                  <span className={`tag ${tone.tag}`}>
                    {verdict.level === "fraud"
                      ? "Fraud"
                      : verdict.level === "warn"
                        ? "Do not act yet"
                        : "No warning signs"}
                  </span>
                )}
              </div>

              {answered === 0 ? (
                <p className="text-ink-soft leading-relaxed">
                  Two of these are conclusive on their own. You will know before
                  you reach the end.
                </p>
              ) : (
                <>
                  <h2 className={`display-3 mb-3 ${tone.text}`}>
                    {verdict.title}
                  </h2>
                  <p className="text-sm leading-relaxed mb-4">{verdict.body}</p>

                  <ReadAloud
                    className="mb-4"
                    en={`${verdict.title} ${verdict.body}`}
                  />

                  {verdict.level === "fraud" && (
                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href={`/portal/${DEMO_UAN}/claims`}
                        className="btn btn-primary btn-sm"
                      >
                        Check the real status
                      </Link>
                      <Link href="/help/" className="btn btn-secondary btn-sm">
                        Report it
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border border-rule bg-paper-raised rounded-xl p-6">
              <p className="eyebrow mb-4">
                True of any government office, not only this one
              </p>
              <ul className="space-y-4">
                {NEVER.map((n) => (
                  <li key={n.claim}>
                    <p className="font-semibold leading-relaxed mb-1">
                      {n.claim}
                    </p>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      {n.because}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-l-4 border-noting bg-noting-wash/40 rounded-lg px-5 py-4">
              <p className="eyebrow mb-2">Including this site</p>
              <p className="text-sm leading-relaxed">
                This is an independent prototype and not an official EPFO
                service. It never asks for a real UAN, a password or an OTP, and
                the accounts in it are invented. Apply the same test to it that
                you would apply to anybody else.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
