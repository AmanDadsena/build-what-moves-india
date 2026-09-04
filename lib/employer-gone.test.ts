import assert from "node:assert/strict";
import test from "node:test";

import {
  ROUTES,
  SITUATIONS,
  ATTESTERS,
  blockedReasons,
  needsEmployer,
  routesFor,
  routeById,
  DEPENDENCY_LABEL,
} from "./employer-gone.ts";
import { REJECTIONS } from "./rejections.ts";

/* The premise of this whole page is a count taken from the knowledge
   base rather than from memory. If a rejection reason is ever edited
   so that it no longer needs the employer, the page should stop
   claiming it does — so the claim is computed and these pin it. */

test("the reasons that need an employer are the ones with an employer step", () => {
  const blocked = blockedReasons();

  assert.ok(blocked.length > 0, "something must be blocked or the page is moot");
  for (const r of blocked) {
    assert.ok(
      r.fixSteps.some((s) => s.actor === "employer"),
      `${r.id} is listed as blocked but has no employer step`,
    );
  }
  for (const r of REJECTIONS) {
    assert.equal(
      blocked.includes(r),
      needsEmployer(r),
      `${r.id} disagrees with itself about needing an employer`,
    );
  }
});

test("it is a majority of the knowledge base, which is the point", () => {
  // Not pinned to an exact number — that would break every time a
  // reason is added. Pinned to the claim the page actually makes.
  assert.ok(
    blockedReasons().length > REJECTIONS.length / 2,
    "the page says most reasons are affected; check that before publishing it",
  );
});

test("every reason with an employer step is offered a way round it", () => {
  for (const r of blockedReasons()) {
    const routes = routesFor(r.id);
    assert.ok(routes.length >= 2, `${r.id} is offered too little`);
    for (const route of routes) {
      assert.ok(route, `${r.id} maps to a route that does not exist`);
    }
  }
});

test("every reason is offered at least one route that binds", () => {
  for (const r of blockedReasons()) {
    assert.ok(
      routesFor(r.id).some((route) => route.dependency === "statutory"),
      `${r.id} is left with nothing enforceable`,
    );
  }
});

test("a reason nobody mapped still gets the general routes", () => {
  const routes = routesFor("a-reason-that-does-not-exist");
  assert.ok(routes.length >= 3);
  assert.ok(routes.every(Boolean), "the fallback must not contain holes");
});

test("every route names its limit", () => {
  // The product's whole argument is that an unqualified promise about
  // somebody's money is worse than silence. A route with no stated
  // limit is that promise.
  for (const route of ROUTES) {
    assert.ok(route.limit.length > 30, `${route.id} has no honest limit`);
    assert.ok(route.steps.length >= 3, `${route.id} is not actionable`);
    assert.ok(route.situations.length >= 1, `${route.id} applies to nobody`);
  }
});

test("exactly one route carries a statutory deadline, and it is the RTI", () => {
  const binding = ROUTES.filter((r) => r.dependency === "statutory");
  assert.equal(binding.length, 1);
  assert.equal(binding[0].id, "rti-establishment");
  assert.equal(binding[0].provenance, "statutory");
});

test("the routes that need nobody are offered before the ones that do", () => {
  const rank = { nobody: 0, "third-party": 1, officer: 2, statutory: 3 };
  const order = ROUTES.map((r) => rank[r.dependency]);
  const sorted = [...order].sort((a, b) => a - b);
  assert.deepEqual(
    order,
    sorted,
    "somebody chasing a signature should meet the routes needing none first",
  );
});

test("every route's onward link points at a page that exists", () => {
  const known = new Set<string>([
    "/still-waiting/",
    ...REJECTIONS.map((r) => `/why/${r.id}/`),
  ]);
  for (const route of ROUTES) {
    if (!route.link) continue;
    assert.ok(
      known.has(route.link.href),
      `${route.id} links to ${route.link.href}, which is not a page`,
    );
  }
});

test("every situation can be established by something, not just described", () => {
  for (const s of SITUATIONS) {
    assert.ok(
      s.establishBy.length >= 3,
      `${s.id} tells a member what they are in but not how to show it`,
    );
  }
});

test("the attesters list is ordered by how far somebody has to walk", () => {
  const rank = { easy: 0, moderate: 1, hard: 2 };
  const order = ATTESTERS.map((a) => rank[a.reach]);
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.ok(
    ATTESTERS.filter((a) => a.reach === "easy").length >= 3,
    "a list whose reachable options are buried is a list nobody uses",
  );
});

test("every dependency used by a route has a label to render", () => {
  for (const route of ROUTES) {
    assert.ok(
      DEPENDENCY_LABEL[route.dependency],
      `${route.id} has a dependency with no label`,
    );
  }
});

test("routeById finds what routesFor returns", () => {
  for (const r of blockedReasons()) {
    for (const route of routesFor(r.id)) {
      assert.equal(routeById(route.id), route);
    }
  }
  assert.equal(routeById("nope"), undefined);
});
