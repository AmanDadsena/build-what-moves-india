# Codex in this build

The hackathon requires Codex to be **meaningfully involved in the build**, and
the submission must explain how it contributed. This file is the working record.

**Rule: nothing enters the "Done" table until Codex has actually produced it.**
An overstated claim here is worse than a modest one — honesty is one of the six
judged criteria, and a specific small claim beats a vague large one.

Run these from the repo root (`reject-kyun/`) with `codex`.

---

## 1. The mismatch severity classifier ← start here

**File:** `lib/diff.ts` · **Why first:** it changes what the app tells people.

`classifyMismatch()` currently ships a placeholder that calls every non-trivial
difference "blocking". That is wrong often enough to matter — it sends people
into a three-week Joint Declaration for a difference EPFO would have normalised
anyway.

```
Read lib/diff.ts, especially the TODO block above classifyMismatch().

Implement classifyMismatch() so it returns a severity and a reason for
each of these real cases:

  "RAJESH KUMAR"       vs "Rajesh Kumar"       -> tolerated (case only)
  "RAJESH  KUMAR"      vs "RAJESH KUMAR"       -> tolerated (whitespace)
  "RAJESH KUMAR SINGH" vs "RAJESH KUMAR"       -> blocking  (dropped name part)
  "R KUMAR"            vs "RAJESH KUMAR"       -> probable  (expanded initial)
  "KUMAR RAJESH"       vs "RAJESH KUMAR"       -> blocking  (order swapped)
  "MOHD ASLAM"         vs "MOHAMMED ASLAM"     -> probable  (transliteration)
  "RAJESH KUMER"       vs "RAJESH KUMAR"       -> blocking  (single-char typo)

Handle dateOfBirth and ifsc separately from name fields: any difference
in those two is blocking, since neither has a tolerated variant form.

Use the existing helpers: normalizeName, tokensOf, sameTransliteration,
isInitialOf. Do not change their signatures.

Write the reason strings addressed to the member, in plain English,
active voice, no apology and no hedging. A reason should say what
differs and whether it is worth acting on.

Then add lib/diff.test.ts with a test per row of that table.
```

## 2. Tests for the character diff

**File:** `lib/diff.ts` → new `lib/diff.test.ts`

`diffChars` is an LCS implementation with no tests. It draws the highlight a
member acts on, so a wrong segment boundary is a wrong instruction.

```
Read diffChars() in lib/diff.ts. Add tests covering:
identical strings, pure insertion at start/middle/end, pure deletion,
substitution mid-string, empty string on either side, strings that
share no characters, and Devanagari input (multi-byte).

Assert that concatenating segments with state "same" and "removed"
reproduces the left input exactly, and "same" plus "added" reproduces
the right input exactly. That invariant is what the UI relies on.

Set up whatever test runner the project needs and wire an npm script.
```

## 3. Widen the rejection knowledge base

**File:** `lib/rejections.ts`

Ten reasons are covered. Each new entry must follow the existing `RejectionReason`
shape exactly.

```
Read lib/rejections.ts and lib/types.ts.

Add entries for these EPFO rejection reasons, following the exact
shape of the existing ones:

  - Form 15G/15H not submitted where TDS applies
  - Gender mismatch against Aadhaar
  - Nominee not registered (blocks death claims)
  - EPS-95 pension claim where service is under ten years
  - International worker / Certificate of Coverage cases

For each: verbatim remark strings as members actually see them, a
plain-English explanation, Hindi, the mechanism underneath, the desk
that raises it, who must act, fields to compare, ordered fix steps
with realistic day counts, escalation route, and documents.

Match the register of the existing entries: explain the mechanism,
never blame the member, and say plainly whose action is required.
```

## 4. Hindi review pass

**Files:** `lib/rejections.ts` (every `plainHi`, `titleHi`, `instructionHi`)

```
Review every Hindi string in lib/rejections.ts.

These are written for a member who may have limited digital experience
and is already stressed about money they cannot access. The failure
mode to hunt for is Hindi that reads like a government circular —
that bureaucratic register is exactly what this product exists to
escape.

Rewrite anything that reads as officialese into plain spoken Hindi.
Keep technical terms (UAN, KYC, Aadhaar, Form 19) in their familiar
form rather than translating them. Do not change meaning or the
English strings.
```

## 5. Accessibility and slow-connection audit

The brief names "mobile devices, slower connections or limited digital
experience" as a judged constraint.

```
Audit this Next.js app for accessibility and mobile:

1. Keyboard: the tab strips in components/CaseWorkspace.tsx and
   components/PortalShell.tsx must be fully operable by keyboard with
   visible focus. Check roles and aria-selected are correct.
2. Contrast: verify the four provenance tag colours in
   components/Provenance.tsx meet WCAG AA against --color-paper
   (#e9ebe4), defined in app/globals.css.
3. Tables: passbook and records tables must scroll horizontally
   without the page body scrolling sideways on a 360px viewport.
4. Report the total transferred bytes of the landing page and the
   portal overview, and flag anything that could be cut.

Fix what you find. Do not restyle anything that already passes.
```

## 6. Per-page titles in the portal

**Files:** `app/portal/[uan]/**`

```
Every portal page currently inherits the root <title>. Add
generateMetadata to the overview, passbook, claims and records pages
so each has a distinct title including the member's name, matching
the pattern already used in
app/portal/[uan]/claims/[claimId]/page.tsx.
```

---

## Done

| What | Where | Verified by |
|---|---|---|
| Implemented `classifyMismatch()` — the severity engine that decides whether a record difference is blocking, probable or tolerated, and writes the reason shown to the member | `lib/diff.ts` | 9 passing tests; confirmed in the running app — `MOHD`/`MOHAMMED` now correctly reads *probable* instead of *blocking*, and a dropped name part reads *blocking* with a specific instruction |
| Wrote the test suite for the classifier, covering all seven record-divergence cases plus date-of-birth and IFSC | `lib/diff.test.ts` | `npm test` — 9 tests, 9 passing, using Node's built-in runner with no added dependencies |

**What Codex changed about the product, not just the code:** before this, every
non-identical field was reported as "blocking" with the reason "These two
records do not hold the same value." A member with a transliteration variant
would have been sent into a three-week Joint Declaration they did not need.
Codex's classifier distinguishes the seven ways Indian records actually diverge
and ranks them, so the member fixes the field that matters.

---

## For the submission form

When asked how Codex contributed, answer from the Done table. Name the
functions and files, not "used Codex throughout".
