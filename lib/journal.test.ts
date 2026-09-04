import assert from "node:assert/strict";
import test from "node:test";

import {
  CHANNELS,
  COUNTERPARTIES,
  channelInfo,
  counterpartyLabel,
  formatDate,
  newId,
  parse,
  serialise,
  sort,
  storageKey,
  summarise,
  toChronology,
  toSubmission,
  type Entry,
} from "./journal.ts";
import { KEYS, PLAN_PREFIX } from "./casefile.ts";

const entry = (over: Partial<Entry> = {}): Entry => ({
  id: over.id ?? newId(),
  on: over.on ?? "2026-06-12",
  channel: over.channel ?? "call",
  with: over.with ?? "epfo",
  what: over.what ?? "Asked why the claim was returned.",
  reference: over.reference,
  outcome: over.outcome,
});

/* This log is the evidence a member takes to a grievance, an appeal
   or a forum. Losing it, mangling a date or dropping a reference
   number costs somebody the strongest part of their case, so the
   round trip and the ordering are pinned. */

test("a journal survives being written and read back", () => {
  const entries = [
    entry({ on: "2026-06-12", reference: "EPFO/CHN/44821" }),
    entry({ on: "2026-06-27", channel: "visit" }),
  ];
  const back = parse(serialise(entries));

  assert.equal(back.length, 2);
  assert.equal(back[0].on, "2026-06-27", "newest first");
  assert.equal(back[1].reference, "EPFO/CHN/44821");
});

test("nothing stored yields an empty journal, not an error", () => {
  assert.deepEqual(parse(null), []);
  assert.deepEqual(parse(""), []);
});

test("a corrupt value yields an empty journal rather than throwing", () => {
  // A page that will not render because the log is malformed is worse
  // than a page that renders without it.
  assert.deepEqual(parse("{ not json"), []);
  assert.deepEqual(parse('"a string"'), []);
  assert.deepEqual(parse("null"), []);
  assert.deepEqual(parse("42"), []);
});

test("rows that are not entries are dropped, and the rest survive", () => {
  const raw = JSON.stringify([
    { id: "a", on: "2026-01-01", channel: "call", with: "epfo", what: "kept" },
    { nonsense: true },
    null,
    "string",
    { id: "b", on: "2026-02-01", channel: "visit", with: "employer", what: "also kept" },
  ]);
  const back = parse(raw);
  assert.equal(back.length, 2);
  assert.deepEqual(
    back.map((e) => e.what),
    ["also kept", "kept"],
  );
});

test("entries read newest first, and same-day entries keep their order", () => {
  const a = entry({ id: "a", on: "2026-03-01", what: "first that day" });
  const b = entry({ id: "b", on: "2026-03-01", what: "second that day" });
  const c = entry({ id: "c", on: "2026-05-01" });

  const sorted = sort([a, b, c]);
  assert.deepEqual(
    sorted.map((e) => e.id),
    ["c", "a", "b"],
  );
});

test("the storage key follows the same rule the case backup sweeps for", () => {
  // casefile.collect() picks up the fixed KEYS plus anything under the
  // plan prefix. A journal key that matched neither would be silently
  // dropped from every backup and every handover link.
  const key = storageKey("CLM26061101");
  assert.ok(key.startsWith("rk-"), "house prefix");
  assert.ok(
    !(KEYS as readonly string[]).includes(key),
    "it is per-claim, so it cannot be a fixed key",
  );
  assert.notEqual(
    key.startsWith(PLAN_PREFIX),
    true,
    "and it must not collide with a plan's key",
  );
});

