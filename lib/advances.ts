import type { Member } from "./types";

/* ============================================================
   What you are allowed to take out, and for what.

   Form 31 is not one thing. Each purpose carries its own minimum
   service, its own ceiling and its own limit on how often it can be
   used, and the portal offers the form without saying any of that.
   Members therefore ask for an amount they are not entitled to, get
   rejected, and conclude their money is stuck — when a different
   purpose or a smaller figure would have been paid.

   The rules below follow published EPF Scheme guidance on
   part-withdrawal. They are a good-faith reading, and the interface
   says so rather than presenting them as a ruling.
   ============================================================ */

export interface AdvancePurpose {
  id: string;
  label: string;
  labelHi: string;
  /** Minimum completed years of service. */
  minYears: number;
  /** Ceiling, expressed against the rule that governs it. */
  basis: "monthly-wages" | "employee-share" | "total-balance";
  multiple?: number;
  sharePercent?: number;
  /** How often it may be used across a working life. */
  timesAllowed: string;
  note: string;
}

export const PURPOSES: AdvancePurpose[] = [
  {
    id: "illness",
    label: "Illness or hospitalisation",
    labelHi: "बीमारी या अस्पताल",
    minYears: 0,
    basis: "monthly-wages",
    multiple: 6,
    timesAllowed: "No limit",
    note: "For yourself or a dependant. No minimum service, which makes this the route available soonest.",
  },
  {
    id: "housing-purchase",
    label: "Buying or building a house",
    labelHi: "घर खरीदना या बनाना",
    minYears: 5,
    basis: "monthly-wages",
    multiple: 36,
    timesAllowed: "Once in a working life",
    note: "The largest advance available. The property must be in your name or held jointly with your spouse.",
  },
  {
    id: "housing-repair",
    label: "Repairing your house",
    labelHi: "घर की मरम्मत",
    minYears: 5,
    basis: "monthly-wages",
    multiple: 12,
    timesAllowed: "Once",
    note: "Available only for a house you already own, and only after it has stood for the required period.",
  },
  {
    id: "education",
    label: "Education",
    labelHi: "शिक्षा",
    minYears: 7,
    basis: "employee-share",
    sharePercent: 50,
    timesAllowed: "Up to three times",
    note: "Post-matriculation study, for you or your child. Counted against the same limit as marriage.",
  },
  {
    id: "marriage",
    label: "Marriage",
    labelHi: "विवाह",
    minYears: 7,
    basis: "employee-share",
    sharePercent: 50,
    timesAllowed: "Up to three times",
    note: "Your own, or a child's or sibling's. Shares its three-time limit with education.",
  },
  {
    id: "unemployment",
    label: "One month without work",
    labelHi: "एक महीने से बेरोज़गार",
    minYears: 0,
    basis: "total-balance",
    sharePercent: 75,
    timesAllowed: "No limit",
    note: "Available after one month of unemployment, and it does not close the account — the rest stays until a final settlement.",
  },
];

export interface AdvanceEligibility {
  purpose: AdvancePurpose;
  eligible: boolean;
  /** Ceiling in rupees, where eligible. */
  ceiling: number;
  reason: string;
}

export function assessAdvances(member: Member): AdvanceEligibility[] {
  const months = member.passbook.length;
  const years = months / 12;
  const employeeShare = member.balance.employeeShare;
  const total = employeeShare + member.balance.employerShare;

  // Monthly wages, taken from the most recent contributing month.
  const lastWage =
    member.passbook[member.passbook.length - 1]?.wages ?? 0;

  return PURPOSES.map((purpose) => {
    const eligible = years >= purpose.minYears;

    let ceiling = 0;
    if (purpose.basis === "monthly-wages" && purpose.multiple) {
      ceiling = Math.min(lastWage * purpose.multiple, total);
    } else if (purpose.basis === "employee-share" && purpose.sharePercent) {
      ceiling = Math.round((employeeShare * purpose.sharePercent) / 100);
    } else if (purpose.basis === "total-balance" && purpose.sharePercent) {
      ceiling = Math.round((total * purpose.sharePercent) / 100);
    }

    const shortBy = Math.ceil(purpose.minYears - years);

    return {
      purpose,
      eligible,
      ceiling,
      reason: eligible
        ? purpose.basis === "monthly-wages"
          ? `${purpose.multiple} times your monthly wages, capped at your balance.`
          : purpose.basis === "employee-share"
            ? `${purpose.sharePercent}% of your own contributions.`
            : `${purpose.sharePercent}% of your total balance.`
        : `Needs ${purpose.minYears} years of service. You have ${years.toFixed(1)} — about ${shortBy} more ${shortBy === 1 ? "year" : "years"}.`,
    };
  });
}
