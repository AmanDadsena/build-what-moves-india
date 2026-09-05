import assert from "node:assert/strict";
import test from "node:test";

import {
  LANGUAGES,
  UI,
  REJECTION_TITLES,
  titleAliases,
  languageFor,
  t,
} from "./i18n.ts";
import { REJECTIONS } from "./rejections.ts";

/* Translation tables rot silently: somebody adds a key, or a
   rejection, and one language quietly falls back to English forever
   without anything failing. These make that a test failure. */

test("every interface string exists in every language", () => {
  const codes = LANGUAGES.map((l) => l.code);
  for (const [key, dict] of Object.entries(UI)) {
    for (const code of codes) {
      assert.ok(
        dict[code] && dict[code].trim().length > 0,
        `UI."${key}" is missing ${code}`,
      );
    }
  }
});

test("no interface string is left as the English text in another language", () => {
  for (const [key, dict] of Object.entries(UI)) {
    for (const l of LANGUAGES) {
      if (l.code === "en") continue;
      assert.notEqual(
        dict[l.code],
        dict.en,
        `UI."${key}" in ${l.code} is still the English string`,
      );
    }
  }
});

test("every rejection has a translated title in every partial language", () => {
  const partial = LANGUAGES.filter((l) => !l.full).map((l) => l.code);
  for (const r of REJECTIONS) {
    const entry = REJECTION_TITLES[r.id];
    assert.ok(entry, `no translations at all for "${r.id}"`);
    for (const code of partial) {
      assert.ok(
        entry[code] && entry[code]!.trim().length > 0,
        `"${r.id}" is missing ${code}`,
      );
    }
  }
});

test("no translated title is left in Latin script", () => {
  for (const [id, entry] of Object.entries(REJECTION_TITLES)) {
    for (const [code, text] of Object.entries(entry)) {
      // Allow embedded Latin terms like PAN, UAN, TDS, KYC, EPS.
      const stripped = text!.replace(/\b(PAN|UAN|TDS|KYC|EPS|Certificate of Coverage)\b/g, "");
      assert.ok(
        /[^\u0000-\u024F]/.test(stripped),
        `"${id}" in ${code} looks like untranslated Latin text`,
      );
    }
  }
});

test("translated titles reach the search index as aliases", () => {
  for (const r of REJECTIONS) {
    const aliases = titleAliases(r.id);
    assert.ok(
      aliases.length >= LANGUAGES.filter((l) => !l.full).length,
      `"${r.id}" contributes only ${aliases.length} aliases`,
    );
  }
});

test("every language declares a valid BCP 47 tag for the speech APIs", () => {
  for (const l of LANGUAGES) {
    assert.match(l.tag, /^[a-z]{2}-[A-Z]{2}$/, `${l.code} has a bad tag`);
    assert.ok(l.native.trim().length > 0, `${l.code} has no native name`);
  }
  assert.equal(new Set(LANGUAGES.map((l) => l.code)).size, LANGUAGES.length);
});

test("an unknown language falls back to English rather than throwing", () => {
  assert.equal(languageFor("xx").code, "en");
  assert.equal(t("why", "en"), UI.why.en);
});

test("exactly the two languages with full prose are marked full", () => {
  const full = LANGUAGES.filter((l) => l.full).map((l) => l.code);
  assert.deepEqual(full, ["en", "hi"], "coverage claim must match reality");
});

/* The eight-language claim, checked against what is displayed rather
   than against what exists.

   The translated titles sat in this file for weeks feeding only the
   search index, so switching the site to Tamil produced a Tamil
   navigation above fifteen English cards — which looks like the
   switch worked right up to the point where it matters. These pin
   the coverage the interface now depends on. */

test("every rejection has a title in every language the site offers", () => {
  const optional = new Set(["en", "hi"]); // carried on the rejection itself
  for (const r of REJECTIONS) {
    const entry = REJECTION_TITLES[r.id];
    assert.ok(entry, `${r.id} has no translated titles at all`);
    for (const l of LANGUAGES) {
      if (optional.has(l.code)) continue;
      assert.ok(
        entry[l.code] && entry[l.code]!.trim().length > 0,
        `${r.id} has no ${l.english} title, so a member reading in ${l.english} sees English`,
      );
    }
  }
});

test("a translated title is not just the English one copied across", () => {
  for (const r of REJECTIONS) {
    const entry = REJECTION_TITLES[r.id] ?? {};
    for (const [code, text] of Object.entries(entry)) {
      assert.notEqual(
        text,
        r.title,
        `${r.id}/${code} is the English title wearing a language code`,
      );
    }
  }
});

test("no rejection is missing the Hindi pairing the cards rely on", () => {
  for (const r of REJECTIONS) {
    assert.ok(r.titleHi && r.titleHi.trim().length > 0, `${r.id} has no titleHi`);
  }
});