test("a summary counts the things an escalation turns on", () => {
  const entries = [
    entry({ on: "2026-01-10", with: "employer", channel: "email" }),
    entry({ on: "2026-02-14", with: "employer", channel: "letter", reference: "RPAD 4471" }),
    entry({ on: "2026-03-02", with: "epfo", channel: "call" }),
  ];
  const s = summarise(entries, new Date("2026-03-12T00:00:00"));

  assert.equal(s.entries, 3);
  assert.equal(s.withReference, 1);
  assert.equal(s.documented, 2, "email and letter leave the member holding something");
  assert.equal(s.employerApproaches, 2);
  assert.equal(s.first, "2026-01-10");
  assert.equal(s.last, "2026-03-02");
  assert.equal(s.sinceLast, 10);
  assert.equal(s.spanDays, 61);
});

test("an empty journal summarises to zero rather than to NaN", () => {
  const s = summarise([], new Date("2026-03-12T00:00:00"));
  assert.equal(s.entries, 0);
  assert.equal(s.spanDays, 0);
  assert.equal(s.sinceLast, 0);
  assert.equal(s.first, undefined);
});

test("a date that is not a date does not produce NaN days", () => {
  const s = summarise([entry({ on: "not-a-date" })], new Date("2026-03-12T00:00:00"));
  assert.equal(s.spanDays, 0);
  assert.ok(Number.isFinite(s.sinceLast));
  assert.equal(formatDate("not-a-date"), "not-a-date", "unparseable dates pass through");
});

test("the chronology reads forwards, because that is how it is submitted", () => {
  const text = toChronology([
    entry({ on: "2026-06-27", what: "Visited the office." , channel: "visit"}),
    entry({ on: "2026-06-12", what: "Called the helpline." }),
  ]);
  const lines = text.split("\n");

  assert.ok(lines[0].startsWith("1."));
  assert.ok(lines[0].includes("12 June 2026"), "oldest first in the output");
  assert.ok(lines[1].includes("27 June 2026"));
});

test("a reference number always survives into the chronology", () => {
  const text = toChronology([
    entry({ reference: "EPFO/CHN/44821", outcome: "Told to wait fifteen days." }),
  ]);
  assert.ok(text.includes("EPFO/CHN/44821"));
  assert.ok(text.includes("Told to wait fifteen days."));
});

test("blank optional fields do not leave empty labels behind", () => {
  const text = toChronology([entry({ reference: "   ", outcome: "" })]);
  assert.ok(!text.includes("Reference:"));
  assert.ok(!text.includes("Result:"));
});

test("an empty journal produces nothing to paste, not an empty heading", () => {
  assert.equal(toChronology([]), "");
  assert.equal(toSubmission([]), "");
});

test("a submission names the span, and the pattern where there is one", () => {
  const text = toSubmission([
    entry({ on: "2026-01-10", with: "employer" }),
    entry({ on: "2026-02-14", with: "employer" }),
    entry({ on: "2026-03-02", with: "epfo" }),
  ]);
  assert.ok(text.includes("3 entries"));
  assert.ok(text.includes("10 January 2026"));
  assert.ok(text.includes("2 March 2026"));
  assert.ok(
    text.includes("establishment was approached 2 times"),
    "the count an unresponsive-employer grievance turns on",
  );
});

test("one approach to an employer is not described as a pattern", () => {
  const text = toSubmission([entry({ with: "employer" })]);
  assert.ok(!text.includes("was approached"));
});

test("every channel says what to capture, and ids are unique", () => {
  const ids = CHANNELS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of CHANNELS) {
    assert.ok(c.capture.length > 30, `${c.id} does not say what to write down`);
  }
  assert.equal(channelInfo("visit").label, "Visit in person");
});

test("an unknown channel or counterparty degrades instead of crashing", () => {
  // Values can arrive from a restored backup written by an older build.
  assert.ok(channelInfo("nonsense" as never));
  assert.equal(counterpartyLabel("nonsense" as never), "Someone else");
});

test("every counterparty has a label", () => {
  for (const c of COUNTERPARTIES) {
    assert.ok(counterpartyLabel(c.id).length > 0);
  }
});

test("ids do not collide across a burst of entries", () => {
  const ids = new Set(Array.from({ length: 500 }, () => newId()));
  assert.equal(ids.size, 500);
});
