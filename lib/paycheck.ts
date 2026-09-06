import type { Member, PassbookEntry } from "./types";

/* ============================================================
   Where the money in a payslip actually goes.

   Almost every member believes two things about their provident fund
   that are not true, and neither is ever corrected by the portal.

   The first is that the employer's twelve per cent goes into the same
   pot as their own. It does not. Most of it does, but 8.33% is
   diverted to the pension scheme, and that share is calculated on a
   wage ceiling of ₹15,000 rather than on what they are actually paid.
   So a member whose salary triples over a career has their pension
   built on the same ₹15,000 throughout. Nobody is told this at the
   moment it starts happening, and by the time it matters the
   contributions cannot be revisited.

   The second is that twelve plus twelve is the whole cost. It is not:
   the employer also pays EDLI and administration on top, which is why
   an employer will say provident fund costs them thirteen per cent
   while the member can only see twelve. That gap is the source of a
   great many arguments about whether an employer is contributing
   properly.

   This module states both plainly, and checks the arithmetic on a
   given month rather than asking the member to take it on trust.
   Rates are the widely published statutory ones for the ordinary
   case; establishments in some categories pay at a lower rate, which
   the interface says.
   ============================================================ */

export const EPS_WAGE_CEILING = 15_000;
export const EMPLOYEE_RATE = 0.12;
export const EMPLOYER_RATE = 0.12;
export const EPS_RATE = 0.0833;
/** Employees' Deposit Linked Insurance — employer-borne, on the
 *  ceiling wage, and the reason a member's family is covered for a
 *  lump sum they have usually never heard of. */
export const EDLI_RATE = 0.005;
/** Administration charge (account 2), employer-borne.
 *
 *  Unlike EDLI this is *not* restricted to the pension ceiling: it is
 *  0.5% of the EPF wages actually contributed on. The two were being
 *  computed the same way here, which understated the employer's cost
 *  for every member paid above ₹15,000 whose employer contributes on
 *  their real wage — ₹75 where the true figure is 0.5% of the whole.
 *
 *  There is also a floor of ₹500 a month, but it applies to the
 *  establishment rather than to the member, so it cannot be
 *  apportioned to one payslip and is not modelled. The interface says
 *  so rather than quietly showing a number that is too small for a
 *  very small employer. */
export const ADMIN_RATE = 0.005;

/** The monthly minimum an establishment pays in administration
 *  charges however few members it has. Stated for the interface; not
 *  divisible into a single member's row. */
export const ADMIN_MONTHLY_MINIMUM = 500;

export interface Split {
  wages: number;
  /** Deducted from the member's own pay. */
  employee: number;
  /** The employer's matching twelve per cent, before it is divided. */
  employerTotal: number;
  /** The part of the employer's share diverted to the pension scheme. */
  toPension: number;
  /** The part of the employer's share that reaches the provident fund. */
  toFund: number;
  /** True when the pension share was computed on the ceiling rather
   *  than on what the member was actually paid. */
  ceilingApplied: boolean;
  /** What the pension share would have been without the ceiling. */
  pensionUncapped: number;
  /** The monthly difference the ceiling makes. */
  ceilingCost: number;
  /** Paid by the employer on top, never visible to the member. */
  edli: number;
  admin: number;
  /** What the month costs the employer in total. */
  employerOutlay: number;
  /** What lands in the member's provident fund balance. */
  intoFund: number;
}

export function split(wages: number): Split {
  const pensionable = Math.min(wages, EPS_WAGE_CEILING);

  const employee = Math.round(wages * EMPLOYEE_RATE);
  const employerTotal = Math.round(wages * EMPLOYER_RATE);
  const toPension = Math.round(pensionable * EPS_RATE);
  const toFund = employerTotal - toPension;

  const pensionUncapped = Math.round(wages * EPS_RATE);
  // EDLI is charged on the ceiling wage; administration is charged on
  // what was actually contributed on. They are not the same base.
  const edli = Math.round(pensionable * EDLI_RATE);
  const admin = Math.round(wages * ADMIN_RATE);

  return {
    wages,
    employee,
    employerTotal,
    toPension,
    toFund,
    ceilingApplied: wages > EPS_WAGE_CEILING,
    pensionUncapped,
    ceilingCost: pensionUncapped - toPension,
    edli,
    admin,
    employerOutlay: employerTotal + edli + admin,
    intoFund: employee + toFund,
  };
}

export type Field = "employeeShare" | "employerShare" | "pensionShare";

export interface FieldCheck {
  field: Field;
  label: string;
  recorded: number;
  expected: number;
  /** Positive means the record holds more than the rules require. */
  difference: number;
  agrees: boolean;
}

export interface MonthCheck {
  entry: PassbookEntry;
  expected: Split;
  fields: FieldCheck[];
  agrees: boolean;
}

const LABEL: Record<Field, string> = {
  employeeShare: "Your own 12%",
  employerShare: "Employer's share reaching the fund",
  pensionShare: "Employer's share diverted to pension",
};

/** Recomputes a passbook row from the wage on it and reports whether
 *  the figures the record holds are the ones the rules produce. */
