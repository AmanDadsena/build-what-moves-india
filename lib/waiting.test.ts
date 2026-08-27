import assert from "node:assert/strict";
import test from "node:test";

import { assessWait, ROUTES, COMMITMENT_DAYS } from "./waiting.ts";

const DAY = 86_400_000;
const NOW = new Date("2026-08-27T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY).toISOString();

test("elapsed days are counted from the filing date", () => {
  for (const n of [0, 1, 19, 20, 47, 200]) {
    assert.equal(assessWait(daysAgo(n), NOW)!.elapsed, n);
  }
});

test("a date that is not a date returns nothing rather than NaN", () => {
  assert.equal(assessWait("not a date", NOW), null);
  assert.equal(assessWait("", NOW), null);
});

test("a future filing date floors at zero rather than going negative", () => {
  const future = new Date(NOW.getTime() + 5 * DAY).toISOString();
  assert.equal(assessWait(future, NOW)!.elapsed, 0);
});

test("the stages change where the commitment does", () => {
  assert.equal(assessWait(daysAgo(COMMITMENT_DAYS - 1), NOW)!.stage, "early");
  assert.equal(assessWait(daysAgo(COMMITMENT_DAYS), NOW)!.stage, "due");
  assert.equal(assessWait(daysAgo(COMMITMENT_DAYS + 1), NOW)!.stage, "over");
  assert.equal(assessWait(daysAgo(60), NOW)!.stage, "long");
  assert.equal(assessWait(daysAgo(200), NOW)!.stage, "very-long");
});

test("every stage has something to say", () => {
  for (const n of [0, 20, 21, 60, 400]) {
    const headline = assessWait(daysAgo(n), NOW)!.headline;
    assert.ok(headline.length > 20, `stage at ${n} days has a thin headline`);
  }
});

test("days past the commitment never go below zero", () => {
  assert.equal(assessWait(daysAgo(5), NOW)!.overBy, 0);
  assert.equal(assessWait(daysAgo(COMMITMENT_DAYS), NOW)!.overBy, 0);
  assert.equal(assessWait(daysAgo(COMMITMENT_DAYS + 12), NOW)!.overBy, 12);
});

test("the possible restart count is the honest arithmetic", () => {
  /* Each return of the file as incomplete buys a fresh twenty days,
     so this counts how many times that could have happened while the
     office's own record still showed nothing overdue. */
  assert.equal(assessWait(daysAgo(19), NOW)!.possibleResets, 0);
  assert.equal(assessWait(daysAgo(20), NOW)!.possibleResets, 1);
  assert.equal(assessWait(daysAgo(41), NOW)!.possibleResets, 2);
  assert.equal(assessWait(daysAgo(150), NOW)!.possibleResets, 7);
});

test("exactly one route is statutory, and it is the RTI", () => {
  const hard = ROUTES.filter((r) => r.binding === "hard");
  assert.equal(hard.length, 1);
  assert.equal(hard[0].id, "rti");
  assert.match(hard[0].authority, /Right to Information Act 2005/);
});

test("every route is usable from day zero", () => {
  const onDayZero = assessWait(daysAgo(0), NOW)!;
  for (const route of onDayZero.routes) {
    assert.equal(
      route.openNow,
      true,
      `${route.id} should be available on the first day`,
    );
  }
  // The point of the page: the only binding one is open immediately.
  const rti = onDayZero.routes.find((r) => r.id === "rti")!;
  assert.equal(rti.binding, "hard");
  assert.equal(rti.availableAfter, 0);
});

test("proportionality is what changes over time, not availability", () => {
  const early = assessWait(daysAgo(1), NOW)!;
  const late = assessWait(daysAgo(120), NOW)!;

  const proportionateEarly = early.routes.filter((r) => r.proportionate).length;
  const proportionateLate = late.routes.filter((r) => r.proportionate).length;

  assert.ok(
    proportionateLate > proportionateEarly,
    "more routes should become proportionate as the wait grows",
  );
  assert.equal(
    late.routes.every((r) => r.proportionate),
    true,
    "after four months everything should be proportionate",
  );
});

test("a soft route never claims a consequence it does not have", () => {
  for (const route of ROUTES.filter((r) => r.binding === "soft")) {
    assert.match(
      route.consequence,
      /None|Nothing/i,
      `${route.id} implies an enforceable consequence it does not have`,
    );
  }
});

test("the date a route becomes proportionate is measured from filing", () => {
  const filed = daysAgo(0);
  const result = assessWait(filed, NOW)!;
  for (const route of result.routes) {
    const expected = new Date(
      new Date(filed).getTime() + route.sensibleAfter * DAY,
    );
    assert.equal(route.sensibleOn.getTime(), expected.getTime(), route.id);
  }
});
