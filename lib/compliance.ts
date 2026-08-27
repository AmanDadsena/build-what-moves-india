import type { Member, PassbookEntry } from "./types";

/* ============================================================
   Did your employer actually deposit it?

   A provident fund deduction appears on a payslip the month it is
   taken. It appears in the fund only when the employer files it, and
   the two are not the same event. Where an establishment deducts and
   does not deposit, nothing on the member's side announces it: the
   passbook simply has no row for that month, and a missing row is
   easy to read as nothing at all.

   This finds the gaps. It is arithmetic on the member's own record —
   consecutive months are expected between the first and last
   contribution, and anything absent in between is a month somebody
   should account for.
   ============================================================ */

export interface Gap {
  /** ISO year-months with no contribution recorded. */
  months: string[];
  from: string;
  to: string;
  /** Roughly what is missing, using the wage either side of the gap. */
  estimatedValue: number;
}

function monthIndex(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
}

function indexToMonth(i: number): string {
  const y = Math.floor(i / 12);
  const m = (i % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function findGaps(passbook: PassbookEntry[]): Gap[] {
  if (passbook.length < 2) return [];

  const present = new Set(passbook.map((e) => monthIndex(e.month)));
  const first = monthIndex(passbook[0].month);
  const last = monthIndex(passbook[passbook.length - 1].month);

  const gaps: Gap[] = [];
  let run: number[] = [];

  const flush = () => {
    if (run.length === 0) return;
    // Value the gap using the contribution just before it, which is
    // the best evidence of what should have been paid.
    const beforeIndex = run[0] - 1;
    const before = passbook.find((e) => monthIndex(e.month) === beforeIndex);
    const perMonth = before
      ? before.employeeShare + before.employerShare
      : 0;

    gaps.push({
      months: run.map(indexToMonth),
      from: indexToMonth(run[0]),
      to: indexToMonth(run[run.length - 1]),
      estimatedValue: perMonth * run.length,
    });
    run = [];
  };

  for (let i = first + 1; i < last; i++) {
    if (present.has(i)) flush();
    else run.push(i);
  }
  flush();

  return gaps;
}

export interface ComplianceReport {
  gaps: Gap[];
  missingMonths: number;
  estimatedValue: number;
  /** Months expected between the first and last contribution. */
  expected: number;
  recorded: number;
}

export function checkCompliance(member: Member): ComplianceReport {
  const gaps = findGaps(member.passbook);
  const missingMonths = gaps.reduce((n, g) => n + g.months.length, 0);

  const first = member.passbook[0];
  const last = member.passbook[member.passbook.length - 1];
  const expected =
    first && last ? monthIndex(last.month) - monthIndex(first.month) + 1 : 0;

  return {
    gaps,
    missingMonths,
    estimatedValue: gaps.reduce((n, g) => n + g.estimatedValue, 0),
    expected,
    recorded: member.passbook.length,
  };
}
