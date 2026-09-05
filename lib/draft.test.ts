import assert from "node:assert/strict";
import test from "node:test";

import {
  EMPTY,
  FORMS,
  STORAGE_KEY,
  completeness,
  draft,
  isRealDate,
  parse,
  serialise,
  templatesFor,
  toClaim,
  toSubject,
  type DraftInput,
} from "./draft.ts";
import { DOCUMENTS } from "./documents.ts";
import { REJECTIONS } from "./rejections.ts";
import { KEYS } from "./casefile.ts";

const filled: DraftInput = {
  name: "Sunita Devi",
  uan: "991122334455",
  employer: "Ashoka Textiles Pvt Ltd",
  form: "Form 19",
  type: "Final settlement",
  filedOn: "2026-06-11",
  amount: "187430",
  remark: "Name in EPFO records not matching with Aadhaar",
  reasonId: "name-mismatch",
};

/* These letters go to a public authority under a statute. A draft
   that prints "undefined" in the middle of an RTI application, or
   silently addresses it on behalf of a demonstration member, is worse
   than no draft — so the failure modes are pinned harder than the
   happy path. */

test("a filled form produces the member's own letter", () => {
  const text = draft(filled, "rti-notesheet")!;
  assert.ok(text.includes("Sunita Devi"));
  assert.ok(text.includes("991122334455"));
  assert.ok(text.includes("Ashoka Textiles Pvt Ltd"));
  assert.ok(text.includes("Name in EPFO records not matching with Aadhaar"));
  assert.ok(text.includes("RIGHT TO INFORMATION ACT"));
});

test("no demonstration member ever leaks into a draft", () => {
  // The whole point: this used to require signing in as one of them.
  const strangers = ["Rajesh", "Priya", "Aslam", "990012345678", "990087654321", "990055512340"];
  for (const template of DOCUMENTS) {
    const text = draft(filled, template.id);
    if (!text) continue;
    for (const s of strangers) {
      assert.ok(
        !text.includes(s),
        `${template.id} carries "${s}" into a real member's letter`,
      );
    }
  }
});

test("every template can be drafted from the eight fields", () => {
  for (const template of DOCUMENTS) {
    const text = draft(filled, template.id);
    assert.ok(text && text.length > 200, `${template.id} produced nothing usable`);
  }
});

test("an empty form still drafts, with instructions where the gaps are", () => {
  // A form that refuses until every box is filled is a form that gets
  // abandoned by somebody who cannot remember the amount.
  const text = draft(EMPTY, "rti-notesheet")!;
  assert.ok(text.length > 200);
  assert.ok(text.includes("[your 12-digit UAN]"));
  assert.ok(text.includes("[your full name, as on your UAN]"));
});

test("nothing ever prints undefined, NaN or Invalid Date", () => {
  const partial: DraftInput = { ...EMPTY, name: "A", reasonId: "name-mismatch" };
  for (const input of [EMPTY, partial, filled]) {
    for (const template of DOCUMENTS) {
      const text = draft(input, template.id);
      if (!text) continue;
      for (const bad of ["undefined", "NaN", "Invalid Date", "null"]) {
        assert.ok(
          !text.includes(bad),
          `${template.id} printed "${bad}" for ${JSON.stringify(input.name || "(empty)")}`,
        );
      }
    }
  }
});

test("a date that is not a date does not become Invalid Date", () => {
  assert.equal(isRealDate("2026-06-11"), true);
  assert.equal(isRealDate("11/06/2026"), false);
  assert.equal(isRealDate(""), false);
  assert.equal(isRealDate("2026-13-45"), false);
  assert.equal(toClaim({ ...filled, filedOn: "nonsense" }).filedOn, "");
});

test("an amount typed with commas or a rupee sign still reads as a number", () => {
  assert.equal(toClaim({ ...filled, amount: "1,87,430" }).amount, 187430);
  assert.equal(toClaim({ ...filled, amount: "₹187430" }).amount, 187430);
  assert.equal(toClaim({ ...filled, amount: "" }).amount, 0);
  assert.equal(toClaim({ ...filled, amount: "abc" }).amount, 0);
});

test("a blank field becomes an instruction, not an empty space", () => {
  const s = toSubject({ ...EMPTY });
  for (const v of Object.values(s)) {
    assert.match(v, /^\[.+\]$/, "a gap should tell the member what to write");
  }
});

test("an unknown document is refused rather than half-built", () => {
  assert.equal(draft(filled, "not-a-template"), null);
});

test("a member who cannot identify their reason still gets the two that always apply", () => {
  const ids = templatesFor("").map((d) => d.id);
  assert.ok(ids.includes("rti-notesheet"), "the one instrument with a deadline");
  assert.ok(ids.includes("epfigms"));
});

test("every reason offers the RTI, whatever else it offers", () => {
  for (const r of REJECTIONS) {
    const ids = templatesFor(r.id).map((d) => d.id);
    assert.ok(
      ids.includes("rti-notesheet"),
      `${r.id} does not offer the RTI, which applies whatever went wrong`,
    );
  }
});

test("completeness counts what is missing without blocking anything", () => {
  assert.deepEqual(completeness(filled).missing, []);
  assert.equal(completeness(filled).filled, completeness(filled).total);

  const none = completeness(EMPTY);
  assert.equal(none.filled, 0);
  assert.ok(none.missing.includes("your UAN"));
});

test("what was typed survives being saved and read back", () => {
  assert.deepEqual(parse(serialise(filled)), filled);
});

test("nothing stored, or something corrupt, yields an empty form", () => {
  assert.deepEqual(parse(null), EMPTY);
  assert.deepEqual(parse("{ not json"), EMPTY);
  assert.deepEqual(parse("[]"), EMPTY);
  assert.deepEqual(parse("null"), EMPTY);
});

test("a stored value from a different build cannot inject fields", () => {
  const back = parse(JSON.stringify({ ...filled, evil: "x", amount: 42 }));
  assert.equal((back as unknown as Record<string, unknown>).evil, undefined);
  // A non-string where a string belongs falls back rather than carrying through.
  assert.equal(back.amount, "");
});

test("the draft travels with the case backup", () => {
  assert.ok(
    (KEYS as readonly string[]).includes(STORAGE_KEY),
    "a member who fills this in and changes phone should not retype it",
  );
});

test("every offered form has a description the letters can use", () => {
  for (const f of FORMS) {
    assert.ok(f.form.length > 0 && f.type.length > 0);
  }
  assert.ok(FORMS.some((f) => f.form === "Form 19"));
});
