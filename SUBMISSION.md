# Submission pack

Everything the form asks for. Deadline **30 August 2026**.

---

## 1. Project summary (243 words — limit is 250)

> **EPF Member Portal — a redesign concept**
>
> In 2024–25, EPFO members filed 796 lakh claims. 174 lakh were rejected —
> about one in five. Each rejected member received one sanitised line:
> *"Claim rejected: Demographic discrepancy in EPFO portal."* It does not say
> which field failed, which record it was compared against, whose action is
> required, or what to do next.
>
> This is a redesign of the provident fund member portal built around that gap.
> Twelve working services — passbook, claims, KYC, nomination, transfer, exit
> marking, corrections, grievance, pension, life certificate, and a
> sourced-answer assistant.
>
> Three things the original cannot do.
>
> **Pre-flight.** Before you file, your record is run against every known
> rejection cause and you are shown which would fail, with the exact remark it
> would return. Submit stays disabled while a check fails.
>
> **Decode.** Paste the remark and we name the real cause, compare your
> Aadhaar, PAN and bank records character by character, and reconstruct the
> internal note sheet — every desk the file passed, and each point the 20-day
> clock silently restarted.
>
> **Escalate.** Every document drafted from your own case: Joint Declaration,
> employer letter, EPFiGMS, CPGRAMS, and the RTI under section 6(1) — the only
> route that legally compels an answer.
>
> Answers are retrieved from cited sources, never generated. A system that
> invents a statutory deadline is worse than one that stays silent.
>
> Independent prototype. No government system is contacted, no logo used, and
> every record is invented.

---

## 2. Video script — 2:00 maximum

Record at 1440×900, browser zoom 100%, **reader controls at default**. Clear
`localStorage` first so text size and contrast start normal.

Have these tabs pre-loaded so nothing waits on a network call:

1. `/`
2. `/portal/990012345678/`
3. `/portal/990012345678/claims/CLM26061101/`
4. `/portal/990012345678/file/`
5. `/portal/990012345678/ask/`
6. `/how-real/`

### Minute one — as a citizen

**0:00–0:10 · Landing hero**
> "Last year, EPFO members filed 796 lakh claims. 174 lakh were rejected —
> one in five. My uncle was one of them. This is the entire explanation he
> got."

*Point at the remark in the hero.*

**0:10–0:22 · Sign in → Overview**
> "So we rebuilt the portal. The first thing it says isn't a menu — it's that
> ₹1,87,430 is not coming to you, and here's the button that tells you why."

*Click **Find out why, and what to send**.*

**0:22–0:38 · Case file → Your records**
> "EPFO compared his name to his Aadhaar and said 'discrepancy'. It never said
> which character. We do."

*Let the highlighted **SINGH** sit on screen for two full seconds.*
> "One word. His Aadhaar has it. His PF record stops at Kumar."

**0:38–0:52 · The note sheet**
> "Behind that one line is a file he was never allowed to read. Five entries,
> four desks. And twice, a desk marked it incomplete — which restarts the
> twenty-day clock."

*Point at **← clock reset to zero here**.*
> "He waited forty-four days. EPFO counts twenty-three. The commitment was
> never formally missed."

**0:52–1:00 · Documents → RTI**
> "So we write the one letter that legally compels an answer — an RTI under
> section 6(1), asking for the noting on his own file. Thirty days, or it's a
> deemed refusal."

### Minute two — how it was built

**1:00–1:14 · File a claim**
> "The best version of this is not needing it. The office runs these checks
> when your claim arrives and tells you six weeks later. We moved them to
> before you file."

*Show two failing checks.*
> "Submit is disabled. The real portal would let you file this and reject it
> in six weeks."

**1:14–1:26 · Ask**
> "Answers are retrieved from cited sources, never generated. Every card names
> where it came from. A model that invents a deadline about your own money is
> worse than no answer — so this one can only repeat text it already holds."

**1:26–1:38 · Reader controls + mobile**
> "Built for who actually uses this: text size and high contrast, and it works
> on a cheap phone."

*Toggle high contrast. Resize to mobile.*

**1:38–1:50 · How real**
> "Every claim on screen is tagged — verified, statutory, reconstructed, or
> mock. The rejection remarks and the RTI sections are real. The members are
> invented. We touch no government system."

**1:50–2:00 · Codex + close**
> "Codex wrote the classifier that decides whether a record mismatch actually
> blocks a claim, plus its test suite — the difference between telling someone
> to file three weeks of paperwork and telling them not to bother. Forty-nine
> pages, thirteen services, sixteen tests. Thank you."

### Cuts if you run long

Drop 1:26–1:38 (reader controls) first, then shorten the note sheet to the
clock-reset line only. **Never cut the SINGH diff or the note sheet** — those
are the two moments nobody else has.

---

## 3. Form checklist

- [ ] **Live public URL** — claimed Vercel deployment, opens with no sign-in wall
- [ ] **Mock credentials** — `990012345678` / `demo1234` (also printed on the page)
- [ ] **Video** — under 2:00, public link (Loom, YouTube unlisted, Drive with link sharing)
- [ ] **Summary** — paste section 1 above
- [ ] **Partner email** — leave blank (solo entry)
- [ ] Open the live URL in a private window and click every nav item once

## 4. If asked how Codex contributed

Point at [CODEX.md](CODEX.md). Short version: Codex implemented
`classifyMismatch()` in `lib/diff.ts` — the function ranking whether a record
difference is blocking, probable or tolerated, which decides what every user is
told — wrote `lib/diff.test.ts` covering all seven divergence cases, added five
rejection reasons to the knowledge base, and did the tab-strip accessibility
work (roving tabindex, arrow-key navigation, ARIA wiring).
