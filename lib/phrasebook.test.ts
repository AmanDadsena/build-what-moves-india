import assert from "node:assert/strict";
import test from "node:test";

import {
  PHRASES,
  SCRIPT_PHRASES,
  VARIANTS,
  canonical,
  phraseById,
  read,
} from "./phrasebook.ts";
import { interpret, search } from "./search.ts";

/* The failure this file exists to prevent is invisible from an
   English keyboard. Every query below returned nothing at all before
   the phrasebook, on a site whose own landing page says the question
   people arrive with is "why has my money not come" — so these are
   pinned first and hardest. */

const DEAD_BEFORE = [
  "paisa nahi aaya",
  "paise nahi aaye",
  "mera pf ka paisa nahi mila",
  "PF ka paisa kab milega",
  "naam galat hai",
  "claim reject ho gaya",
  "pf nikalna hai",
  "naukri chhod di",
  "मेरा पैसा नहीं आया",
  "कंपनी बंद हो गई",
  "पैसा नहीं आया",
];

test("the queries most of India would type return something", () => {
  for (const q of DEAD_BEFORE) {
    const results = search(q);
    assert.ok(
      results.length > 0,
      `"${q}" returns nothing — this is the bug the phrasebook exists to fix`,
    );
  }
});

test("money that has not arrived lands on the two places to start", () => {
  const titles = search("paisa nahi aaya").map((r) => r.title);
  assert.ok(
    titles.some((t) => /still waiting/i.test(t)),
    "a pending claim is the first thing to check",
  );
  assert.ok(
    titles.some((t) => /reason a claim is rejected/i.test(t)),
    "and a failed one is the second",
  );
});

test("a named problem reaches its own page rather than the triage", () => {
  assert.match(search("naam galat hai")[0].title, /name is spelled differently/i);
  assert.match(search("company band ho gayi")[0].title, /employer has closed/i);
  assert.match(search("naukri chhod di")[0].title, /exit/i);
  assert.match(search("pf nikalna hai")[0].title, /file a claim/i);
});

test("the same sentence works in Devanagari", () => {
  assert.match(search("नाम गलत है")[0].title, /name is spelled differently/i);
  assert.match(search("कंपनी बंद हो गई")[0].title, /employer has closed/i);
});

test("the other scripts reach the page too", () => {
  // Bengali, Tamil, Telugu, Kannada, Gujarati, Marathi. Shallower than
  // Hindi on purpose, but a member who types the commonest sentence in
  // their own script should not hit a wall.
  for (const q of [
    "টাকা আসেনি",
    "பணம் வரவில்லை",
    "డబ్బు రాలేదు",
    "ಹಣ ಬಂದಿಲ್ಲ",
    "પૈસા આવ્યા નથી",
    "नाव चुकीचे",
  ]) {
    assert.ok(search(q).length > 0, `"${q}" returns nothing`);
  }
});

/* ------------------------------------------------------------------
   The refusal to diagnose.
   ------------------------------------------------------------------ */

test("a symptom is reported as a symptom, not answered as a diagnosis", () => {
  const { reading } = interpret("paisa nahi aaya");
  assert.ok(
    reading.ambiguity,
    "money not arriving has several causes and the member should be told so",
  );
  assert.match(reading.ambiguity!, /several/i);
});

test("a member who has already named the cause is not told it is ambiguous", () => {
  // "my money hasn't come, the name is wrong" is not an open question.
  const { reading } = interpret("paisa nahi aaya naam galat");
  assert.equal(
    reading.ambiguity,
    undefined,
    "they told us which cause it is; do not hand them the triage",
  );
});

test("a specific query carries no ambiguity note", () => {
  for (const q of ["naam galat hai", "company band ho gayi", "pension"]) {
    assert.equal(interpret(q).reading.ambiguity, undefined, q);
  }
});

