import assert from "node:assert/strict";
import test from "node:test";

import { clock, detectLang, estimateSeconds } from "./readpage.ts";

/* harvest() needs a DOM and this suite runs in node with no
   framework, so it is exercised in the browser instead. What is
   testable here is the part that decides *how* something is read,
   which is where getting it wrong is least visible: a Hindi
   paragraph handed to an English voice is not silent, it is
   gibberish, and nobody reports it because the people it fails are
   the ones who cannot read the page to check. */

test("an English paragraph is read in English", () => {
  assert.equal(
    detectLang("Your claim was rejected because the name does not match."),
    "en",
  );
});

test("a Devanagari paragraph is read in Hindi", () => {
  assert.equal(
    detectLang("आपका दावा अस्वीकार कर दिया गया क्योंकि नाम मेल नहीं खाता।"),
    "hi",
  );
});

test("an English sentence with one Hindi term stays English", () => {
  // The site does this constantly — a glossary line, a form name.
  assert.equal(
    detectLang("The nomination form is called फॉर्म 2 in Hindi."),
    "en",
  );
});

test("a Hindi sentence carrying an English acronym stays Hindi", () => {
  assert.equal(
    detectLang("आपका UAN सक्रिय है और आधार से जुड़ा हुआ है।"),
    "hi",
  );
});

test("digits and punctuation alone do not decide a language", () => {
  assert.equal(detectLang("₹1,87,430"), "en");
  assert.equal(detectLang("— 2026 —"), "en");
  assert.equal(detectLang(""), "en");
});

test("a duration is estimated, not invented", () => {
  const blocks = [{ text: "one two three four five six seven eight nine ten" }];
  // Ten words at ~2.3 words a second.
  assert.equal(estimateSeconds(blocks), 4);
  assert.equal(estimateSeconds([]), 0);
});

test("the estimate adds up across blocks", () => {
  const one = { text: Array(115).fill("word").join(" ") };
  assert.equal(estimateSeconds([one]), 50);
  assert.equal(estimateSeconds([one, one]), 100);
});

test("a duration reads as a clock, and never as 5:7", () => {
  assert.equal(clock(0), "0:00");
  assert.equal(clock(9), "0:09");
  assert.equal(clock(65), "1:05");
  assert.equal(clock(307), "5:07");
  assert.equal(clock(600), "10:00");
});
