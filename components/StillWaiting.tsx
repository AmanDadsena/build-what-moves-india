"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { assessWait, COMMITMENT_DAYS } from "@/lib/waiting";
import { ReadAloud } from "@/components/ReadAloud";
import { Disclose } from "@/components/Motion";
import { PageHero } from "@/components/PageHero";

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const iso = (d: Date) => d.toISOString().slice(0, 10);

/* For the majority, who have not been rejected — they are waiting.
 *
 * The single design decision here is that the answer arrives before
 * any explanation. One date in, and the first thing on screen is the
 * number of days and what that means. Everything else — why the count
 * restarts, which routes are open, what each one is worth — sits
 * below it, for whoever wants it.
 */

const STAGE_TONE = {
  early: { border: "border-verify/40", wash: "bg-verify-wash", text: "text-verify" },
  due: { border: "border-pending/40", wash: "bg-pending-wash", text: "text-pending" },
  over: { border: "border-pending/40", wash: "bg-pending-wash", text: "text-pending" },
  long: { border: "border-stamp/40", wash: "bg-stamp-wash", text: "text-stamp" },
  "very-long": { border: "border-stamp/60", wash: "bg-stamp-wash", text: "text-stamp" },
} as const;

export function StillWaiting() {
  const today = new Date();
  const [filed, setFiled] = useState("");

  const result = useMemo(() => (filed ? assessWait(filed) : null), [filed]);
  const tone = result ? STAGE_TONE[result.stage] : null;

  return (
    <>
      <PageHero
        eyebrow="Still waiting"
        provenance="statutory"
        title="Your claim has not been rejected. It has just not moved."
        lede="Every piece of guidance you can find answers the other question — what to do once you have been refused. This one is for waiting, which is where most people actually are."
      />

      <section className="border-b border-rule bg-paper-raised">
        <div className="shell-reading py-7">
          <div className="max-w-sm">
            <label htmlFor="filed" className="eyebrow block mb-2">
              The date you filed
            </label>
            <input
              id="filed"
              type="date"
              value={filed}
              max={iso(today)}
              onChange={(e) => setFiled(e.target.value)}
              className="w-full border-2 border-rule-heavy bg-paper rounded-lg px-4 py-3.5 text-base outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12"
            />
            <p className="text-xs text-ink-faint mt-2 leading-relaxed">
              Nothing you enter here is sent anywhere. The whole calculation
              happens on this device.
            </p>
          </div>
        </div>
      </section>

      <div className="shell-reading py-10 sm:py-14 space-y-12">
        {!result && (
          <section className="border border-rule bg-paper-raised rounded-xl px-6 py-8">
            <p className="display-3 mb-3">
              While you are looking for the date
            </p>
            <p className="text-ink-soft leading-relaxed measure mb-3">
              The twenty-day settlement commitment is not a deadline. It
              restarts every time a desk marks your file incomplete, and you are
              not told when that happens — so a claim can sit for months without
              the commitment ever being formally breached.
            </p>
            <p className="text-ink-soft leading-relaxed measure">
              One route in the list below carries a period that cannot be
              restarted. It is available on the first day, and every guidance
              document puts it last.
            </p>
          </section>
        )}

        {result && tone && (
          <>
            {/* The answer */}
            <section
              role="status"
              className={`border-2 rounded-xl overflow-hidden ${tone.border}`}
            >
              <div className={`px-6 py-7 ${tone.wash}`}>
                <p className="eyebrow mb-2">
                  Filed {fmt(result.filed)}
                </p>
                <p className="figure text-4xl sm:text-5xl mb-3">
                  {result.elapsed} {result.elapsed === 1 ? "day" : "days"}
                </p>
                <p className={`title measure ${tone.text}`}>
                  {result.headline}
                </p>
                <ReadAloud
                  className="mt-5"
                  en={`Your claim was filed ${fmt(result.filed)}. That is ${result.elapsed} days ago. ${result.headline}`}
                />
              </div>

              {/* Against the commitment */}
              <div className="px-6 py-6 bg-paper-raised">
                <div className="flex items-baseline justify-between gap-4 mb-2.5 flex-wrap">
                  <p className="eyebrow mb-0">
                    Against the {COMMITMENT_DAYS}-day commitment
                  </p>
                  <p className="num text-sm text-ink-soft">
                    {result.overBy > 0
                      ? `${result.overBy} days past it`
                      : `${COMMITMENT_DAYS - result.elapsed} days still inside it`}
                  </p>
                </div>

                <div
                  aria-hidden
                  className="h-4 rounded-full bg-paper-inset overflow-hidden flex mb-4"
                >
                  <div
                    className="bg-verify h-full"
                    style={{
                      width: `${(Math.min(result.elapsed, COMMITMENT_DAYS) / Math.max(result.elapsed, COMMITMENT_DAYS)) * 100}%`,
                    }}
                  />
                  {result.overBy > 0 && (
                    <div
                      className="bg-stamp h-full"
                      style={{
                        width: `${(result.overBy / result.elapsed) * 100}%`,
                      }}
                    />
                  )}
                </div>

                {result.possibleResets > 0 && (
                  <div className="border-l-4 border-stamp bg-stamp-wash/40 rounded-lg px-5 py-4">
                    <p className="eyebrow mb-2">
                      What the office&rsquo;s own record may show
                    </p>
                    <p className="text-sm leading-relaxed measure">
                      In {result.elapsed} days the count could have restarted{" "}
                      <span className="num font-bold">
                        {result.possibleResets}
                      </span>{" "}
                      {result.possibleResets === 1 ? "time" : "times"} without
                      anything appearing overdue, because each return of the
                      file as incomplete gives it a fresh {COMMITMENT_DAYS}{" "}
                      days. You are not told when that happens. It is why
                      elapsed time and counted time are almost never the same
                      number, and why asking how long it has been produces an
                      answer that does not match your calendar.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* The routes */}
            <section>
              <h2 className="eyebrow section-mark mb-2">What is open to you</h2>
              <p className="text-ink-soft leading-relaxed measure mb-4">
                All four can be used today. Three of them carry no period that
                anybody has to keep. The order below is by what is
                proportionate now, not by what any guidance document
                recommends.
              </p>
              {/* The other axis nobody offers. These are ordered by
                  what is proportionate; they are not ordered by what
                  they cost the person taking them, and for a member
                  on a daily wage that is the ordering that decides
                  which one actually gets used. */}
              <p className="text-ink-soft leading-relaxed measure mb-6">
                They are not ordered by what they cost you, which is a
                different list &mdash;{" "}
                <Link
                  href="/what-it-costs/"
                  className="underline underline-offset-4 decoration-noting hover:text-noting"
                >
                  a day off work costs more than every fee in this process put
                  together
                </Link>
                .
              </p>

              <ol className="space-y-4">
                {[...result.routes]
                  .sort(
                    (a, b) =>
                      Number(b.proportionate) - Number(a.proportionate) ||
                      a.sensibleAfter - b.sensibleAfter,
                  )
                  .map((route) => (
                    <li
                      key={route.id}
                      className={`border rounded-xl overflow-hidden ${
                        route.proportionate
                          ? route.binding === "hard"
                            ? "border-stamp/50"
                            : "border-rule-heavy"
                          : "border-rule"
                      } ${route.proportionate ? "bg-paper-raised" : "bg-paper-inset/30"}`}
                    >
                      <div
                        className={`px-5 py-3 border-b flex items-center justify-between gap-3 flex-wrap ${
                          route.binding === "hard"
                            ? "bg-stamp-wash/50 border-stamp/20"
                            : "bg-paper border-rule"
                        }`}
                      >
                        <p className="font-semibold leading-snug">
                          {route.channel}
                        </p>
                        {route.binding === "hard" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-sm bg-stamp text-paper px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]">
                            <span
                              aria-hidden
                              className="inline-block h-1.5 w-1.5 rounded-full bg-paper/70"
                            />
                            Statutory
                          </span>
                        ) : (
                          <span className="tag tag-neutral">
                            No enforceable period
                          </span>
                        )}
                      </div>

                      <div className="px-5 py-4">
                        <p className="text-sm leading-relaxed measure mb-3">
                          {route.what}
                        </p>

                        <div className="flex items-center gap-2.5 flex-wrap mb-3">
                          <span
                            className={`tag ${route.proportionate ? "tag-ok" : "tag-neutral"}`}
                          >
                            {route.proportionate
                              ? "Proportionate now"
                              : `Reasonable from ${fmt(route.sensibleOn)}`}
                          </span>
                          <span className="num text-xs text-ink-faint">
                            Available from day {route.availableAfter}
                          </span>
                        </div>

                        <p
                          className={`text-sm leading-relaxed measure ${
                            route.binding === "hard"
                              ? "text-stamp"
                              : "text-ink-faint"
                          }`}
                        >
                          {route.consequence}
                        </p>
                        <p className="text-xs text-ink-faint mt-2">
                          {route.authority}
                        </p>

                        {route.href && (
                          <Link
                            href={route.href}
                            className="btn btn-secondary btn-sm mt-4"
                          >
                            {route.id === "rti"
                              ? "See the RTI this site drafts"
                              : "Where to do this"}
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
              </ol>
            </section>

            <section className="border-2 border-noting/40 bg-paper-raised rounded-xl p-6 sm:p-8">
              <h2 className="eyebrow section-mark mb-3">The thing to notice</h2>
              <h2 className="display-2 measure mb-4">
                The only route with a deadline anybody must keep is the one
                placed last.
              </h2>
              <p className="text-ink-soft leading-relaxed measure mb-3">
                An RTI application about your own file can be made on the day
                you file the claim. It costs ₹10. A reply is due in thirty days,
                silence past that is a deemed refusal, and the penalty for it
                falls on the Public Information Officer personally rather than
                on the department.
              </p>
              <p className="text-ink-soft leading-relaxed measure mb-6">
                Every guidance document, including the official ones, puts it
                after the helpline, after the grievance and after the escalated
                grievance — behind three steps that carry no period at all.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/login/" className="btn btn-primary">
                  Have the RTI drafted for you
                </Link>
                <Link href="/glossary/" className="btn btn-secondary">
                  What these words mean
                </Link>
              </div>
            </section>
          </>
        )}

        <Disclose
          label="Where these periods come from"
          className="border-l-4 border-rule-heavy bg-paper-inset/40 rounded-lg px-5 py-4"
        >
          <div className="text-sm text-ink-soft leading-relaxed measure space-y-3">
            <p>
              The twenty-day settlement figure is EPFO&rsquo;s own service
              commitment, published in its citizen&rsquo;s charter. It is an
              administrative undertaking rather than a statutory period: no
              penalty attaches when it lapses, no remedy opens, and no officer
              becomes answerable.
            </p>
            <p>
              The thirty-day reply period, the deemed refusal, the appeal and
              the penalty of ₹250 a day up to ₹25,000 are sections 7(1), 7(2),
              19(1) and 20(1) of the Right to Information Act 2005.
            </p>
            <p>
              The count of possible restarts is arithmetic on the elapsed days,
              not a claim about your file. It shows how many times the
              commitment <em>could</em> have been reset while the record still
              looked clean — which is the point, because you would not have
              been told either way.
            </p>
          </div>
        </Disclose>
      </div>
    </>
  );
}
