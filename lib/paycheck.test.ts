import assert from "node:assert/strict";
import test from "node:test";

import {
  split,
  checkMonth,
  ceilingStory,
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

test("EDLI and administration sit on top and are charged on the ceiling", () => {
  const s = split(90_000);
  assert.equal(s.edli, Math.round(EPS_WAGE_CEILING * 0.005));
  assert.equal(s.admin, Math.round(EPS_WAGE_CEILING * 0.005));
  assert.equal(s.employerOutlay, s.employerTotal + s.edli + s.admin);
  assert.ok(
    s.employerOutlay > s.employerTotal,
    "the cost an employer quotes is higher than the payslip shows",
  );
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
