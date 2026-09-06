import assert from "node:assert/strict";
import test from "node:test";

import {
  split,
  checkMonth,
  checkPayslip,
  ceilingStory,
  contributionBase,
  EPS_WAGE_CEILING,
} from "./paycheck.ts";
import { MEMBERS } from "./members.ts";
import type { PassbookEntry } from "./types.ts";

/* This screen tells a member their own employer's arithmetic is
   correct, or that it is not. Getting that wrong in either direction
   is serious — a false alarm sends somebody to argue with their
   payroll department over nothing, and a missed one leaves real money
   unclaimed — so the rules are pinned to worked examples. */

test("below the ceiling, the pension share follows the wage", () => {
  const s = split(10_000);
  assert.equal(s.employee, 1_200); // 12%
  assert.equal(s.employerTotal, 1_200);
  assert.equal(s.toPension, 833); // 8.33% of 10,000
  assert.equal(s.toFund, 367); // the balance of the employer's 12%
  assert.equal(s.ceilingApplied, false);
  assert.equal(s.ceilingCost, 0);
});

test("above the ceiling, the pension share freezes", () => {
  const at = split(EPS_WAGE_CEILING);
  const above = split(45_000);

  assert.equal(at.toPension, above.toPension, "pension is capped, not scaled");
  assert.equal(above.toPension, 1_250); // 8.33% of 15,000
  assert.equal(above.ceilingApplied, true);

  // Everything else does keep scaling, which is the confusing part.
  assert.equal(above.employee, 5_400);
  assert.equal(above.employerTotal, 5_400);
  assert.equal(above.toFund, 5_400 - 1_250);
});

test("the ceiling's cost is the difference it makes that month", () => {
  const s = split(45_000);
  assert.equal(s.pensionUncapped, Math.round(45_000 * 0.0833));
  assert.equal(s.ceilingCost, s.pensionUncapped - s.toPension);
  assert.ok(s.ceilingCost > 2_000);
});

test("the employer's twelve per cent is fully accounted for", () => {
  for (const wage of [8_000, 15_000, 15_001, 32_500, 90_000]) {
    const s = split(wage);
    assert.equal(
      s.toFund + s.toPension,
      s.employerTotal,
      `employer share must split exactly at ₹${wage}`,
    );
    assert.ok(s.toFund >= 0, `employer fund share went negative at ₹${wage}`);
  }
});

test("what reaches the fund is the member's share plus the employer's remainder", () => {
  const s = split(28_000);
  assert.equal(s.intoFund, s.employee + s.toFund);
  // Not the whole 24%: the pension diversion is the difference.
  assert.equal(s.employee + s.employerTotal - s.intoFund, s.toPension);
});

test("EDLI is charged on the ceiling and administration is not", () => {
  /* These were computed on the same base until the rates were checked
     against EPFO's own published table. EDLI (account 21) is 0.5% of
     the ceiling wage, so it stops at ₹75. Administration (account 2)
     is 0.5% of the EPF wages actually contributed on, so on a member
     paid ₹90,000 whose employer contributes on the whole of it, it is
     ₹450 rather than ₹75 — and the employer's real cost was being
     understated by the difference. */
  const s = split(90_000);
  assert.equal(s.edli, Math.round(EPS_WAGE_CEILING * 0.005), "capped");
  assert.equal(s.admin, Math.round(90_000 * 0.005), "not capped");
  assert.notEqual(s.admin, s.edli, "the two do not share a base");

  assert.equal(s.employerOutlay, s.employerTotal + s.edli + s.admin);
  assert.ok(
    s.employerOutlay > s.employerTotal,
    "the cost an employer quotes is higher than the payslip shows",
  );
});

test("at or below the ceiling the two charges do coincide", () => {
  // Which is why the error was invisible: every worked example in the
  // demo data sits at or near the ceiling.
  const s = split(EPS_WAGE_CEILING);
  assert.equal(s.edli, s.admin);
  assert.equal(s.admin, 75);
});

test("a passbook row that follows the rules is reported as agreeing", () => {
  for (const member of MEMBERS) {
    for (const entry of member.passbook) {
      const check = checkMonth(entry);
      assert.ok(
        check.agrees,
        `${member.name} ${entry.month} should reconcile: ${JSON.stringify(check.fields)}`,
      );
    }
  }
});

test("a tampered row is caught, and the right field is named", () => {
  const original = MEMBERS[0].passbook.at(-1)!;
  const tampered: PassbookEntry = {
    ...original,
    employerShare: original.employerShare - 500,
  };

  const check = checkMonth(tampered);
  assert.equal(check.agrees, false);

  const bad = check.fields.filter((f) => !f.agrees);
  assert.equal(bad.length, 1);
  assert.equal(bad[0].field, "employerShare");
  assert.equal(bad[0].difference, -500);
});

test("a rupee of rounding is not called a discrepancy", () => {
  const original = MEMBERS[0].passbook.at(-1)!;
  const rounded: PassbookEntry = {
    ...original,
    employeeShare: original.employeeShare + 1,
  };
  assert.equal(checkMonth(rounded).agrees, true);
});

test("the ceiling story finds the month the freeze began", () => {
  // Aslam starts at ₹14,000 and rises past the ceiling mid-career.
  const aslam = MEMBERS.find((m) => m.name.includes("Aslam"))!;
  const story = ceilingStory(aslam);

  assert.ok(story.crossedAt, "his wages do pass the ceiling");
  assert.ok(story.crossedAt!.wages > EPS_WAGE_CEILING);

  const earlier = aslam.passbook.filter(
    (e) => e.month < story.crossedAt!.month,
  );
  assert.ok(
    earlier.every((e) => e.wages <= EPS_WAGE_CEILING),
    "nothing before the crossing month may already be above it",
  );

  assert.equal(story.monthsAbove, aslam.passbook.filter((e) => e.wages > EPS_WAGE_CEILING).length);
  assert.ok(story.averageWageAbove > EPS_WAGE_CEILING);
  assert.ok(story.totalCost > 0);
});

