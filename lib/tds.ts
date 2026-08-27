import type { Member } from "./types";

/* ============================================================
   What you will actually receive.

   Members read a balance and expect that number in their account.
   Where service is under five years, tax is deducted at source and
   the amount that lands can be materially smaller — and nobody is
   told before they file, only after the money arrives.

   The rules applied here are the widely documented ones for
   provident fund withdrawal. They are a good-faith reading of public
   guidance, not tax advice, and the interface says so.
   ============================================================ */

export const TDS_THRESHOLD = 50_000;
export const EXEMPT_AFTER_MONTHS = 60; // five years of service

export interface TdsResult {
  gross: number;
  /** True where no tax is deducted at all. */
  exempt: boolean;
  reason: string;
  ratePercent: number;
  deducted: number;
  net: number;
  /** What the member could do to change the outcome, if anything. */
  remedy?: string;
}

export function computeTds({
  member,
  amount,
  form15gSubmitted = false,
}: {
  member: Member;
  amount: number;
  form15gSubmitted?: boolean;
}): TdsResult {
  const months = member.passbook.length;
  const panVerified = member.records.some(
    (r) => r.source === "pan" && r.verified
  );

  const base = { gross: amount, deducted: 0, net: amount };

  // Five years of service and the whole withdrawal is exempt.
  if (months >= EXEMPT_AFTER_MONTHS) {
    return {
      ...base,
      exempt: true,
      ratePercent: 0,
      reason: `You have ${Math.floor(months / 12)} years of service. Past five years, a provident fund withdrawal is exempt and nothing is deducted.`,
    };
  }

  // Small withdrawals fall under the threshold.
  if (amount < TDS_THRESHOLD) {
    return {
      ...base,
      exempt: true,
      ratePercent: 0,
      reason: `Below the ₹${TDS_THRESHOLD.toLocaleString("en-IN")} threshold, so no tax is deducted at source whatever your service.`,
    };
  }

  // A valid declaration stops the deduction where income is under the
  // taxable limit.
  if (form15gSubmitted) {
    return {
      ...base,
      exempt: true,
      ratePercent: 0,
      reason:
        "Your Form 15G declaration stops the deduction, on the basis that your total income falls below the taxable limit.",
      remedy:
        "Only file this if it is true. A wrong declaration is an offence, and the department can recover the tax later.",
    };
  }

  // The rate turns on whether PAN is verified — this is the single
  // most expensive unverified field on the whole record.
  const ratePercent = panVerified ? 10 : 20;
  const deducted = Math.round((amount * ratePercent) / 100);

  return {
    gross: amount,
    exempt: false,
    ratePercent,
    deducted,
    net: amount - deducted,
    reason: panVerified
      ? `Your service is under five years and the amount is above ₹${TDS_THRESHOLD.toLocaleString("en-IN")}, so tax is deducted at 10%.`
      : `Your service is under five years and your PAN is not verified, so tax is deducted at 20% rather than 10%.`,
    remedy: panVerified
      ? "If your total income for the year is below the taxable limit, Form 15G stops this deduction. Otherwise you can claim it back in your return."
      : `Verifying your PAN before you file halves this, from ₹${deducted.toLocaleString("en-IN")} to ₹${Math.round(amount * 0.1).toLocaleString("en-IN")}.`,
  };
}
