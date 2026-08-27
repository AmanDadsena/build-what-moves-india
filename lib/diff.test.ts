import assert from "node:assert/strict";
import test from "node:test";

import { classifyMismatch, diffChars } from "./diff.ts";

function assertDiffInvariants(left: string, right: string) {
  const segments = diffChars(left, right);

  assert.equal(
    segments
      .filter((segment) => segment.state !== "added")
      .map((segment) => segment.text)
      .join(""),
    left
  );
  assert.equal(
    segments
      .filter((segment) => segment.state !== "removed")
      .map((segment) => segment.text)
      .join(""),
    right
  );

  return segments;
}

test("tolerates a name that differs only in case", () => {
  assert.deepEqual(classifyMismatch("name", "RAJESH KUMAR", "Rajesh Kumar"), {
    severity: "tolerated",
    reason: "Your records differ only in letter case. You do not need to change this field.",
  });
});

test("tolerates a name that differs only in whitespace", () => {
  assert.deepEqual(classifyMismatch("name", "RAJESH  KUMAR", "RAJESH KUMAR"), {
    severity: "tolerated",
    reason: "Your records differ only in spacing. You do not need to change this field.",
  });
});

test("blocks a dropped name part", () => {
  assert.deepEqual(
    classifyMismatch("name", "RAJESH KUMAR SINGH", "RAJESH KUMAR"),
    {
      severity: "blocking",
      reason: "One record has an extra name part. Make every name part match before you submit the claim.",
    }
  );
});

test("marks an expanded initial as probable", () => {
  assert.deepEqual(classifyMismatch("name", "R KUMAR", "RAJESH KUMAR"), {
    severity: "probable",
    reason: "One record uses an initial and the other spells out that name part. Check your verified ID before you update either record.",
  });
});

test("blocks swapped name order", () => {
  assert.deepEqual(classifyMismatch("name", "KUMAR RAJESH", "RAJESH KUMAR"), {
    severity: "blocking",
    reason: "Your name parts appear in a different order. Put them in the same order across your records.",
  });
});

test("marks transliterated spellings as probable", () => {
  assert.deepEqual(classifyMismatch("name", "MOHD ASLAM", "MOHAMMED ASLAM"), {
    severity: "probable",
    reason: "Your records use different transliterated spellings of the same name. Check your verified ID before you update either record.",
  });
});

test("blocks a one-letter name typo", () => {
  assert.deepEqual(classifyMismatch("name", "RAJESH KUMER", "RAJESH KUMAR"), {
    severity: "blocking",
    reason: "One letter in your name differs. Correct the record with the typo before you submit the claim.",
  });
});

test("blocks every date of birth difference", () => {
  const result = classifyMismatch("dateOfBirth", "14/03/1991", "14/03/1992");

  assert.equal(result.severity, "blocking");
  assert.match(result.reason, /date of birth/i);
});

test("blocks every IFSC difference", () => {
  const result = classifyMismatch("ifsc", "HDFC0001234", "HDFC0004321");

  assert.equal(result.severity, "blocking");
  assert.match(result.reason, /IFSC/i);
});

test("diffs identical strings without marking a change", () => {
  assert.deepEqual(assertDiffInvariants("RAJESH", "RAJESH"), [
    { text: "RAJESH", state: "same" },
  ]);
});

test("marks insertions at the start, middle, and end", () => {
  assert.deepEqual(assertDiffInvariants("BC", "ABC"), [
    { text: "A", state: "added" },
    { text: "BC", state: "same" },
  ]);
  assert.deepEqual(assertDiffInvariants("AC", "ABC"), [
    { text: "A", state: "same" },
    { text: "B", state: "added" },
    { text: "C", state: "same" },
  ]);
  assert.deepEqual(assertDiffInvariants("AB", "ABC"), [
    { text: "AB", state: "same" },
    { text: "C", state: "added" },
  ]);
});

test("marks a pure deletion", () => {
  assert.deepEqual(assertDiffInvariants("ABC", "AC"), [
    { text: "A", state: "same" },
    { text: "B", state: "removed" },
    { text: "C", state: "same" },
  ]);
});

test("marks a mid-string substitution as removal then addition", () => {
  assert.deepEqual(assertDiffInvariants("ABC", "ADC"), [
    { text: "A", state: "same" },
    { text: "B", state: "removed" },
    { text: "D", state: "added" },
    { text: "C", state: "same" },
  ]);
});

test("handles either input being empty", () => {
  assert.deepEqual(assertDiffInvariants("", "ABC"), [
    { text: "ABC", state: "added" },
  ]);
  assert.deepEqual(assertDiffInvariants("ABC", ""), [
    { text: "ABC", state: "removed" },
  ]);
});

test("handles strings with no shared characters", () => {
  assert.deepEqual(assertDiffInvariants("ABC", "DEF"), [
    { text: "ABC", state: "removed" },
    { text: "DEF", state: "added" },
  ]);
});

test("preserves Devanagari input when one character differs", () => {
  assert.deepEqual(assertDiffInvariants("राम", "रम"), [
    { text: "र", state: "same" },
    { text: "ा", state: "removed" },
    { text: "म", state: "same" },
  ]);
});