export function checkMonth(entry: PassbookEntry): MonthCheck {
  const expected = split(entry.wages);
  const pairs: Array<[Field, number]> = [
    ["employeeShare", expected.employee],
    ["employerShare", expected.toFund],
    ["pensionShare", expected.toPension],
  ];

  const fields: FieldCheck[] = pairs.map(([field, value]) => ({
    field,
    label: LABEL[field],
    recorded: entry[field],
    expected: value,
    difference: entry[field] - value,
    // A rupee either way is rounding, not a discrepancy.
    agrees: Math.abs(entry[field] - value) <= 1,
  }));

  return {
    entry,
    expected,
    fields,
    agrees: fields.every((f) => f.agrees),
  };
}

export interface CeilingStory {
  /** The month the member's wage first passed the ceiling. */
  crossedAt?: PassbookEntry;
  /** Months spent above it. */
  monthsAbove: number;
  /** Average wage across those months. */
  averageWageAbove: number;
  /** Total the pension pot has lost to the ceiling so far. */
  totalCost: number;
}

/** The single most consequential thing a long-serving member is never
 *  told: the month their pension stopped growing with their salary,
 *  and what that has added up to since. */
export function ceilingStory(member: Member): CeilingStory {
  const above = member.passbook.filter((e) => e.wages > EPS_WAGE_CEILING);

  if (above.length === 0) {
    return { monthsAbove: 0, averageWageAbove: 0, totalCost: 0 };
  }

  const totalCost = above.reduce((sum, e) => sum + split(e.wages).ceilingCost, 0);
  const averageWageAbove = Math.round(
    above.reduce((sum, e) => sum + e.wages, 0) / above.length,
  );

  return {
    crossedAt: above[0],
    monthsAbove: above.length,
    averageWageAbove,
    totalCost,
  };
}

export function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

/* ============================================================
   Diagnosing a payslip against the rules.

   A member can read the two figures on their own payslip — the wage
   the provident fund was worked out on, and the amount deducted — and
   almost nobody can tell whether they agree. There are three answers,
   and the middle one is the one nobody knows exists.

   Contributions may lawfully be restricted to the ₹15,000 ceiling
   instead of computed on actual wages. An employer who does that is
   within the scheme, and the member's deduction stops at ₹1,800 a
   month however much they earn. It is not a mistake and there is no
   grievance to raise about it — but it is a decision made about their
   retirement that they were never told about, and the difference
   compounds for thirty years.

   Telling somebody "this is wrong" when it is merely restricted would
   send them to argue with a payroll department over nothing. Telling
   them "this is fine" when it is short by a thousand rupees a month
   leaves real money uncollected. So the three cases are separated.
   ============================================================ */

export type Verdict = "matches-wages" | "restricted-to-ceiling" | "neither";

export interface PayslipCheck {
  wages: number;
  deducted: number;
  verdict: Verdict;
  /** What the deduction would be on full wages. */
  onFullWages: number;
  /** What it would be if restricted to the ceiling. */
  onCeiling: number;
  /** Monthly difference between the two, where the wage is above the
   *  ceiling. Zero otherwise. */
  monthlyGap: number;
  /** Signed difference from whichever rule the figure is closest to. */
  offBy: number;
}

/** A rupee or two either way is rounding, not a discrepancy. */
const TOLERANCE = 2;

export function checkPayslip(wages: number, deducted: number): PayslipCheck {
  const onFullWages = Math.round(wages * EMPLOYEE_RATE);
  const onCeiling = Math.round(
    Math.min(wages, EPS_WAGE_CEILING) * EMPLOYEE_RATE,
  );

  const fromFull = deducted - onFullWages;
  const fromCeiling = deducted - onCeiling;

  let verdict: Verdict = "neither";
  let offBy = Math.abs(fromFull) <= Math.abs(fromCeiling) ? fromFull : fromCeiling;

  if (Math.abs(fromFull) <= TOLERANCE) {
    verdict = "matches-wages";
    offBy = 0;
  } else if (Math.abs(fromCeiling) <= TOLERANCE) {
    verdict = "restricted-to-ceiling";
    offBy = 0;
  }

  return {
    wages,
    deducted,
    verdict,
    onFullWages,
    onCeiling,
    monthlyGap: Math.max(0, onFullWages - onCeiling),
    offBy,
  };
}

/* The wage the whole establishment's contribution is worked out on.

   This is the part that is easy to get wrong, and getting it wrong
   makes a page contradict itself. The ₹15,000 restriction is not a
   cap on the member's deduction alone — it is the base the employer's
   matching twelve per cent, the EDLI premium and the administration
   charge are all computed on. So a member on ₹50,000 whose employer
   has restricted contributions does not have ₹4,750 of employer money
   arriving in their fund each month. They have ₹550: twelve per cent
   of ₹15,000, less the ₹1,250 the pension scheme takes first.

   That is the number worth showing them, and it is roughly a ninth of
   the one you get by splitting their actual salary.

   Where the deduction matches neither rule there is no base to infer.
   Picking one anyway would be inventing the employer's arithmetic in
   order to have something to display, which is the failure mode this
   product exists to argue against — so it returns null and the
   interface says it cannot tell. */
export function contributionBase(check: PayslipCheck): number | null {
  switch (check.verdict) {
    case "matches-wages":
      return check.wages;
    case "restricted-to-ceiling":
      return Math.min(check.wages, EPS_WAGE_CEILING);
    case "neither":
      return null;
  }
}
