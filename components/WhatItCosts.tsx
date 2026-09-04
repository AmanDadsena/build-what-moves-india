"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EFFORT_LABEL,
  byCost,
  compare,
  ladderStep,
  priceAll,
} from "@/lib/cost";
import { PageHero } from "@/components/PageHero";
import { Tag } from "@/components/Provenance";
import { ReadAloud } from "@/components/ReadAloud";
import { Disclose } from "@/components/Motion";

/* What a route costs the person taking it.
 *
 * Everything else in this product, and everything in the real portal,
 * prices these routes in days. That is the office's unit. The
 * member's unit is a day's wages, and the two produce opposite
 * rankings: the advice given most freely — go to the office — is the
 * single most expensive thing on the list, and the instrument with an
 * actual deadline behind it costs ten rupees and a stamp.
 *
 * The wage is asked for rather than assumed, and it changes the
 * ordering rather than decorating it. A member earning ₹2,000 a day
 * and a member earning nothing are looking at genuinely different
 * lists, and pretending otherwise would make this a graphic rather
 * than a tool.
 *
 * Nothing is sent anywhere. The figure is used for one multiplication
 * in this browser and never leaves it, which is worth saying on a
 * page that asks somebody what they earn.
 */

const rupees = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/* Offered as buttons as well as a field. A daily wage is the kind of
   number somebody knows but does not want to type on a phone in a
   queue, and these cover most of the range this scheme serves. */
const COMMON_WAGES = [0, 400, 600, 900, 1500];

