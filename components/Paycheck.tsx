"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Member } from "@/lib/types";
import {
  checkMonth,
  ceilingStory,
  monthLabel,
  EPS_WAGE_CEILING,
} from "@/lib/paycheck";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";
import { ReadAloud } from "@/components/ReadAloud";

const rupees = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/* Where a month's money actually went.
 *
 * The order of this screen is deliberate. A member arrives wanting to
 * know whether they were short-changed, so the arithmetic check comes
 * early and answers that in one line. What follows is the thing they
 * did not come for and needed more: that the pension half of their
 * employer's contribution stopped growing with their salary years
 * ago, quite legally, and what that has added up to.
 */

export function Paycheck({ member }: { member: Member }) {
  const months = member.passbook;
  const [index, setIndex] = useState(months.length - 1);
  const entry = months[Math.min(index, months.length - 1)];

  const check = useMemo(() => checkMonth(entry), [entry]);
  const story = useMemo(() => ceilingStory(member), [member]);
  const s = check.expected;

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          <p className="eyebrow section-mark mb-0">Where the money went</p>
          <Tag kind="verified" />
        </div>
        <h2 className="display-2 measure mb-3">
          Your employer&rsquo;s twelve per cent does not all go where yours
          does.
        </h2>
        <p className="lede measure">
          A third of it is diverted to the pension scheme, and that third is
          worked out on a ceiling rather than on your salary. Here is one
          month, rupee by rupee.
        </p>
      </section>

      {/* Which month */}
      <section className="border border-rule bg-paper-raised rounded-xl p-5 sm:p-6">
        <label htmlFor="month" className="eyebrow block mb-2">
          Month
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          <select
            id="month"
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="border border-rule-heavy bg-paper rounded-md px-3.5 py-2.5 text-base outline-none focus:border-noting focus:ring-4 focus:ring-noting/12"
          >
            {months.map((m, i) => (
              <option key={m.month} value={i}>
                {monthLabel(m.month)}
              </option>
            ))}
          </select>
          <p className="text-sm text-ink-soft">
            Wages on record:{" "}
            <span className="num font-semibold">{rupees(entry.wages)}</span>
          </p>
        </div>
      </section>

      {/* Does it add up */}
      <section
        className={`border-2 rounded-xl overflow-hidden ${
          check.agrees ? "border-verify/40" : "border-stamp/50"
        }`}
      >
        <div
          className={`px-5 py-4 sm:px-6 ${
            check.agrees ? "bg-verify-wash" : "bg-stamp-wash"
          }`}
        >
          <p
            className={`title ${check.agrees ? "text-verify" : "text-stamp"}`}
          >
            {check.agrees
              ? "We recomputed this month from the rules. It adds up."
              : "The figures on record do not match what the rules produce."}
          </p>
        </div>

        <table className="w-full text-sm bg-paper-raised">
          <caption className="sr-only">
            Recorded figures compared with the figures the contribution rules
            produce
          </caption>
          <thead>
            <tr className="border-b border-rule text-left">
              <th scope="col" className="px-5 py-3 font-semibold">
                What
              </th>
              <th scope="col" className="px-5 py-3 font-semibold text-right">
                On record
              </th>
              <th scope="col" className="px-5 py-3 font-semibold text-right">
                Should be
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {check.fields.map((f) => (
              <tr key={f.field}>
                <th scope="row" className="px-5 py-3 font-normal text-left">
                  {f.label}
                </th>
                <td className="px-5 py-3 num text-right font-semibold">
                  {rupees(f.recorded)}
                </td>
                <td
                  className={`px-5 py-3 num text-right ${
                    f.agrees ? "text-ink-faint" : "text-stamp font-bold"
                  }`}
                >
                  {rupees(f.expected)}
                  {!f.agrees && (
                    <span className="block text-xs">
                      {f.difference > 0 ? "+" : ""}
                      {rupees(f.difference)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* The split, drawn */}
      <section>
        <p className="eyebrow mb-4">The month, rupee by rupee</p>

        <div className="border border-rule bg-paper-raised rounded-xl p-5 sm:p-7 card-lift space-y-7">
          <Flow
            title="Taken from your pay"
            total={s.employee}
            segments={[
              {
                label: "Straight into your provident fund",
                value: s.employee,
                className: "bg-noting",
              },
            ]}
            note="Your own 12%. All of it reaches your balance — none of it goes to pension."
          />

          <Flow
            title="Paid by your employer, matching yours"
            total={s.employerTotal}
            segments={[
              {
                label: "Into your provident fund",
                value: s.toFund,
                className: "bg-verify",
              },
              {
                label: "Diverted to the pension scheme",
                value: s.toPension,
                className: "bg-pending",
              },
            ]}
            note={
              s.ceilingApplied
                ? `The pension share is 8.33% of ₹${EPS_WAGE_CEILING.toLocaleString("en-IN")}, not of your wage — which is why it is ${rupees(s.toPension)} and not ${rupees(s.pensionUncapped)}.`
                : "The pension share is 8.33% of your wage, which is still under the ceiling."
            }
          />

          <Flow
            title="Paid by your employer on top, which you never see"
            total={s.edli + s.admin}
            segments={[
              {
                label: "Life insurance cover for your family (EDLI)",
                value: s.edli,
                className: "bg-night",
              },
              {
                label: "Administration",
                value: s.admin,
                className: "bg-ink-faint",
              },
            ]}
            note="This is why an employer will tell you provident fund costs them thirteen per cent while your payslip only shows twelve."
          />

          <div className="grid gap-px bg-rule border border-rule rounded-lg overflow-hidden sm:grid-cols-3">
            <Total label="Into your fund this month" value={s.intoFund} strong />
            <Total label="Into your pension this month" value={s.toPension} />
            <Total label="Total cost to your employer" value={s.employerOutlay} />
          </div>
        </div>
      </section>

      {/* The ceiling */}
      {story.crossedAt && (
        <section className="border-2 border-pending/40 bg-paper-raised rounded-xl overflow-hidden card-lift">
          <div className="px-5 py-3 sm:px-6 bg-pending-wash border-b border-pending/20">
            <p className="text-sm font-bold text-pending">
              Your pension stopped growing with your salary in{" "}
              {monthLabel(story.crossedAt.month)}
            </p>
          </div>

          <div className="px-5 py-6 sm:px-6">
            <p className="figure text-3xl sm:text-4xl mb-1.5">
              {rupees(story.totalCost)}
            </p>
            <h3 className="display-3 mb-5">
              less has gone into your pension than your salary would suggest.
            </h3>

            <p className="text-ink-soft leading-relaxed measure mb-4">
              For {story.monthsAbove} months your wages have averaged{" "}
              <span className="num font-semibold">
                {rupees(story.averageWageAbove)}
              </span>
              , while the pension share of your employer&rsquo;s contribution
              has been worked out on{" "}
              <span className="num font-semibold">
                {rupees(EPS_WAGE_CEILING)}
              </span>{" "}
              throughout. Nothing is wrong and nobody has taken anything from
              you: this is exactly what the scheme provides for.
            </p>
            <p className="text-ink-soft leading-relaxed measure mb-5">
              It matters because a monthly pension is calculated from
              pensionable salary, and yours has been frozen at the ceiling for
              years. Most members discover this at fifty-eight, when the
              contributions can no longer be revisited.
            </p>

            <ReadAloud
              className="mb-5"
              en={`Your pension stopped growing with your salary in ${monthLabel(story.crossedAt.month)}. For ${story.monthsAbove} months your wages have averaged ${rupees(story.averageWageAbove)}, while the pension share of your employer's contribution has been worked out on ${rupees(EPS_WAGE_CEILING)} throughout. That is ${rupees(story.totalCost)} less into your pension than your salary would suggest. Nothing is wrong. This is what the scheme provides for. It matters because a monthly pension is calculated from pensionable salary, and yours has been frozen at the ceiling for years.`}
            />

            <Link
              href={`/portal/${member.uan}/pension`}
              className="btn btn-primary btn-sm"
            >
              What your pension service adds up to
            </Link>
          </div>
        </section>
      )}

      <Disclose
        label="Where these rates come from"
        className="border-l-4 border-noting bg-noting-wash/40 rounded-lg px-5 py-4"
      >
        <div className="text-sm text-ink-soft leading-relaxed measure space-y-3">
          <p>
            Twelve per cent from the member and twelve from the employer, of
            which 8.33% of the pensionable wage goes to the pension scheme, are
            the ordinary statutory rates. Some categories of establishment
            contribute at a lower rate, and the pensionable wage ceiling of
            ₹15,000 has been revised before and may be again.
          </p>
          <p>
            EDLI and administration are charged on the same ceiling wage and
            are borne by the employer. They are shown here because their
            absence from a payslip is the most common reason a member and an
            employer disagree about what is being paid.
          </p>
          <p>
            This is a good-faith reading of published rules for the ordinary
            case, not advice about your particular establishment.
          </p>
        </div>
      </Disclose>
    </div>
  );
}

function Flow({
  title,
  total,
  segments,
  note,
}: {
  title: string;
  total: number;
  segments: Array<{ label: string; value: number; className: string }>;
  note: string;
}) {
  const sum = segments.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-2.5 flex-wrap">
        <p className="eyebrow mb-0">{title}</p>
        <p className="figure-sm">{rupees(total)}</p>
      </div>

      {/* The bar is decorative — every figure in it is also written
          out below, so nothing depends on reading a width. */}
      <div
        aria-hidden
        className="flex h-3.5 rounded-full overflow-hidden bg-paper-inset mb-3"
      >
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={seg.className}
            style={{ width: `${(seg.value / sum) * 100}%` }}
          />
        ))}
      </div>

      <ul className="space-y-1.5 mb-2.5">
        {segments.map((seg) => (
          <li
            key={seg.label}
            className="flex items-baseline justify-between gap-4 text-sm"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                aria-hidden
                className={`h-2.5 w-2.5 rounded-sm shrink-0 ${seg.className}`}
              />
              <span className="text-ink-soft">{seg.label}</span>
            </span>
            <span className="num font-semibold shrink-0">
              {rupees(seg.value)}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-ink-faint leading-relaxed measure">{note}</p>
    </div>
  );
}

function Total({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="bg-paper px-5 py-4">
      <p className="eyebrow mb-1.5">{label}</p>
      <p className={`figure-sm ${strong ? "text-verify" : ""}`}>
        {rupees(value)}
      </p>
    </div>
  );
}
