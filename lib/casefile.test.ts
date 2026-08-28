import { test } from "node:test";
import assert from "node:assert/strict";
import {
  collect,
  restore,
  encode,
  decode,
  describe,
  plural,
  isBackup,
  wrap,
  PLAN_PREFIX,
  MAX_TOKEN,
} from "./casefile";

/* A Storage that behaves like the real one in the ways that matter:
   string values, an index, and the ability to throw. */
function fakeStorage(initial: Record<string, string> = {}, failing = false) {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (failing) throw new Error("quota");
      map.set(k, v);
    },
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    _map: map,
  } as unknown as Storage & { _map: Map<string, string> };
}

test("a case survives the round trip through a link", () => {
  const store = fakeStorage({
    "rk-lang": "ta",
    "rk-reader": '{"scale":"large","contrast":true}',
    [`${PLAN_PREFIX}CLM-2024-0091`]: '{"gather":true,"submit":false}',
  });

  const token = encode(collect(store));
  assert.ok(token, "a small case must encode");

  const back = decode(token);
  assert.deepEqual(back, {
    "rk-lang": "ta",
    "rk-reader": '{"scale":"large","contrast":true}',
    [`${PLAN_PREFIX}CLM-2024-0091`]: '{"gather":true,"submit":false}',
  });
});

test("non-Latin content survives, which base64 of a raw string would not", () => {
  /* The bug this guards against is real and silent: btoa() on a
     string containing anything above U+00FF throws, and the naive
     fix — escape()/unescape() — mangles it. A member reading in
     Gujarati must be able to hand their case on. */
  const store = fakeStorage({
    "rk-survivor-checklist": JSON.stringify({ note: "પાસબુક અને મૃત્યુ પ્રમાણપત્ર" }),
  });
  const token = encode(collect(store));
  assert.ok(token);
  assert.equal(
    decode(token)?.["rk-survivor-checklist"],
    JSON.stringify({ note: "પાસબુક અને મૃત્યુ પ્રમાણપત્ર" }),
  );
});

test("the token is URL-fragment safe", () => {
  const store = fakeStorage({ "rk-lang": "hi", "rk-reader": "{}" });
  const token = encode(collect(store))!;
  assert.match(token, /^[A-Za-z0-9_-]+$/);
});

test("a payload from somewhere else is refused rather than applied", () => {
  const hostile = btoa(JSON.stringify({ format: "someone-else", data: { "rk-lang": "hi" } }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  assert.equal(decode(hostile), null);
});

test("junk never throws, it returns nothing", () => {
  for (const junk of ["", "!!!!", "notbase64", "eyJhIjoxfQ", "a".repeat(20)]) {
    assert.equal(decode(junk), null, `decode(${JSON.stringify(junk)})`);
  }
});

test("keys this build does not own are dropped in transit", () => {
  const token = btoa(
    JSON.stringify(wrap({ "rk-lang": "hi", "evil-token": "x", "rk-plan-A": "{}" })),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  assert.deepEqual(decode(token), { "rk-lang": "hi", "rk-plan-A": "{}" });
});

test("an oversized payload is refused rather than truncated", () => {
  const store = fakeStorage({ "rk-reader": "x".repeat(MAX_TOKEN) });
  assert.equal(encode(collect(store)), null);
});

test("restore writes only what it recognises, and counts honestly", () => {
  const store = fakeStorage();
  const written = restore(store, {
    "rk-lang": "bn",
    "rk-plan-CLM-1": "{}",
    "some-other-app": "hello",
    "rk-reader": 42 as unknown as string,
  });

  assert.equal(written, 2);
  assert.equal(store.getItem("rk-lang"), "bn");
  assert.equal(store.getItem("some-other-app"), null);
  assert.equal(store.getItem("rk-reader"), null);
});

test("a storage that refuses to write does not throw, and reports zero", () => {
  assert.equal(restore(fakeStorage({}, true), { "rk-lang": "hi" }), 0);
});

test("collect ignores keys belonging to other software on the device", () => {
  const store = fakeStorage({
    "rk-lang": "mr",
    "ga-session": "abc",
    "rk-plan-CLM-9": "{}",
  });
  assert.deepEqual(Object.keys(collect(store)).sort(), ["rk-lang", "rk-plan-CLM-9"]);
});

test("what is in a payload can be described before it is loaded", () => {
  const d = describe({
    "rk-plan-A": "{}",
    "rk-plan-B": "{}",
    "rk-survivor-checklist": "{}",
    "rk-lang": "hi",
  });
  assert.deepEqual(d, { plans: 2, checklists: 1, settings: 1 });
});

test("counts are never described as “1 items”", () => {
  assert.equal(plural(1, "claim", "claims"), "1 claim");
  assert.equal(plural(0, "claim", "claims"), "0 claims");
  assert.equal(plural(2, "claim", "claims"), "2 claims");
});

test("isBackup rejects arrays and nulls posing as data", () => {
  assert.equal(isBackup(null), false);
  assert.equal(isBackup({ format: "reject-kyun/case-backup", data: [] }), false);
  assert.equal(isBackup({ format: "reject-kyun/case-backup", data: null }), false);
  assert.equal(isBackup(wrap({})), true);
});
