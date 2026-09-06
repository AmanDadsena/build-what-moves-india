"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  split,
  checkPayslip,
  contributionBase,
  EPS_WAGE_CEILING,
  type Verdict,
} from "@/lib/paycheck";
import { PageHero } from "@/components/PageHero";
import { ReadAloud } from "@/components/ReadAloud";
import { Disclose } from "@/components/Motion";

const rupees = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/* Anybody's payslip, without an account.
 *
 * The portal version of this needs a member and a passbook. This one
 * needs two numbers a person can read off the slip in their hand, and
 * that difference is the whole point: the people most likely to be
 * short-changed are the ones least likely to have ever activated a
 * UAN.
 *
 * The verdict is three-way rather than right-or-wrong, because the
 * middle case is real and almost nobody knows it exists. An employer
 * may lawfully restrict contributions to the ₹15,000 ceiling. Saying
 * "this is wrong" would send somebody to argue with payroll over
 * nothing; saying "this is fine" would hide a decision about their
 * retirement that they were never told about.
 */

const TONE: Record<
  Verdict,
  { border: string; wash: string; text: string; label: string }
> = {
  "matches-wages": {
    border: "border-verify/40",
    wash: "bg-verify-wash",
    text: "text-verify",
    label: "Computed on your full wages",
  },
  "restricted-to-ceiling": {
    border: "border-pending/40",
    wash: "bg-pending-wash",
    text: "text-pending",
    label: "Restricted to the ceiling — lawful, and worth knowing",
  },
  neither: {
    border: "border-stamp/50",
    wash: "bg-stamp-wash",
    text: "text-stamp",
    label: "This matches neither rule",
  },
};

