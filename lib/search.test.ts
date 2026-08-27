import assert from "node:assert/strict";
import test from "node:test";

import { search, INDEX, COMMON, KIND_LABEL } from "./search.ts";

/* The point of this index is that a member should not have to know
   which compartment their question belongs to. So the tests are
   written the way people actually type — half a word, the wrong
   number, a plain description of what happened — rather than the way
   the data is labelled. */

const titles = (q: string) => search(q).map((r) => r.title);
const kinds = (q: string) => search(q).map((r) => r.kind);

test("the words on the screen find the reason", () => {
  const found = search("name not matching aadhaar");
  assert.ok(found.length > 0);
  assert.equal(found[0].kind, "reason");
  assert.match(found[0].href, /^\/why\//);
});

test("a plain description of the situation finds the right page", () => {
  const cases: Array<[string, string]> = [
    ["someone asked me to pay", "/safety/"],
    ["husband died", "/after-a-death/"],
    ["money not received", "/still-waiting/"],
  ];

  for (const [query, href] of cases) {
    const hrefs = search(query).map((r) => r.href);
    assert.ok(
      hrefs.includes(href),
      `"${query}" should reach ${href}, got ${hrefs.slice(0, 3).join(", ")}`,
    );
  }
});

test("a half-typed word still completes", () => {
  const partial = titles("deficien");
  const whole = titles("deficiency");
  assert.ok(partial.length > 0, "a partial word must return something");
  assert.ok(
    partial.some((t) => whole.includes(t)),
    "the partial and the whole word should agree on at least one result",
  );
});

test("a word typed with an extra ending still matches", () => {
  assert.ok(search("nominations").length > 0);
});

test("an alias nobody would guess from the title still works", () => {
  // "returned incomplete" appears in no title on the site.
  const found = search("returned incomplete");
  assert.ok(found.length > 0);
  assert.ok(
    !found[0].title.toLowerCase().includes("returned incomplete"),
    "this is meant to be an alias hit, not a title hit",
  );
});

test("everything is reachable from one box", () => {
  const seen = new Set(
    [
      ...kinds("rejected"),
      ...kinds("deficiency memo"),
      ...kinds("passbook"),
      ...kinds("rti application"),
      ...kinds("bangalore office"),
      ...kinds("how long does settlement take"),
      ...kinds("scam"),
    ].map(String),
  );

  for (const kind of Object.keys(KIND_LABEL)) {
    assert.ok(seen.has(kind), `nothing of kind "${kind}" was reachable`);
  }
});

test("nonsense returns nothing rather than something", () => {
  for (const q of ["qzxwv", "asdfghjkl", "zzzzzz plimth"]) {
    assert.equal(search(q).length, 0, `"${q}" should return nothing`);
  }
});

test("a query of nothing but filler does not return the whole index", () => {
  const found = search("my epf claim");
  assert.ok(
    found.length < INDEX.length / 2,
    `filler words returned ${found.length} of ${INDEX.length} entries`,
  );
});

test("one or zero characters is not a search", () => {
  assert.equal(search("").length, 0);
  assert.equal(search("a").length, 0);
});

test("results come back best first", () => {
  const scores = search("aadhaar name mismatch").map((r) => r.score);
  const sorted = [...scores].sort((a, b) => b - a);
  assert.deepEqual(scores, sorted);
});

test("every suggested query actually returns something", () => {
  for (const q of COMMON) {
    assert.ok(search(q).length > 0, `suggested query "${q}" found nothing`);
  }
});

test("the index is well formed", () => {
  assert.ok(INDEX.length > 60, `index is only ${INDEX.length} entries`);
  assert.equal(new Set(INDEX.map((i) => i.id)).size, INDEX.length, "ids unique");

  for (const item of INDEX) {
    assert.ok(item.title.trim().length > 0, `${item.id} has no title`);
    assert.ok(item.snippet.trim().length > 0, `${item.id} has no snippet`);
    assert.match(item.href, /^\//, `${item.id} href must be site-relative`);
    assert.match(item.href, /\/$/, `${item.id} href must have a trailing slash`);
    assert.ok(item.haystack.length > 0, `${item.id} was never indexed`);
    assert.ok(
      item.haystack === item.haystack.toLowerCase(),
      `${item.id} haystack was not normalised`,
    );
  }
});

test("a result never points at a portal path without an account", () => {
  for (const item of INDEX) {
    if (item.href.startsWith("/portal/")) {
      assert.match(
        item.href,
        /^\/portal\/99\d{10}\//,
        `${item.id} points into the portal without a demonstration UAN`,
      );
    }
  }
});

/* Every href is resolved against the actual route tree on disk.
 *
 * This is here because of a real bug rather than as a precaution. The
 * knowledge entries store a path relative to a member's portal —
 * "/claims", not "/portal/<uan>/claims" — because their other consumer
 * supplies the UAN. Using them raw produced results linking to
 * "/file/" and "/claims/", which are not routes and went nowhere. Both
 * still passed a shape check, because both are perfectly well-formed
 * strings.
 *
 * Reading app/ means renaming or deleting a route breaks this test
 * rather than quietly breaking the search. */
test("every href resolves to a page that exists", async () => {
  const { readdirSync, existsSync } = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");

  const app = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "app",
  );

  const resolves = (href: string) => {
    let dir = app;
    for (const segment of href.split("/").filter(Boolean)) {
      const literal = path.join(dir, segment);
      if (existsSync(literal)) {
        dir = literal;
        continue;
      }
      // A value standing in for a dynamic segment, like a UAN or an id.
      const dynamic = readdirSync(dir).find(
        (entry) => entry.startsWith("[") && entry.endsWith("]"),
      );
      if (!dynamic) return false;
      dir = path.join(dir, dynamic);
    }
    return existsSync(path.join(dir, "page.tsx"));
  };

  for (const item of INDEX) {
    assert.ok(resolves(item.href), `${item.id} links to ${item.href}, which is not a route`);
  }
});
