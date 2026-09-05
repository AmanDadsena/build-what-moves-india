# EPF Member Portal — a redesign concept

A redesign of India's provident fund member portal, built around the question
people actually arrive with: **why has my money not come, and what do I do
about it.**

> **This is an independent hackathon prototype.** It is not an EPFO product, is
> not affiliated with or endorsed by the Employees' Provident Fund Organisation
> or any government body, uses no government logo or emblem, and connects to no
> live government system. Every member, balance and file noting in it is
> invented. Never enter a real UAN, password or Aadhaar number.

---

## The problem

About **174 lakh** provident fund claims were rejected in a single year — a
little over one in five of everything filed. Almost every one ended with a line
of text like this:

```
Claim rejected: Demographic discrepancy in EPFO portal
```

That sentence names no field, no desk, no next step, and no deadline. A member
reading it cannot tell whether the problem is theirs to fix, their employer's,
or the office's — which is the difference between an afternoon and four months.

The most common failure here is not technical. It is that the system speaks in
a register its users do not, and then treats the resulting confusion as the
user's problem.

## What this does about it

**Decodes the remark.** Fifteen documented rejection reasons, each mapped to
what actually went wrong in the file, whose action is required, the steps in
order, and how long each one really takes. Paste the exact words you were shown
and it finds yours by token overlap, returning a confidence rather than
presenting a guess as a finding.

**Publishes the answers.** Fifteen public pages under `/why`, one per reason,
titled with the remark itself and marked up as structured question-and-answer.
Nobody searches for a provident fund portal; they search for the sentence that
blocked their money. Those pages exist to be found.

**Shows the file.** A reconstruction of the four-desk note sheet a claim passes
through, so a member can see where the twenty-day settlement count was restarted
— and drafts the RTI application that compels disclosure of their real one.

**Understands the sentence people actually type.** This site's own headline
says the question members arrive with is *why has my money not come*. Typing
exactly that, in the words most of the country would use, returned nothing:
`paisa nahi aaya`, `claim reject ho gaya`, `मेरा पैसा नहीं आया` — all empty.
Which is this product committing the failure it exists to argue against, one
layer down: EPFO writes in the register of the office, and the index was
written in the register of the index. `lib/phrasebook.ts` closes it with an
explicit, testable table — 202 spelling variants, because romanised Hindi has
no orthography and "nahi", "nahin", "nhi" and "nai" are one word typed by four
people — and 23 phrases mapping a symptom onto the vocabulary the index uses
for its causes. What it refuses to do is diagnose: money not arriving has
several causes, so the results page says so before the list and offers the
triage rather than presenting the best-scoring guess as an answer.

**Answers the question the instructions assume away.** Nine of the fifteen
rejection reasons contain a step only the establishment can perform — approve
the KYC, mark the exit date, countersign the declaration. When the employer has
closed, refuses, or cannot be found, every one of those is a wall, and the
member is usually told the matter ends there. It does not. What an employer
attests, they already filed with EPFO every month in the electronic return, so
the office is holding the proof; and of the routes round it, three need nobody's
agreement at all. `/employer-gone` sets them out, and the question is raised
inline on every rejection page that needs it rather than being left to be found.

**Keeps the evidence.** Every escalation eventually asks a member to establish
that they asked first, and nothing in the real portal records that — no notes
field, no call log, nowhere to put the reference number a helpline reads out
once. So a case now carries a dated record of what was actually done, which
exports as a chronology to paste under a grievance or an RTI. It travels in the
handover link with everything else, because losing it means losing the strongest
part of a case.

**Prices the routes in the currency that matters.** Every option in this domain
is measured in days, because days are what it costs the office. What it costs
the member is a day's wages — and once that is counted, the advice given most
freely turns out to be the most expensive thing on the list, while the one
instrument with an enforceable deadline costs ten rupees and needs no travel.
`/what-it-costs` reorders them against a wage the member enters, which stays on
their device.

**Separates the clocks that bind from the ones that do not.** The twenty-day
settlement commitment restarts every time a desk returns a file, so it can be
exceeded indefinitely without ever being formally breached. An RTI reply is due
in thirty days, and silence past that is a deemed refusal carrying a penalty of
₹250 a day on the officer personally. Teaching the difference is the point of
the product; everything else is scaffolding around it.