export function CheckPayslip() {
  const [wages, setWages] = useState("");
  const [deducted, setDeducted] = useState("");

  const w = Number(wages);
  const d = Number(deducted);
  const ready = w > 0 && d >= 0 && wages !== "" && deducted !== "";

  const result = useMemo(
    () => (ready ? checkPayslip(w, d) : null),
    [ready, w, d],
  );

  /* The employer's half has to be worked out on the base the verdict
     established, not on the salary. Splitting the salary here while
     the paragraph above said contributions were restricted to
     ₹15,000 put two numbers on one screen that could not both be
     true — and the wrong one was nine times the right one. Where the
     deduction matches neither rule there is no base to infer, so
     nothing is shown rather than something invented. */
  const base = useMemo(
    () => (result ? contributionBase(result) : null),
    [result],
  );
  const s = useMemo(() => (base ? split(base) : null), [base]);
  const restricted = result?.verdict === "restricted-to-ceiling";

  return (
    <>
      <PageHero
        eyebrow="Check your own payslip"
        provenance="verified"
        title="Two numbers off your payslip, and you can check the arithmetic yourself."
        lede="The wage your provident fund was worked out on, and the amount deducted. No sign-in, no UAN, nothing sent anywhere — the whole calculation happens on this device."
      />

      <section className="border-b border-rule bg-paper-raised">
        <div className="shell-reading py-8">
          <div className="grid gap-5 sm:grid-cols-2 max-w-2xl">
            <div>
              <label htmlFor="wages" className="eyebrow block mb-2">
                Monthly wages (basic + DA)
              </label>
              <input
                id="wages"
                type="number"
                inputMode="numeric"
                min={0}
                value={wages}
                onChange={(e) => setWages(e.target.value)}
                placeholder="e.g. 24000"
                className="num w-full border-2 border-rule-heavy bg-paper rounded-lg px-4 py-3.5 text-base outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12"
              />
            </div>
            <div>
              <label htmlFor="deducted" className="eyebrow block mb-2">
                PF deducted from your pay
              </label>
              <input
                id="deducted"
                type="number"
                inputMode="numeric"
                min={0}
                value={deducted}
                onChange={(e) => setDeducted(e.target.value)}
                placeholder="e.g. 2880"
                className="num w-full border-2 border-rule-heavy bg-paper rounded-lg px-4 py-3.5 text-base outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12"
              />
            </div>
          </div>
          <p className="text-xs text-ink-faint mt-3 leading-relaxed measure">
            Both are printed on almost every payslip, usually beside each other.
            Use the employee deduction, not the employer&rsquo;s contribution.
          </p>
        </div>
      </section>

      <div className="shell-reading py-10 sm:py-14 space-y-10">
        {!result && (
          <section className="border border-rule bg-paper-raised rounded-xl px-6 py-8">
            <p className="display-3 mb-3">There are three possible answers</p>
            <p className="text-ink-soft leading-relaxed measure mb-3">
              Your deduction is twelve per cent of your wages. Or it is twelve
              per cent of ₹{EPS_WAGE_CEILING.toLocaleString("en-IN")} — which an
              employer is allowed to do, and which caps your deduction at
              ₹1,800 however much you earn. Or it is neither, and that is worth
              asking about.
            </p>
            <p className="text-ink-soft leading-relaxed measure">
              Almost nobody knows the middle one exists, which is why being
              told &ldquo;that looks fine&rdquo; is not much use on its own.
            </p>
          </section>
        )}

        {result && (
          <>
            <section
              role="status"
              className={`border-2 rounded-xl overflow-hidden ${TONE[result.verdict].border}`}
            >
              <div className={`px-6 py-6 ${TONE[result.verdict].wash}`}>
                <p className="eyebrow mb-2">The verdict</p>
                <p className={`display-3 measure ${TONE[result.verdict].text}`}>
                  {TONE[result.verdict].label}
                </p>
              </div>

              <div className="px-6 py-6 bg-paper-raised">
                {result.verdict === "matches-wages" && (
                  <p className="leading-relaxed measure">
                    {rupees(result.deducted)} is exactly twelve per cent of{" "}
                    {rupees(result.wages)}. Your employer is contributing on
                    what you actually earn, which is the better of the two
                    lawful arrangements for you.
                  </p>
                )}

                {result.verdict === "restricted-to-ceiling" && (
                  <>
                    <p className="leading-relaxed measure mb-4">
                      {rupees(result.deducted)} is twelve per cent of{" "}
                      {rupees(EPS_WAGE_CEILING)}, not of your{" "}
                      {rupees(result.wages)}. Your employer has restricted
                      contributions to the statutory ceiling. This is permitted
                      and there is no grievance to raise about it.
                    </p>
                    <div className="border-l-4 border-pending bg-pending-wash/50 rounded-lg px-5 py-4">
                      <p className="eyebrow mb-2">What it costs you</p>
                      <p className="figure text-2xl mb-1">
                        {rupees(result.monthlyGap)} a month
                      </p>
                      <p className="text-sm leading-relaxed measure">
                        That is the difference between the two arrangements, in
                        your own contribution alone — and your employer&rsquo;s
                        matching share is reduced by the same amount, so the
                        fund receives about {rupees(result.monthlyGap * 2)} less
                        each month than it otherwise would. Over a career that
                        compounds. It is a decision about your retirement that
                        was made without telling you.
                      </p>
                    </div>
                  </>
                )}

                {result.verdict === "neither" && (
                  <>
                    <p className="leading-relaxed measure mb-4">
                      Twelve per cent of {rupees(result.wages)} is{" "}
                      {rupees(result.onFullWages)}. Twelve per cent of the
                      ceiling is {rupees(result.onCeiling)}. Your payslip shows{" "}
                      {rupees(result.deducted)}, which is{" "}
                      {result.offBy > 0 ? "more" : "less"} than the nearer of
                      the two by {rupees(Math.abs(result.offBy))}.
                    </p>
                    <p className="leading-relaxed measure mb-4">
                      There are ordinary explanations — a mid-month joining, a
                      wage that includes allowances excluded from the
                      calculation, or an arrear. There are also less ordinary
                      ones. Either way it is a fair question to put to your
                      employer in writing.
                    </p>
                    <Link href="/why/" className="btn btn-primary btn-sm">
                      If a claim has already failed
                    </Link>
                  </>
                )}

                <ReadAloud
                  className="mt-5"
                  en={`${TONE[result.verdict].label}. ${
                    result.verdict === "restricted-to-ceiling"
                      ? `Your deduction is twelve per cent of the ceiling rather than of your wages. The difference is ${rupees(result.monthlyGap)} a month in your own contribution, and your employer's matching share is reduced by the same amount.`
                      : result.verdict === "matches-wages"
                        ? `${rupees(result.deducted)} is exactly twelve per cent of ${rupees(result.wages)}.`
                        : `Your payslip shows ${rupees(result.deducted)}, which matches neither twelve per cent of your wages nor twelve per cent of the ceiling.`
                  }`}
                />
              </div>
            </section>

            {/* Where the rest of it goes — the part no payslip shows */}
            {s && base !== null && (
              <section>
                <h2 className="eyebrow section-mark mb-4">
                  What your employer puts in alongside it
                </h2>
                <p className="text-sm text-ink-soft leading-relaxed measure mb-4">
                  {restricted
                    ? `Worked out on ${rupees(base)}, because that is the base your employer has restricted contributions to. It applies to their share as much as to yours.`
                    : `Worked out on your ${rupees(base)}, the same wage your own deduction was taken from.`}
                </p>
                <div className="grid gap-px bg-rule border border-rule rounded-xl overflow-hidden sm:grid-cols-3">
                  <Figure
                    label="Into your provident fund"
                    value={rupees(s.toFund)}
                    note={
                      restricted
                        ? `Twelve per cent of ${rupees(base)}, less the pension diversion`
                        : "Their twelve per cent, less the pension diversion"
                    }
                    tone={restricted ? "pending" : undefined}
                  />
                  <Figure
                    label="Diverted to your pension"
                    value={rupees(s.toPension)}
                    note={
                      restricted || s.ceilingApplied
                        ? `8.33% of ${rupees(EPS_WAGE_CEILING)}, not of your wage`
                        : "8.33% of your wage, still under the ceiling"
                    }
                    tone="pending"
                  />
                  <Figure
                    label="Cost to your employer"
                    value={rupees(s.employerOutlay)}
                    note="Including EDLI and administration, which no payslip shows"
                  />
                </div>

                {restricted && (
                  <p className="text-sm text-ink-soft leading-relaxed measure mt-4">
                    Had the same contribution been computed on your{" "}
                    {rupees(result.wages)}, {rupees(split(result.wages).toFund)}{" "}
                    of your employer&rsquo;s money would reach the fund each
                    month instead of {rupees(s.toFund)}. Both arrangements are
                    lawful. Only one of them was explained to you.
                  </p>
                )}
              </section>
            )}

            {/* The honest empty state. A base cannot be inferred from a
                deduction that matches neither rule, and guessing one to
                fill the panel would be inventing the employer's
                arithmetic. */}
            {base === null && (
              <section className="border border-rule bg-paper-inset/40 rounded-xl px-6 py-6">
                <p className="eyebrow mb-2">What your employer puts in</p>
                <p className="leading-relaxed measure text-ink-soft">
                  This page cannot say. The employer&rsquo;s share, the pension
                  diversion and the EDLI premium are all worked out on the same
                  base as your own deduction — and your deduction matches
                  neither of the two lawful bases, so there is nothing here to
                  compute from. Establishing which figure your employer used is
                  precisely what the written question above is for.
                </p>
              </section>
            )}
          </>
        )}

        <Disclose
          label="Where these rates come from, and what this cannot tell you"
          className="border-l-4 border-rule-heavy bg-paper-inset/40 rounded-lg px-5 py-4"
        >
          <div className="text-sm text-ink-soft leading-relaxed measure space-y-3">
            <p>
              The two charges the employer carries on top sit on different
              bases, which is easy to get wrong. The EDLI premium is half a per
              cent of the ceiling wage, so it stops at ₹75. The administration
              charge is half a per cent of the wages actually contributed on,
              so it does not stop &mdash; and it carries a floor of ₹500 a
              month for the establishment as a whole, which cannot be divided
              into one person&rsquo;s row and is not shown here.
            </p>
            <p>
              Twelve per cent from the member, twelve from the employer, of
              which 8.33% of the pensionable wage goes to the pension scheme,
              are the ordinary statutory rates. Some categories of establishment
              contribute at a lower rate, and the ₹
              {EPS_WAGE_CEILING.toLocaleString("en-IN")} ceiling has been
              revised before.
            </p>
            <p>
              What counts as wages for this purpose is not always the same as
              what your payslip calls your salary. Basic and dearness allowance
              are in; several allowances are not. A figure that looks wrong here
              is sometimes a wage definition rather than an error, which is why
              this page asks a question rather than making an accusation.
            </p>
            <p>
              This is a good-faith reading of published rules and is not advice
              about your particular establishment.
            </p>
          </div>
        </Disclose>
      </div>
    </>
  );
}

function Figure({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "pending";
}) {
  return (
    <div className="bg-paper-raised px-5 py-5">
      <p className="eyebrow mb-2">{label}</p>
      <p className={`figure-sm mb-2 ${tone === "pending" ? "text-pending" : ""}`}>
        {value}
      </p>
      <p className="text-xs text-ink-faint leading-relaxed">{note}</p>
    </div>
  );
}
