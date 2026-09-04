import assert from "node:assert/strict";
import test from "node:test";

import {
  ROUTE_COSTS,
  EFFORT_LABEL,
  byCost,
  compare,
  ladderStep,
  priceAll,
  routeCost,
} from "./cost.ts";
import { ESCALATION_LADDER } from "./escalation.ts";

/* The argument this page makes is a comparison, not a total. The
   individual travel estimates can be wrong for any given member —
   an office forty minutes away is not an office four hours away —
   and the conclusion has to survive that. These pin the shape of the
   comparison rather than the figures. */

test("a day off costs more than every fee in the process put together", () => {
  // The whole point. If this ever stops being true the page is
  // making an argument the numbers do not support.
  const fees = ROUTE_COSTS.reduce((sum, r) => sum + r.fee, 0);
  const oneDay = 600; // a modest daily wage
  assert.ok(
    oneDay > fees * 10,
    `fees total ₹${fees}; a single day's wage should dwarf them`,
  );
});

test("the fees really are almost nothing", () => {
  const paid = ROUTE_COSTS.filter((r) => r.fee > 0);
  assert.equal(paid.length, 1, "only the RTI application carries a fee");
  assert.equal(paid[0].id, "rti");
  assert.equal(paid[0].fee, 10);
});

test("a route needing no travel loses no wages, whatever the wage", () => {
  for (const wage of [0, 300, 600, 2500]) {
    for (const r of priceAll(wage)) {
      if (r.daysOff === 0) {
        assert.equal(r.wagesLost, 0, `${r.id} charges for a day it does not take`);
      }
    }
  }
});

test("the office visit is the dearest thing on the list at any real wage", () => {
  for (const wage of [300, 600, 1200]) {
    const dearest = compare(priceAll(wage)).dearest;
    assert.equal(
      dearest.id,
      "office-visit",
      `at ₹${wage} a day the dearest route should be the one everybody recommends`,
    );
  }
});

test("a member earning nothing loses nothing by going, and the order says so", () => {
  // Somebody out of work has no wages to forgo. The ordering that
  // produces is the true one for them, and the page must not price
  // their time as though they were earning.
  const priced = priceAll(0);
  for (const r of priced) assert.equal(r.wagesLost, 0);

  const visit = priced.find((r) => r.id === "office-visit")!;
  assert.equal(visit.total, visit.incidentals, "fare and photocopies only");
});

test("a wage that is not a number is treated as no wage rather than as NaN", () => {
  for (const bad of [NaN, -500, Infinity]) {
    const priced = priceAll(bad);
    for (const r of priced) {
      assert.ok(Number.isFinite(r.total), `${r.id} produced ${r.total}`);
      assert.ok(r.total >= 0);
    }
  }
});

test("the free routes are free, and there are several of them", () => {
  const c = compare(priceAll(600));
  assert.ok(
    c.free >= 3,
    "the point is that the cheapest options are the ones nobody mentions",
  );
  assert.equal(c.cheapest.total, 0);
});

test("cheapest comes first, and a binding route wins a tie", () => {
  const sorted = byCost(priceAll(600));
  for (let i = 1; i < sorted.length; i++) {
    assert.ok(
      sorted[i - 1].total <= sorted[i].total,
      "the list is not ordered by cost",
    );
    if (sorted[i - 1].total === sorted[i].total) {
      assert.ok(
        !(sorted[i - 1].binding === "soft" && sorted[i].binding === "hard"),
        "between two routes of equal price, the one with a deadline should come first",
      );
    }
  }
});

test("the RTI is cheaper than the office visit by a wide margin", () => {
  const priced = priceAll(600);
  const rti = priced.find((r) => r.id === "rti")!;
  const visit = priced.find((r) => r.id === "office-visit")!;
  assert.ok(
    visit.total > rti.total * 5,
    `visit ₹${visit.total} vs RTI ₹${rti.total} — the gap is the argument`,
  );
  assert.equal(rti.binding, "hard");
  assert.equal(visit.binding, "soft", "and the dear one binds nobody");
});

test("exactly one costed route carries a fee note about being free by statute", () => {
  const appeal = routeCost("rti-appeal")!;
  assert.equal(appeal.fee, 0);
  assert.ok(appeal.feeNote?.includes("free"));
});

test("every route says what is worth knowing before choosing it", () => {
  for (const r of ROUTE_COSTS) {
    assert.ok(r.note.length > 60, `${r.id} has no useful note`);
    assert.ok(EFFORT_LABEL[r.effort], `${r.id} has an effort with no label`);
    assert.ok(r.elapsedDays >= 0);
  }
});

test("route ids are unique", () => {
  const ids = ROUTE_COSTS.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("a costed route that claims a ladder step points at a real one", () => {
  const known = new Set(ESCALATION_LADDER.map((s) => s.id));
  for (const r of ROUTE_COSTS) {
    const step = ladderStep(r.id);
    if (step) assert.ok(known.has(step.id), `${r.id} maps to a missing step`);
  }
});

test("the two dearest routes are not steps in any documented process", () => {
  // Worth stating: the most expensive things a member does — going to
  // a counter, chasing a signature — appear on no official ladder.
  assert.equal(ladderStep("office-visit"), undefined);
  assert.equal(ladderStep("attestation"), undefined);
});

test("a route nobody costed returns nothing rather than a guess", () => {
  assert.equal(routeCost("invented"), undefined);
});

test("the dearest route is not always the office visit, so prose must not assume it", () => {
  // At a real wage the visit dominates. At zero it does not, and a
  // headline that names the office visit while printing whatever the
  // ranking put last says ₹195 about a ₹150 route. Pinned because the
  // page said exactly that until it was caught.
  const earning = compare(priceAll(600));
  assert.equal(earning.dearest.id, "office-visit");

  const notEarning = compare(priceAll(0));
  assert.notEqual(
    notEarning.dearest.id,
    "office-visit",
    "with no wages to lose the ranking changes, and named prose has to look the route up",
  );

  const visit = priceAll(0).find((r) => r.id === "office-visit")!;
  assert.ok(
    visit.total < notEarning.dearest.total,
    "so the two figures are genuinely different and cannot be used interchangeably",
  );
});