**Accompanies, rather than only explaining.** A per-claim plan whose dates
reschedule from what was actually done, exportable as a calendar file so the
deadlines live on the member's phone rather than on this site.

**Checks the arithmetic.** Any month of the passbook recomputed from the
statutory rules — including the ₹15,000 ceiling that quietly freezes the pension
share of an employer's contribution while the salary keeps rising. Most members
discover that at fifty-eight.

**Serves the people the portal forgets.** A player that reads a whole page in
order and marks the block it has reached, so somebody who reads slowly can
follow along — which is the half of read-aloud a phone's own text-to-speech
cannot do. A one-page printable case summary written to be handed to whoever is
helping, a fraud checker for the calls a stuck member inevitably receives, and a
page for families after a death — where three separate entitlements are owed and most
families claim one.

## Running it

```bash
npm install
npm run dev
```

Sign in from `/login` with any of the three demonstration accounts listed on
that page. There is no real authentication: the form is decorative and nothing
you type is transmitted or stored.

```bash
npm test          # 202 tests, no framework — node --test on type-stripped TS
npm run build     # static export to out/
npm run audit     # resolve every link and asset in out/ against what was built
```

The audit exists because a static export fails quietly: nothing errors
when a page links to a route that no longer exists, so the dead href is
simply written to disk and stays there until somebody clicks it.

## How it is built

**Next.js 16, React 19, Tailwind v4, static export.** Every route is
pre-rendered to HTML at build time. The knowledge base, the mock cases and the
document templates are all compiled in and nothing is fetched at request time,
so there is no server to cold-start and no function to invoke. That was a
deliberate choice for an audience on slow connections rather than a shortcut.

**No language model runs at request time.** The assistant and the search
retrieve passages written in advance and cite their source. They cannot compose
a new answer, which is why they say they hold nothing rather than produce
something plausible about a statutory deadline. On a page about somebody's own
money, an improvised answer is worse than silence.

**Offline and installable.** A service worker with three strategies chosen per
request type: cache-first for hashed build assets, stale-while-revalidate for
images, and network-first for anything a member might act on — the cache is a
floor, never a shortcut, because showing somebody a stale claim status because
it was faster would be a bad failure.

**Accessibility from inside the design system, not bolted on.** Text scaling,
high contrast, Atkinson Hyperlegible, looser leading, letter spacing, link
highlighting and plain backgrounds are all data attributes on `<html>`, and
every surface reads its values from tokens — so turning any of them on changes
the tables, the tags and the note sheet too, not only the paragraphs.

**Illustrations generated, then constrained.** Locked to the palette and
prompted to contain no lettering, so nothing on screen becomes untranslatable,
unreadable to a screen reader, or blurry when the page is enlarged. Sources are
processed by `scripts/build-images.mjs` — 32 MB of originals down to 485 KB
shipped. None carries a government emblem.

## What is real and what is not

Every claim in the interface carries a provenance tag, and `/how-real` explains
each one line by line. In short:

| Tag | Means |
| --- | --- |
| **Verified** | Published figures and documented procedure, sourced |
| **Statute** | Quoted from the Right to Information Act 2005 |
| **Reconstructed** | Modelled from documented workflow — the note sheets |
| **Mock** | Invented. Every member, balance and identifier |

Identifiers are deliberately malformed so they cannot collide with anything
real: UANs begin `99`, and no Aadhaar, PAN or bank account number appears
anywhere in this repository.

## What it cannot do

It cannot read a real EPFO record — a production version would need EPFO to
expose a member-consented read, which does not exist today. It cannot file
anything on a member's behalf. It cannot tell anyone what their own officers
wrote; it shows what a file of that type contains, and gives them the instrument
that compels disclosure of theirs. And it is not legal advice: a complicated
case deserves a person, not a template.

## Licence and use of names

"EPFO", "UAN", "EPS" and the form numbers are used descriptively, to identify
the public scheme this concept addresses. No affiliation is claimed or implied.
