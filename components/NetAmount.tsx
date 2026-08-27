"use client";

import Link from "next/link";
import { useState } from "react";
import type { Member } from "@/lib/types";
import { computeTds, TDS_THRESHOLD } from "@/lib/tds";
import { Tag } from "@/components/Provenance";

/* What will actually reach the bank account.

   A member reads a balance and expects that figure. Where service is
   under five years the amount that lands can be materially smaller,
   and the portal says nothing until after the money arrives — by
   which point the deduction can only be recovered through a tax
   return, a year later.

   Showing it before filing turns an unpleasant surprise into a
   decision: verify a PAN first, or file a declaration, or accept it
   knowingly. */

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

export function NetAmount({
  member,
  amount,
}: {
  member: Member;
  amount: number;
}) {
  const [form15g, setForm15g] = useState(false);
  const result = computeTds({ member, amount, form15gSubmitted: form15g });
  const months = member.passbook.length;
  const underFive = months < 60;

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <p className="eyebrow section-mark mb-0">What you would receive</p>
        <Tag kind="verified" />
      </div>

      <div className="border border-rule bg-paper-raised rounded-xl overflow-hidden card-lift">
        {/* The arithmetic, in the order it happens */}
        <dl className="divide-y divide-rule">
          <Row label="Claim amount" value={rupees(result.gross)} />
          <Row
            label={
              result.exempt
                ? "Tax deducted"
                : `Tax deducted at ${result.ratePercent}%`
            }
            value={result.exempt ? "Nil" : `− ${rupees(result.deducted)}`}
            tone={result.exempt ? "ok" : "danger"}
          />
        </dl>

        <div
          className={`px-5 py-5 border-t-2 ${
            result.exempt
              ? "border-verify/30 bg-verify-wash"
              : "border-stamp/25 bg-stamp-wash/50"
          }`}
        >
          <p className="eyebrow mb-1.5">Reaches your account</p>
          <p className="figure text-3xl sm:text-4xl">{rupees(result.net)}</p>
        </div>

        <div className="px-5 py-4 border-t border-rule space-y-3">
          <p className="text-sm leading-relaxed measure">{result.reason}</p>

          {result.remedy && (
            <p className="text-sm leading-relaxed measure text-noting font-medium">
              {result.remedy}
            </p>
          )}

          {/* The declaration is only offered where it could apply. */}
          {underFive && amount >= TDS_THRESHOLD && (
            <label className="flex items-start gap-3 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form15g}
                onChange={(e) => setForm15g(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-noting)]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  I will submit Form 15G with this claim
                </span>
                <span className="block text-sm text-ink-soft mt-0.5">
                  Declares that your total income for the year is below the
                  taxable limit.
                </span>
              </span>
            </label>
          )}

          {!result.exempt && (
            <Link
              href={`/portal/${member.uan}/records`}
              className="btn btn-secondary btn-sm"
            >
              Check your PAN status
            </Link>
          )}
        </div>
      </div>

      <p className="text-sm text-ink-faint leading-relaxed measure mt-3">
        A good-faith reading of published guidance on provident fund
        withdrawals, not tax advice. Your own liability depends on your total
        income for the year.
      </p>
    </section>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "danger";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3.5">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd
        className={`figure-sm text-lg ${
          tone === "danger"
            ? "text-stamp"
            : tone === "ok"
              ? "text-verify"
              : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