test("a member who never crossed the ceiling is told nothing alarming", () => {
  const low: PassbookEntry[] = [
    { month: "2024-01", wages: 12_000, employeeShare: 1_440, employerShare: 440, pensionShare: 1_000 },
  ];
  const member = { ...MEMBERS[0], passbook: low };
  const story = ceilingStory(member);

  assert.equal(story.crossedAt, undefined);
  assert.equal(story.monthsAbove, 0);
  assert.equal(story.totalCost, 0);
});

/* The three-way payslip verdict.

   Getting this wrong in either direction has a cost. Calling a lawful
   ceiling restriction "wrong" sends somebody to argue with payroll
   over nothing; calling a genuine shortfall "fine" leaves real money
   uncollected. So each branch is pinned. */

test("a deduction computed on full wages is recognised as such", () => {
  const c = checkPayslip(30_000, 3_600); // 12% of 30,000
  assert.equal(c.verdict, "matches-wages");
  assert.equal(c.offBy, 0);
  assert.equal(c.onFullWages, 3_600);
  assert.equal(c.onCeiling, 1_800);
  assert.equal(c.monthlyGap, 1_800);
});

test("a deduction stopped at the ceiling is lawful, not an error", () => {
  const c = checkPayslip(30_000, 1_800); // 12% of 15,000
  assert.equal(c.verdict, "restricted-to-ceiling");
  assert.equal(c.offBy, 0, "a restriction is not a discrepancy");
  assert.equal(c.monthlyGap, 1_800);
});

test("below the ceiling the two rules collapse into one", () => {
  const c = checkPayslip(12_000, 1_440);
  assert.equal(c.onFullWages, c.onCeiling);
  assert.equal(c.verdict, "matches-wages");
  assert.equal(c.monthlyGap, 0, "there is no gap to lose below the ceiling");
});

test("a figure matching neither rule is reported, with the shortfall", () => {
  const c = checkPayslip(30_000, 2_500);
  assert.equal(c.verdict, "neither");
  // Closer to the ceiling figure than to full wages, so measured from that.
  assert.equal(c.offBy, 2_500 - 1_800);
});

test("the shortfall is signed, so over and under are distinguishable", () => {
  assert.ok(checkPayslip(20_000, 2_000).offBy > 0, "more than the rule gives");
  assert.ok(checkPayslip(20_000, 1_000).offBy < 0, "less than the rule gives");
});

test("a rupee of rounding is not a discrepancy", () => {
  for (const d of [3_599, 3_600, 3_601]) {
    assert.equal(checkPayslip(30_000, d).verdict, "matches-wages", `at ${d}`);
  }
});

test("the ceiling gap is never negative", () => {
  for (const wage of [5_000, 15_000, 15_001, 90_000]) {
    assert.ok(checkPayslip(wage, 0).monthlyGap >= 0, `at ₹${wage}`);
  }
});

test("the diagnosis agrees with the split it is derived from", () => {
  for (const wage of [9_000, 15_000, 24_000, 75_000]) {
    const s = split(wage);
    assert.equal(checkPayslip(wage, s.employee).verdict, "matches-wages");
    assert.equal(checkPayslip(wage, s.employee).onFullWages, s.employee);
  }
});

/* The employer half of a restricted arrangement.

   The page that reports the verdict also shows what the employer puts
   in alongside the deduction. Splitting the member's actual salary
   there produced figures that contradicted the sentence above them —
   it told a member their employer had restricted contributions to
   ₹15,000 and then showed ₹4,750 of employer money entering the fund,
   which cannot both be true. These pin the base to the verdict. */

test("a restricted arrangement is worked out on the ceiling, not the salary", () => {
  const check = checkPayslip(50_000, 1_800);
  assert.equal(check.verdict, "restricted-to-ceiling");

  const base = contributionBase(check);
  assert.equal(base, EPS_WAGE_CEILING);

  const s = split(base!);
  assert.equal(s.employerTotal, 1_800);
  assert.equal(s.toPension, 1_250);
  assert.equal(s.toFund, 550, "what actually reaches the fund");
  assert.equal(s.employerOutlay, 1_950);
});

test("the restricted figure is nothing like the one from the salary", () => {
  const onSalary = split(50_000);
  const onCeiling = split(contributionBase(checkPayslip(50_000, 1_800))!);

  // The bug shipped the first of these on a page asserting the second.
  assert.equal(onSalary.toFund, 4_750);
  assert.equal(onCeiling.toFund, 550);
  assert.ok(onSalary.toFund > onCeiling.toFund * 8);
});

test("an unrestricted arrangement is worked out on the salary", () => {
  const check = checkPayslip(50_000, 6_000);
  assert.equal(check.verdict, "matches-wages");
  assert.equal(contributionBase(check), 50_000);
});

test("below the ceiling both readings give the same base", () => {
  const check = checkPayslip(12_000, 1_440);
  assert.equal(contributionBase(check), 12_000);
});

test("a deduction matching neither rule yields no base to display", () => {
  const check = checkPayslip(50_000, 3_000);
  assert.equal(check.verdict, "neither");
  assert.equal(
    contributionBase(check),
    null,
    "inventing a base to have something to show is the failure being avoided",
  );
});
