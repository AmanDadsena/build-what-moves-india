import assert from "node:assert/strict";
import test from "node:test";

import { buildPlan, schedule, remaining, toCalendar } from "./plan.ts";
import { MEMBERS } from "./members.ts";
import { getRejection } from "./rejections.ts";
import type { Claim, RejectionReason } from "./types.ts";

/* A calendar file that fails to import is worse than no calendar
   button at all: the member believes their deadlines are safe and
   they are not. RFC 5545 breaks in three quiet ways — unescaped
   punctuation, over-long lines, and an all-day DTEND that is off by
   one — so all three are tested rather than assumed. */

function fixture(): { claim: Claim; rejection: RejectionReason } {
  const member = MEMBERS.find((m) =>
    m.claims.some((c) => c.status === "rejected"),
  )!;
  const claim = member.claims.find((c) => c.status === "rejected")!;
  const rejection = getRejection(claim.rejectionId!)!;
  return { claim, rejection };
}

const DAY = 86_400_000;
const START = new Date("2026-01-01T00:00:00Z");

test("the plan covers the fix steps and the escalations", () => {
  const { claim, rejection } = fixture();
  const items = buildPlan(claim, rejection);

  assert.equal(
    items.filter((i) => i.kind === "fix").length,
    rejection.fixSteps.length,
  );
  assert.ok(items.some((i) => i.id === "esc-rti"), "the RTI always applies");
  assert.ok(
    items.some((i) => i.binding === "hard"),
    "at least one statutory period must be present",
  );
  assert.equal(new Set(items.map((i) => i.id)).size, items.length, "ids unique");
});

test("dates chain forward, each starting where the last one ended", () => {
  const { claim, rejection } = fixture();
  const items = buildPlan(claim, rejection);
  const dated = schedule(items, {}, START);

  let expected = START.getTime();
  for (const [index, item] of dated.entries()) {
    expected += items[index].days * DAY;
    assert.equal(item.due.getTime(), expected);
  }
});

test("completing a step late slides everything after it", () => {
  const { claim, rejection } = fixture();
  const items = buildPlan(claim, rejection);

  const onTime = schedule(items, {}, START);
  const lateDay = new Date(onTime[0].due.getTime() + 30 * DAY);
  const slipped = schedule(items, { [items[0].id]: lateDay.toISOString() }, START);

  assert.equal(slipped[0].done, true);
  assert.equal(slipped[0].due.getTime(), lateDay.getTime());
  assert.equal(
    slipped[1].due.getTime() - onTime[1].due.getTime(),
    30 * DAY,
    "the next step should move by exactly the slip",
  );
});

test("the next item is the first one still outstanding", () => {
  const { claim, rejection } = fixture();
  const items = buildPlan(claim, rejection);

  const fresh = schedule(items, {}, START);
  assert.equal(fresh.filter((i) => i.next).length, 1);
  assert.equal(fresh[0].next, true);

  const started = schedule(
    items,
    { [items[0].id]: START.toISOString() },
    START,
  );
  assert.equal(started[0].next, false);
  assert.equal(started[1].next, true);
  assert.equal(remaining(started).length, items.length - 1);
});

test("a completed item is never marked overdue", () => {
  const { claim, rejection } = fixture();
  const items = buildPlan(claim, rejection);
  const long = new Date("2020-01-01T00:00:00Z");
  const dated = schedule(items, { [items[0].id]: long.toISOString() }, long);

  assert.equal(dated[0].done, true);
  assert.equal(dated[0].overdue, false);
  assert.ok(dated[1].overdue, "an unfinished item from 2020 is overdue");
});

test("the calendar file is structurally valid", () => {
  const { claim, rejection } = fixture();
  const dated = schedule(buildPlan(claim, rejection), {}, START);
  const ics = toCalendar(dated, claim, rejection);

  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.ok(ics.includes("VERSION:2.0"));

  const lines = ics.split("\r\n").filter(Boolean);
  assert.equal(
    lines.filter((l) => l === "BEGIN:VEVENT").length,
    dated.length,
    "one event per outstanding item",
  );
  assert.equal(
    lines.filter((l) => l === "BEGIN:VEVENT").length,
    lines.filter((l) => l === "END:VEVENT").length,
  );
  assert.equal(
    lines.filter((l) => l === "BEGIN:VALARM").length,
    lines.filter((l) => l === "END:VALARM").length,
  );

  // Every line must be CRLF-terminated, which the split above relies
  // on: a stray bare newline would show up as content inside a line.
  assert.ok(!lines.some((l) => l.includes("\n")));
});

test("no calendar line exceeds 75 octets", () => {
  const { claim, rejection } = fixture();
  const dated = schedule(buildPlan(claim, rejection), {}, START);
  const ics = toCalendar(dated, claim, rejection);

  const encoder = new TextEncoder();
  for (const line of ics.split("\r\n")) {
    assert.ok(
      encoder.encode(line).length <= 75,
      `line over the fold limit: ${line.slice(0, 40)}…`,
    );
  }
});

test("commas and semicolons in text are escaped, not left to break parsing", () => {
  const { claim, rejection } = fixture();
  const dated = schedule(buildPlan(claim, rejection), {}, START);
  const ics = toCalendar(dated, claim, rejection);

  const body = ics
    .split("\r\n")
    .filter((l) => l.startsWith("SUMMARY:") || l.startsWith("DESCRIPTION:"));

  assert.ok(body.length > 0);
  for (const line of body) {
    const value = line.slice(line.indexOf(":") + 1);
    // Every comma and semicolon in a text value must carry a
    // backslash; an unescaped one silently truncates the field.
    assert.ok(
      !/(^|[^\\]),/.test(value) || /\\,/.test(value),
      `unescaped comma in ${line.slice(0, 50)}`,
    );
  }
  assert.ok(!ics.includes("DESCRIPTION:\r\n"), "no empty descriptions");
});

test("an all-day event ends on the day after it starts", () => {
  const { claim, rejection } = fixture();
  const dated = schedule(buildPlan(claim, rejection), {}, START);
  const ics = toCalendar(dated, claim, rejection);

  const starts = [...ics.matchAll(/DTSTART;VALUE=DATE:(\d{8})/g)].map(
    (m) => m[1],
  );
  const ends = [...ics.matchAll(/DTEND;VALUE=DATE:(\d{8})/g)].map((m) => m[1]);
  assert.equal(starts.length, ends.length);

  const parse = (s: string) =>
    Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));

  for (const [i, from] of starts.entries()) {
    assert.equal(
      parse(ends[i]) - parse(from),
      DAY,
      "an all-day event's DTEND is exclusive",
    );
  }
});

test("completed items are left out of the calendar", () => {
  const { claim, rejection } = fixture();
  const items = buildPlan(claim, rejection);
  const dated = schedule(items, { [items[0].id]: START.toISOString() }, START);
  const ics = toCalendar(dated, claim, rejection);

  assert.equal(
    ics.split("BEGIN:VEVENT").length - 1,
    items.length - 1,
    "a step already done should not turn up as a reminder",
  );
});

test("the file does not present itself as an official communication", () => {
  const { claim, rejection } = fixture();
  const dated = schedule(buildPlan(claim, rejection), {}, START);
  const ics = toCalendar(dated, claim, rejection);
  assert.ok(ics.includes("Not an official EPFO communication"));
});
