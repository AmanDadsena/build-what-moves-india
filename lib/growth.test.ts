import assert from "node:assert/strict";
import test from "node:test";

import { project, RATE_LOW, RATE_MID, RATE_HIGH } from "./growth.ts";

/* The arithmetic here decides whether a member is told they would
   have nineteen lakh or twenty-two, so it is worth pinning to figures
   that can be checked by hand rather than to whatever the code
   happened to produce on the day it was written. */

test("interest accrues monthly and credits once a year", () => {
  // ₹1,00,000 at 8.25%: twelve months of 100000 × 0.0825/12 = 687.50,
  // credited at the year end. 100000 + 8250 = 108250, exactly.
  const one = project({ opening: 100_000, years: 1 });
  assert.equal(one.points.length, 1);
  assert.equal(one.mid, 108_250);
});

test("the second year compounds on the first year's credit", () => {
  // 108250 × 1.0825 = 117,180.625, which rounds to 117181.
  const two = project({ opening: 100_000, years: 2 });
  assert.equal(two.points[1].mid, 117_181);
  assert.equal(two.mid, 117_181);
});

test("a contribution earns nothing in the month it is paid", () => {
  /* This is the scheme's own rule and the thing a generic compound
     interest formula gets wrong. Interest is taken on the balance at
     the start of each month, so the sum over twelve months is
     0.006875 × (12 × 100000 + 1000 × (0+1+…+11)) = 8703.75, and the
     closing balance is 100000 + 12000 + 8703.75 = 120,703.75. */
  const withPay = project({
    opening: 100_000,
    monthlyContribution: 1_000,
    years: 1,
  });
  assert.equal(withPay.mid, 120_704);

  /* The generic version of this calculation compounds monthly and
     treats the contributions as an annuity earning from the month
     they are paid. It is the formula every online EPF calculator
     uses, and it overstates the result — which on a thirty-year
     projection is lakhs of rupees a member would never receive. */
  const i = 0.0825 / 12;
  const generic =
    100_000 * (1 + i) ** 12 + 1_000 * (((1 + i) ** 12 - 1) / i);
  assert.ok(
    generic > withPay.mid,
    "monthly compounding should be the flattering one",
  );
});

test("the band is ordered and widens over time", () => {
  const short = project({ opening: 500_000, years: 1 });
  const long = project({ opening: 500_000, years: 25 });

  for (const result of [short, long]) {
    assert.ok(result.low < result.mid, "low must sit under mid");
    assert.ok(result.mid < result.high, "mid must sit under high");
  }

  const spreadNow = short.high - short.low;
  const spreadLater = long.high - long.low;
  assert.ok(
    spreadLater > spreadNow * 10,
    "uncertainty must grow with the projection, not stay flat",
  );
});

test("the declared band is the one the projection actually uses", () => {
  assert.ok(RATE_LOW < RATE_MID && RATE_MID < RATE_HIGH);
  const result = project({ opening: 100_000, years: 1 });
  assert.equal(result.low, Math.round(100_000 * (1 + RATE_LOW / 100)));
  assert.equal(result.high, Math.round(100_000 * (1 + RATE_HIGH / 100)));
});

test("interest earned is what nobody paid in", () => {
  const result = project({
    opening: 200_000,
    monthlyContribution: 2_000,
    years: 5,
  });
  assert.equal(result.contributed, 200_000 + 2_000 * 60);
  assert.equal(result.interestEarned, result.mid - result.contributed);
  assert.ok(result.interestEarned > 0);
});

test("a projection is never shorter than a year", () => {
  const result = project({ opening: 10_000, years: 0 });
  assert.equal(result.years, 1);
  assert.equal(result.points.length, 1);
});
