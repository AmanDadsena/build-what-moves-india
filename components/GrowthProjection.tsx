"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Member } from "@/lib/types";
import { corpus } from "@/lib/members";
import { computeTds } from "@/lib/tds";
import {
  project,
  recentMonthlyContribution,
  yearsToPension,
  RATE_HISTORY,
  RATE_LOW,
  RATE_HIGH,
  RATE_MID,
  PENSION_AGE,
} from "@/lib/growth";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";
import { Illustration } from "@/components/Illustration";

const rupees = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/** How the amount would be said out loud. A figure with six digits is
 *  read by almost nobody; "nine lakh" is read by everybody. */
function inWords(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)} crore`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)} lakh`;
  if (n >= 1_000) return `${Math.round(n / 1000)} thousand`;
  return String(Math.round(n));
}

export function GrowthProjection({ member }: { member: Member }) {
  const today = corpus(member);
  const monthly = recentMonthlyContribution(member);
  const toPension = yearsToPension(member) ?? 25;

  const [years, setYears] = useState(Math.max(1, Math.min(toPension, 30)));
  const [contributing, setContributing] = useState(false);

  const result = useMemo(
    () =>
      project({
        opening: today,
        monthlyContribution: contributing ? monthly : 0,
        years,
      }),
    [today, monthly, contributing, years],
  );

  // What withdrawing today would actually put in the account.
  const tds = computeTds({ member, amount: today });
  const forgone = result.mid - tds.net;

  return (
    <div className="space-y-9 stagger">
      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <p className="eyebrow section-mark mb-0">If you leave it alone</p>
            <Tag kind="mock" />
          </div>
          <h2 className="display-2 measure mb-3">
            Withdrawing at a job change is the most expensive habit in this
            scheme.
          </h2>
          <p className="lede measure">
            The balance is not sitting still. This is what the same money is
            worth if it is left where it is, and what taking it out today costs
            in the end.
          </p>
        </div>
        <Illustration
          src="/img/deduction.webp"
          tone="noting"
          className="hidden lg:block"
        />
      </section>

      {/* The two decisions */}
      <section className="border border-rule bg-paper-raised rounded-xl p-5 sm:p-6 card-lift">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="years" className="eyebrow block mb-2">
              Left untouched for
            </label>
            <p className="figure text-2xl mb-2">
              {years} {years === 1 ? "year" : "years"}
            </p>
            <input
              id="years"
              type="range"
              min={1}
              max={Math.max(2, toPension)}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-noting"
            />
            <p className="text-xs text-ink-faint mt-2">
              {toPension > 0
                ? `${toPension} years remain until you turn ${PENSION_AGE}.`
                : `You have passed ${PENSION_AGE}.`}
            </p>
          </div>

          <div>
            <p className="eyebrow mb-2">Contributions</p>
            <div
              role="radiogroup"
              aria-label="Whether contributions continue"
              className="flex gap-1 p-1 bg-paper-inset rounded-md mb-2"
            >
              {[false, true].map((on) => (
                <button
                  key={String(on)}
                  role="radio"
                  aria-checked={contributing === on}
                  onClick={() => setContributing(on)}
                  className={`press flex-1 text-sm font-semibold py-2.5 rounded transition-colors ${
                    contributing === on
                      ? "bg-paper-raised text-ink"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {on ? "Keep paying in" : "Stop, just leave it"}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-faint">
              {contributing
                ? `Assumes ${rupees(monthly)} a month continues, your average over the last year on record.`
                : "Nothing more goes in. Interest still accrues."}
            </p>
          </div>
        </div>
      </section>

      {/* The answer */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="border-2 border-verify/40 bg-verify-wash/40 rounded-xl p-6">
          <p className="eyebrow mb-2">Left alone for {years} years</p>
          <p className="figure text-3xl sm:text-4xl mb-1">
            {rupees(result.low)} – {rupees(result.high)}
          </p>
          <p className="text-sm text-ink-soft mb-4">
            About {inWords(result.mid)} rupees at the middle of the range.
          </p>
          <dl className="text-sm space-y-1.5">
            <Line label="Paid in, by you and your employer" value={rupees(result.contributed)} />
            <Line
              label="Added by interest alone"
              value={rupees(result.interestEarned)}
              strong
            />
          </dl>
        </div>

        <div className="border-2 border-stamp/40 bg-paper-raised rounded-xl p-6">
          <p className="eyebrow mb-2">Taken out today</p>
          <p className="figure text-3xl sm:text-4xl mb-1">{rupees(tds.net)}</p>
          <p className="text-sm text-ink-soft mb-4">
            {tds.exempt
              ? "Nothing is deducted."
              : `After ${tds.ratePercent}% deducted at source — ${rupees(tds.deducted)}.`}
          </p>
          <div className="pt-4 border-t border-rule">
            <p className="eyebrow text-stamp mb-1.5">The difference</p>
            <p className="figure text-2xl text-stamp mb-1">{rupees(forgone)}</p>
            <p className="text-sm text-ink-soft leading-relaxed">
              What the same money would have been worth in {years} years, less
              what taking it now actually puts in your hand.
            </p>
          </div>
        </div>
      </section>

      <GrowthChart result={result} years={years} />

      {/* The honesty */}
      <section className="border-l-4 border-noting bg-noting-wash/40 rounded-lg px-5 py-4">
        <p className="eyebrow mb-2">Why this is a range and not a number</p>
        <p className="text-sm leading-relaxed measure mb-3">
          The interest rate is declared once a year by the Central Board of
          Trustees and it moves. Any calculator that shows you a single figure
          thirty years out is telling you something it cannot know. The band
          above runs from {RATE_LOW}% to {RATE_HIGH}%, which is the range
          actually declared in recent years; {RATE_MID}% is used for the middle.
        </p>

        <Disclose label="See the declared rates">
          <ul className="border border-rule rounded-md divide-y divide-rule bg-paper max-w-sm">
            {RATE_HISTORY.map((r) => (
              <li
                key={r.year}
                className="px-4 py-2.5 flex items-baseline justify-between gap-4"
              >
                <span className="num text-sm">{r.year}</span>
                <span className="num text-sm font-semibold">{r.rate}%</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-soft leading-relaxed measure mt-3">
            Interest accrues on the balance you hold at the start of each month
            and is credited once at the end of the financial year — which is
            why a contribution paid in this month earns nothing until next.
            This projection follows that method rather than compounding
            monthly, which would flatter the result.
          </p>
        </Disclose>
      </section>

      <section className="border border-rule bg-paper-raised rounded-lg p-5 sm:p-6">
        <p className="title mb-2">If you are changing jobs</p>
        <p className="text-ink-soft leading-relaxed measure mb-4">
          Transferring the account keeps this trajectory intact and keeps the
          service counting toward your ten years for pension. Withdrawing
          resets both to zero.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/portal/${member.uan}/transfer`}
            className="btn btn-primary btn-sm"
          >
            Transfer instead
          </Link>
          <Link
            href={`/portal/${member.uan}/pension`}
            className="btn btn-secondary btn-sm"
          >
            What it costs your pension
          </Link>
        </div>
      </section>
    </div>
  );
}

function Line({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={`num ${strong ? "font-bold text-verify" : "font-semibold"}`}>
        {value}
      </dd>
    </div>
  );
}

/* The trajectory.

   Drawn as a band rather than a line, because the band is the point:
   the width of it at year thirty is the honest measure of how much
   nobody can promise. A single line would read as a forecast. */
function GrowthChart({
  result,
  years,
}: {
  result: ReturnType<typeof project>;
  years: number;
}) {
  const W = 720;
  const H = 260;
  const PAD = { l: 8, r: 8, t: 16, b: 28 };

  const max = result.points[result.points.length - 1]?.high ?? 1;
  const x = (year: number) =>
    PAD.l + ((year - 0) / years) * (W - PAD.l - PAD.r);
  const y = (value: number) =>
    H - PAD.b - (value / max) * (H - PAD.t - PAD.b);

  const start = { year: 0, low: result.opening, mid: result.opening, high: result.opening };
  const pts = [start, ...result.points];

  const upper = pts.map((p) => `${x(p.year)},${y(p.high)}`).join(" ");
  const lower = [...pts].reverse().map((p) => `${x(p.year)},${y(p.low)}`).join(" ");
  const mid = pts.map((p) => `${x(p.year)},${y(p.mid)}`).join(" ");

  // Roughly five labels, whatever the span.
  const step = Math.max(1, Math.round(years / 5));
  const ticks = pts.filter((p) => p.year % step === 0 || p.year === years);

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <p className="eyebrow section-mark mb-0">The trajectory</p>
        <Tag kind="mock" />
      </div>

      <div className="border border-rule bg-paper-raised rounded-xl p-4 sm:p-6 card-lift">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          role="img"
          aria-label={`Projected balance over ${years} years, rising from ${rupees(
            result.opening,
          )} today to between ${rupees(result.low)} and ${rupees(
            result.high,
          )}.`}
        >
          <polygon
            points={`${upper} ${lower}`}
            className="fill-noting/18"
          />
          <polyline
            points={mid}
            fill="none"
            className="stroke-noting"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={H - PAD.b}
            y2={H - PAD.b}
            className="stroke-rule-heavy"
            strokeWidth={1}
          />
          {ticks.map((p) => (
            <text
              key={p.year}
              x={x(p.year)}
              y={H - 8}
              textAnchor={p.year === 0 ? "start" : p.year === years ? "end" : "middle"}
              className="fill-ink-faint"
              style={{ fontSize: 12 }}
            >
              {p.year === 0 ? "now" : `${p.year}y`}
            </text>
          ))}
        </svg>

        <div className="flex gap-5 flex-wrap mt-4 pt-4 border-t border-rule">
          <Key className="bg-noting" label={`Middle, at ${RATE_MID}%`} />
          <Key className="bg-noting/25" label={`The band, ${RATE_LOW}% to ${RATE_HIGH}%`} />
        </div>
      </div>
    </section>
  );
}

function Key({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
      <span aria-hidden className={`h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
