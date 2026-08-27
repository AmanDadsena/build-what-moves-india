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
/** Administration charge, employer-borne. */
export const ADMIN_RATE = 0.005;

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
  const edli = Math.round(pensionable * EDLI_RATE);
  const admin = Math.round(pensionable * ADMIN_RATE);

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
