import assert from "node:assert/strict";
import test from "node:test";

import { DUTIES, dutyFor, employerBlockedCount } from "./employers.ts";
import { REJECTIONS, getRejection } from "./rejections.ts";

/* This page makes a numeric claim to an employer about their own
   obligations. It has already been wrong once: the count was taken
   from whoMustAct, which names who moves *first* rather than who has
   to be involved, and reported one of fifteen — both false and the
   opposite of the page's argument. */

test("the count comes from the fix steps, not from who moves first", () => {
  const byStep = REJECTIONS.filter((r) =>
    r.fixSteps.some((s) => s.actor === "employer"),
  ).length;
  assert.equal(employerBlockedCount(), byStep);
  assert.ok(byStep > 1, "a count of one would mean the page has no argument");
  assert.ok(byStep < REJECTIONS.length, "not every rejection needs an employer");
});

test("every rejection a duty claims to clear actually exists", () => {
  for (const duty of DUTIES) {
    for (const id of duty.resolves) {
      assert.ok(getRejection(id), `duty "${duty.id}" names unknown rejection "${id}"`);
    }
  }
});

test("every rejection a duty clears really does need the employer", () => {
  for (const duty of DUTIES) {
    for (const id of duty.resolves) {
      const r = getRejection(id)!;
      assert.ok(
        r.fixSteps.some((s) => s.actor === "employer"),
        `"${id}" is listed under "${duty.ask}" but no step of it is the employer's`,
      );
    }
  }
});

test("no rejection is claimed by two different duties", () => {
  const seen = new Set<string>();
  for (const duty of DUTIES) {
    for (const id of duty.resolves) {
      assert.ok(!seen.has(id), `"${id}" is claimed twice`);
      seen.add(id);
    }
  }
});

test("dutyFor finds the duty, and stays quiet when there is none", () => {
  assert.equal(dutyFor("employer-kyc-pending")?.id, "kyc");
  assert.equal(dutyFor("exit-date-missing")?.id, "exit");
  assert.equal(dutyFor("no-such-rejection"), undefined);
});

test("each duty is written for the reader it is addressed to", () => {
  for (const duty of DUTIES) {
    assert.ok(duty.ask.length > 0, `${duty.id} has no ask`);
    assert.ok(/[ऀ-ॿ]/.test(duty.askHi), `${duty.id} has no Devanagari ask`);
    assert.ok(
      duty.whyNotMember.length > 80,
      `${duty.id} does not explain why the member cannot do it`,
    );
    assert.ok(duty.costToMember.length > 0 && duty.costToEmployer.length > 0);
  }
});