export function WhatItCosts() {
  const [wage, setWage] = useState(600);

  const priced = useMemo(() => byCost(priceAll(wage)), [wage]);
  const summary = useMemo(() => compare(priceAll(wage)), [wage]);

  /* Named routes, looked up rather than taken from the ranking. The
     prose says which route it is talking about, and the ranking moves
     with the wage — at ₹0 a day the dearest route stops being the
     office visit, and a sentence naming one while showing the other's
     total is simply wrong. */
  const visit = priced.find((r) => r.id === "office-visit")!;
  const rti = priced.find((r) => r.id === "rti")!;

  return (
    <>
      <PageHero
        eyebrow="What it costs you"
        provenance="verified"
        title="Nobody prices these in the only currency that matters to you."
        titleHi="जिस मुद्रा में आपका असली खर्च है, उसमें कोई हिसाब नहीं देता।"
        lede="Every option you are given is measured in days, because days are what it costs the office. What it costs you is a day's wages — and once you count that, the advice given most freely turns out to be the most expensive thing on the list."
      />

      <div className="shell py-10 sm:py-14 space-y-12 stagger">
        {/* ---- The wage ---- */}
        <section className="shell-reading">
          <h2 className="eyebrow section-mark mb-4">
            What is a day of your work worth?
          </h2>
          <p className="text-ink-soft leading-relaxed measure mb-6">
            Roughly is enough. Nothing is sent anywhere &mdash; the figure is
            used for one multiplication in this browser and never leaves it.
          </p>

          <div className="border border-rule-heavy bg-paper-raised rounded-xl p-6">
            <div
              role="group"
              aria-label="Common daily wages"
              className="flex gap-2 flex-wrap mb-5"
            >
              {COMMON_WAGES.map((w) => (
                <button
                  key={w}
                  type="button"
                  aria-pressed={wage === w}
                  onClick={() => setWage(w)}
                  className={`press rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    wage === w
                      ? "border-noting bg-noting text-paper"
                      : "border-rule hover:border-noting"
                  }`}
                >
                  {w === 0 ? "Not earning" : rupees(w)}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="eyebrow block mb-1.5">
                Or type what you make in a day
              </span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={wage === 0 ? "" : wage}
                placeholder="600"
                onChange={(e) => setWage(Math.max(0, Number(e.target.value) || 0))}
                className="num w-full sm:w-56 border-2 border-rule-heavy bg-paper rounded-lg px-4 py-3 text-base outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12"
              />
            </label>
          </div>
        </section>

        {/* ---- The headline ---- */}
        <section className="shell-reading">
          <div className="border-2 border-noting bg-noting-wash/50 rounded-xl px-6 py-6">
            <h2 className="eyebrow mb-3">The comparison</h2>
            {wage > 0 ? (
              <>
                <p className="display-3 measure mb-3">
                  One visit to the office costs you {rupees(visit.total)}, and
                  binds nobody. The application that starts a thirty-day clock
                  costs {rupees(rti.total)}.
                </p>
                <p className="leading-relaxed measure">
                  {summary.free} of the routes below cost nothing at all beyond
                  your attention, and they include the two that create the
                  written record everything later depends on. Not one of them
                  requires you to travel anywhere.
                </p>
              </>
            ) : (
              <>
                <p className="display-3 measure mb-3">
                  With no wages to lose, the office visit costs you{" "}
                  {rupees(visit.total)} in fare and photocopies.
                </p>
                <p className="leading-relaxed measure">
                  That is the honest answer for somebody not currently earning,
                  and it changes the ordering below. It is still a day, and the
                  counter still cannot approve what your employer has not.
                </p>
              </>
            )}

            <ReadAloud
              className="mt-5"
              en={
                wage > 0
                  ? `One visit to a regional office costs you about ${rupees(visit.total)}, counting the day's wages you lose. An application under the Right to Information Act costs ten rupees and a stamp, needs no travel, and starts the only clock on this list that anybody has to keep.`
                  : `With no wages to lose, an office visit costs about ${rupees(visit.total)} in fare and photocopies. An application under the Right to Information Act costs ten rupees and a stamp, and needs no travel at all.`
              }
              hi={
                wage > 0
                  ? `कार्यालय जाने पर आपको लगभग ${rupees(visit.total)} का खर्च पड़ता है, जिसमें एक दिन की मज़दूरी भी शामिल है। सूचना का अधिकार आवेदन दस रुपये में होता है, कहीं जाना नहीं पड़ता, और इसी से वह इकलौती समय-सीमा शुरू होती है जिसे निभाना अनिवार्य है।`
                  : `मज़दूरी का नुकसान न हो तो भी कार्यालय जाने पर किराया और फ़ोटोकॉपी मिलाकर लगभग ${rupees(visit.total)} लगते हैं। सूचना का अधिकार आवेदन दस रुपये में होता है और कहीं जाना नहीं पड़ता।`
              }
            />
          </div>
        </section>

        {/* ---- The table ---- */}
        <section>
          <div className="shell-reading">
            <h2 className="eyebrow section-mark mb-4">
              Every route, cheapest first
            </h2>
            <p className="text-ink-soft leading-relaxed measure mb-6">
              Reordered as you change the wage, because the ordering genuinely
              is different for different people. Where two cost the same, the
              one with a deadline behind it is placed first.
            </p>
          </div>

          <div className="overflow-x-auto border border-rule-heavy rounded-xl">
            <table className="w-full text-left border-collapse min-w-[42rem]">
              <caption className="sr-only">
                Routes out of a stuck claim, with the cost to you of each,
                ordered from cheapest to dearest.
              </caption>
              <thead>
                <tr className="bg-paper-inset">
                  <th scope="col" className="eyebrow px-5 py-3 font-semibold">
                    Route
                  </th>
                  <th scope="col" className="eyebrow px-5 py-3 font-semibold">
                    Travel
                  </th>
                  <th
                    scope="col"
                    className="eyebrow px-5 py-3 font-semibold text-right"
                  >
                    Wages lost
                  </th>
                  <th
                    scope="col"
                    className="eyebrow px-5 py-3 font-semibold text-right"
                  >
                    Costs you
                  </th>
                  <th scope="col" className="eyebrow px-5 py-3 font-semibold">
                    Answer due
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {priced.map((r) => {
                  const effort = EFFORT_LABEL[r.effort];
                  return (
                    <tr key={r.id} className="bg-paper-raised align-top">
                      <th
                        scope="row"
                        className="px-5 py-4 font-semibold tracking-[-0.01em] max-w-xs"
                      >
                        {r.label}
                        {r.feeNote && (
                          <span className="block text-xs font-normal text-ink-faint mt-1">
                            {r.feeNote}
                          </span>
                        )}
                      </th>
                      <td className="px-5 py-4">
                        <span className={`tag ${effort.tag}`}>
                          {effort.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right num">
                        {r.wagesLost > 0 ? (
                          <span className="text-stamp font-semibold">
                            {rupees(r.wagesLost)}
                          </span>
                        ) : (
                          <span className="text-ink-faint">&mdash;</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="figure text-lg">
                          {r.total === 0 ? "Free" : rupees(r.total)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="num text-sm">
                          {r.elapsedDays} {r.elapsedDays === 1 ? "day" : "days"}
                        </span>
                        <span
                          className={`block text-xs mt-1 ${
                            r.binding === "hard"
                              ? "text-stamp font-semibold"
                              : "text-ink-faint"
                          }`}
                        >
                          {r.binding === "hard"
                            ? "binds somebody"
                            : "binds nobody"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---- The notes ---- */}
        <section>
          <div className="shell-reading">
            <h2 className="eyebrow section-mark mb-4">
              What is worth knowing about each
            </h2>
          </div>
          <ul className="grid gap-4 lg:grid-cols-2">
            {priced.map((r) => {
              const step = ladderStep(r.id);
              return (
                <li
                  key={r.id}
                  className="border border-rule bg-paper-raised rounded-xl px-5 py-5"
                >
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <span className={`tag ${EFFORT_LABEL[r.effort].tag}`}>
                      {EFFORT_LABEL[r.effort].label}
                    </span>
                    {r.binding === "hard" && <Tag kind="statutory" />}
                    {!step && (
                      <span className="text-xs text-ink-faint">
                        not a step in any documented process
                      </span>
                    )}
                  </div>
                  <p className="font-semibold tracking-[-0.01em] mb-2">
                    {r.label}
                  </p>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {r.note}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---- The honest close ---- */}
        <section className="shell-reading space-y-5">
          <Disclose
            label="Where these figures come from, and how wrong they can be"
            className="border-l-4 border-rule-heavy bg-paper-inset/40 rounded-lg px-5 py-4"
          >
            <div className="text-sm text-ink-soft leading-relaxed measure space-y-3">
              <p>
                The fees are published and exact: the RTI application is ₹10 and
                free for a below-poverty-line applicant, an appeal is free by
                statute, and everything else on this list costs nothing to file.
              </p>
              <p>
                The fare, the photocopies and the length of the queue are
                estimates, and they will be wrong for you specifically. An
                office forty minutes away is not an office four hours away, and
                this page cannot know which one you have.
              </p>
              <p>
                They are here to get the comparison right rather than the total.
                The ratio between a route that needs no travel and one that
                takes a working day holds however wrong the individual numbers
                are &mdash; and that ratio is the whole argument.
              </p>
            </div>
          </Disclose>

          <div className="border border-rule bg-paper-inset/40 rounded-xl px-6 py-6">
            <h2 className="eyebrow mb-2">Why this page exists</h2>
            <p className="leading-relaxed measure mb-3">
              &ldquo;Just go to the office&rdquo; is advice with a price on it,
              and it is given freely &mdash; by helplines, by relatives, by
              sites like this one. For somebody on a daily wage with a long
              journey it is a thousand-rupee instruction, and it ought to be
              said out loud that that is what it is.
            </p>
            <p className="leading-relaxed measure">
              Especially since the counter cannot approve what your employer has
              not, cannot correct what needs a declaration, and cannot make
              anything move faster. It can tell you what your file says. That is
              worth a great deal &mdash; and it is also what an application
              costing ten rupees can compel in writing, from your own house,
              with a deadline attached.
            </p>
            <div className="flex gap-2 flex-wrap mt-5">
              <Link href="/still-waiting/" className="btn btn-primary btn-sm">
                The route with the deadline
              </Link>
              <Link href="/employer-gone/" className="btn btn-secondary btn-sm">
                If there is no employer to ask
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