test("the more specific reading is preferred over the vaguer one", () => {
  const { reading } = interpret("naam galat hai");
  assert.ok(reading.matched.length > 0);
  assert.equal(
    reading.matched[0].when.length >= 2,
    true,
    "two matched words beat one",
  );
});

/* ------------------------------------------------------------------
   Not breaking what already worked.
   ------------------------------------------------------------------ */

test("nonsense still returns nothing rather than something", () => {
  // The whole product argues that an empty answer beats a confident
  // wrong one. Expanding queries must not soften that.
  for (const q of ["asdfgh", "zzzzzz qqqq", "xyzzy plugh"]) {
    assert.equal(search(q).length, 0, `"${q}" invented a result`);
  }
});

test("ordinary English queries are unaffected", () => {
  assert.match(search("exit date")[0].title, /exit/i);
  assert.match(search("rti")[0].title, /rti/i);
  assert.ok(search("nomination").length > 0);
  assert.ok(search("bank account not seeded").length > 0);
});

test("a query the phrasebook does not recognise expands to nothing", () => {
  const { reading } = interpret("deficiency memo");
  assert.deepEqual(reading.expansion, []);
  assert.deepEqual(reading.matched, []);
});

/* ------------------------------------------------------------------
   Spelling.
   ------------------------------------------------------------------ */

test("the four ways of typing 'nahi' are one word", () => {
  for (const form of ["nahi", "nahin", "nhi", "nai"]) {
    assert.equal(canonical(form), "nahi", form);
  }
});

test("emphasis typed on a phone keyboard still resolves", () => {
  assert.equal(canonical("nahiii"), "nahi");
  assert.equal(canonical("paisaaa"), "paisa");
});

test("an unknown word is left exactly as it was", () => {
  assert.equal(canonical("deficiency"), "deficiency");
  assert.equal(canonical("Aadhaar"), "aadhaar");
});

test("no two canonical forms claim the same typed word", () => {
  // A word mapped twice would resolve to whichever happened to be
  // registered last, which is a silent and very confusing bug.
  const seen = new Map<string, string>();
  for (const [canon, forms] of Object.entries(VARIANTS)) {
    for (const form of forms) {
      const already = seen.get(form);
      assert.equal(
        already ?? canon,
        canon,
        `"${form}" is claimed by both ${already} and ${canon}`,
      );
      seen.set(form, canon);
    }
  }
});

/* ------------------------------------------------------------------
   Integrity of the book itself.
   ------------------------------------------------------------------ */

test("every phrase actually retrieves something", () => {
  // A phrase whose vocabulary matches nothing in the index is a
  // sentence somebody will type that still returns an empty page.
  for (const phrase of PHRASES) {
    const results = search(phrase.means.join(" "));
    assert.ok(
      results.length > 0,
      `phrase "${phrase.id}" expands to vocabulary the index does not hold`,
    );
  }
});

test("every ambiguous phrase says so in words a member would use", () => {
  for (const phrase of PHRASES) {
    if (!phrase.ambiguous) continue;
    assert.ok(phrase.note && phrase.note.length > 40, `${phrase.id} has no note`);
    assert.ok(
      !/rejection reason|index|taxonomy/i.test(phrase.note!),
      `${phrase.id} explains itself in the vocabulary of the site, not the member`,
    );
  }
});

test("phrase ids are unique and every script phrase points at a real one", () => {
  const ids = PHRASES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate phrase id");

  for (const sp of SCRIPT_PHRASES) {
    assert.ok(
      phraseById(sp.like),
      `"${sp.says}" points at "${sp.like}", which does not exist`,
    );
  }
});

test("every phrase requires at least one word and means something", () => {
  for (const p of PHRASES) {
    assert.ok(p.when.length >= 1, `${p.id} fires on nothing`);
    assert.ok(p.means.length >= 2, `${p.id} translates to almost nothing`);
  }
});

test("reading a query never returns duplicate vocabulary", () => {
  const { expansion } = read("paisa nahi aaya paisa nahi mila");
  assert.equal(new Set(expansion).size, expansion.length);
});
