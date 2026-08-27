import type { Member } from "./types";

/* ============================================================
   What the balance becomes if it is left alone.

   This is the most expensive thing the real portal does not say.
   A member changing jobs sees a balance, sees a withdraw button, and
   takes the money — because nothing on the screen suggests the number
   is doing anything other than sitting there. Withdrawing at each job
   change is the single most common way retirement savings in this
   scheme are lost, and it is a decision made without ever being shown
   the alternative.

   Two honesty rules govern everything below.

   First, the interest rate is not a promise. It is declared each year
   by the Central Board of Trustees and it moves. So this projects a
   band across the range that has actually been declared in recent
   years rather than a single confident figure, and the interface
   shows the band.

   Second, the arithmetic follows the scheme's own method rather than
   a generic compound-interest formula: interest accrues on the
   balance at the start of each month, and is credited once at the end
   of the financial year. A contribution paid in during a month does
   not earn interest in that month. Compounding monthly instead would
   overstate the result by a few per cent, which on a thirty-year
   projection is lakhs of rupees the member would never receive.
   ============================================================ */

/** Rates declared for recent years. Widely published; listed so the
 *  assumption below can be checked rather than taken on trust. */
export const RATE_HISTORY: Array<{ year: string; rate: number }> = [
  { year: "2018–19", rate: 8.65 },
  { year: "2019–20", rate: 8.5 },
  { year: "2020–21", rate: 8.5 },
  { year: "2021–22", rate: 8.1 },
  { year: "2022–23", rate: 8.15 },
  { year: "2023–24", rate: 8.25 },
];

/** The band the projection is drawn across, taken from the range
 *  above rather than chosen. */
export const RATE_LOW = 8.1;
export const RATE_HIGH = 8.65;
export const RATE_MID = 8.25;

/** The age at which a member becomes eligible for pension, and the
 *  natural end point for a projection. */
export const PENSION_AGE = 58;

export interface YearPoint {
  /** Years from today. */
  year: number;
  low: number;
  mid: number;
  high: number;
}

export interface Projection {
  years: number;
  opening: number;
  monthlyContribution: number;
  points: YearPoint[];
  /** Value at the end of the projection. */
  low: number;
  mid: number;
  high: number;
  /** Of the mid figure, how much was never contributed by anybody. */
  interestEarned: number;
  contributed: number;
}

/** One trajectory, at one rate, using the scheme's own method. */
function run(opening: number, monthly: number, years: number, ratePercent: number) {
  const rate = ratePercent / 100;
  let balance = opening;
  let accrued = 0;
  const byYear: number[] = [];

  for (let month = 1; month <= years * 12; month++) {
    // Interest accrues on the opening balance for the month.
    accrued += balance * (rate / 12);
    // The contribution lands after that, so it earns from next month.
    balance += monthly;
    if (month % 12 === 0) {
      balance += accrued;
      accrued = 0;
      byYear.push(Math.round(balance));
    }
  }
  return byYear;
}

export function project({
  opening,
  monthlyContribution = 0,
  years,
}: {
  opening: number;
  monthlyContribution?: number;
  years: number;
}): Projection {
  const span = Math.max(1, Math.round(years));
  const low = run(opening, monthlyContribution, span, RATE_LOW);
  const mid = run(opening, monthlyContribution, span, RATE_MID);
  const high = run(opening, monthlyContribution, span, RATE_HIGH);

  const points: YearPoint[] = mid.map((value, i) => ({
    year: i + 1,
    low: low[i],
    mid: value,
    high: high[i],
  }));

  const contributed = opening + monthlyContribution * 12 * span;

  return {
    years: span,
    opening,
    monthlyContribution,
    points,
    low: low[low.length - 1],
    mid: mid[mid.length - 1],
    high: high[high.length - 1],
    interestEarned: mid[mid.length - 1] - contributed,
    contributed,
  };
}

/** Date of birth as EPFO holds it, in dd/mm/yyyy. */
export function birthDate(member: Member): Date | null {
  const record = member.records.find(
    (r) => r.field === "dateOfBirth" && r.source === "epfo",
  );
  if (!record) return null;
  const [d, m, y] = record.value.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export function ageToday(member: Member, now = new Date()): number | null {
  const dob = birthDate(member);
  if (!dob) return null;
  let age = now.getFullYear() - dob.getFullYear();
  const before =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (before) age -= 1;
  return age;
}

/** Years remaining until pension age, floored at one. */
export function yearsToPension(member: Member, now = new Date()): number | null {
  const age = ageToday(member, now);
  if (age === null) return null;
  return Math.max(0, PENSION_AGE - age);
}

/** The average monthly total contribution across the last year on
 *  record — what would continue if employment continued. */
export function recentMonthlyContribution(member: Member): number {
  const recent = member.passbook.slice(-12);
  if (recent.length === 0) return 0;
  const total = recent.reduce(
    (sum, e) => sum + e.employeeShare + e.employerShare,
    0,
  );
  return Math.round(total / recent.length);
}
