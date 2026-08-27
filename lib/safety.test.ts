import assert from "node:assert/strict";
import test from "node:test";

import { SIGNALS, assess } from "./safety.ts";

/* The cost of the two mistakes is not symmetric. Missing a fraud
   leaves somebody without their savings; calling a genuine contact
   suspicious costs them a phone call to check. The tests are written
   around that asymmetry. */

test("either conclusive answer alone is enough", () => {
  for (const id of ["password", "fee", "link", "urgent"]) {
    const verdict = assess({ [id]: true });
    assert.equal(verdict.level, "fraud", `${id} should be conclusive on its own`);
    assert.equal(verdict.triggered.length, 1);
    assert.equal(verdict.triggered[0].id, id);
  }
});

test("a fraud signal outranks anything reassuring alongside it", () => {
  const verdict = assess({ password: true, reference: true });
  assert.equal(verdict.level, "fraud");
});

test("more than one fraud signal is said differently", () => {
  const one = assess({ password: true });
  const two = assess({ password: true, fee: true });
  assert.notEqual(one.title, two.title);
  assert.equal(two.triggered.length, 2);
});

test("a soft signal warns rather than accuses", () => {
  for (const id of ["agent", "personal"]) {
    assert.equal(assess({ [id]: true }).level, "warn");
  }
});

test("no reference number is a warning, having one is not", () => {
  assert.equal(assess({ reference: false }).level, "warn");
  assert.equal(assess({ reference: true }).level, "clear");
});

test("nothing reported is clear but never called confirmed", () => {
  const verdict = assess({});
  assert.equal(verdict.level, "clear");
  assert.equal(verdict.triggered.length, 0);
  assert.ok(
    /not the same as confirmed/i.test(verdict.body),
    "an absence of warning signs must not be reported as safety",
  );
});

test("answering no to a fraud question never accuses", () => {
  const allNo = Object.fromEntries(SIGNALS.map((s) => [s.id, false]));
  // reference: false is the one 'no' that is itself a warning.
  delete allNo.reference;
  assert.equal(assess(allNo).level, "clear");
});

test("every signal carries both languages and a level", () => {
  for (const signal of SIGNALS) {
    assert.ok(signal.question.length > 0, signal.id);
    assert.ok(signal.meaning.length > 0, signal.id);
    assert.ok(
      /[ऀ-ॿ]/.test(signal.questionHi),
      `${signal.id} question must be in Devanagari`,
    );
    assert.ok(
      /[ऀ-ॿ]/.test(signal.meaningHi),
      `${signal.id} meaning must be in Devanagari`,
    );
    assert.ok(["fraud", "warn", "clear"].includes(signal.level), signal.id);
  }
});

test("the conclusive questions come first", () => {
  const firstTwo = SIGNALS.slice(0, 2);
  assert.ok(
    firstTwo.every((s) => s.level === "fraud"),
    "somebody who reads only two questions should get the two that settle it",
  );
});
