"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ATTESTERS,
  DEPENDENCY_LABEL,
  ROUTES,
  SITUATIONS,
  blockedReasons,
  type Situation,
} from "@/lib/employer-gone";
import { REJECTIONS } from "@/lib/rejections";
import { PageHero } from "@/components/PageHero";
import { Tag } from "@/components/Provenance";
import { ReadAloud } from "@/components/ReadAloud";
import { Disclose } from "@/components/Motion";

/* The page for the dead end.
 *
 * Nine of the fifteen documented rejection reasons contain a step
 * that belongs to the employer, and every one of those steps assumes
 * a company that still exists and still answers. This page is for the
 * members for whom that assumption is false, which until now this
 * site handled in a single line of an FAQ.
 *
 * It opens with the reframe rather than with a list, because the list
 * is not the useful part. What changes somebody's afternoon is being
 * told that the signature they have been chasing confirms a record
 * EPFO already holds — and then being shown which routes need nobody
 * at all.
 *
 * The situation picker is a filter and nothing more: it does not
 * score, decide or diagnose. Somebody whose employer has closed and
 * somebody whose employer is merely ignoring them are in genuinely
 * different procedural positions, and showing both sets of routes to
 * both people would bury the two or three that apply.
 */

const REACH_LABEL: Record<string, string> = {
  easy: "Usually reachable",
  moderate: "Takes a trip",
  hard: "Harder, occasionally the fastest",
};

export function EmployerGone() {
  const [situation, setSituation] = useState<Situation | null>(null);
  const blocked = blockedReasons();

  const shown = situation
    ? ROUTES.filter((r) => r.situations.includes(situation))
    : ROUTES;

  const chosen = SITUATIONS.find((s) => s.id === situation);

  return (
    <>
      <PageHero
        eyebrow="When there is no employer left to ask"
        provenance="verified"
        title="Everything they would sign, they already filed."
        titleHi="जो वे हस्ताक्षर करते, वह पहले ही जमा कर चुके हैं।"
        lede="Most of the instructions you have been given end with the words your employer. This page is for when there is nobody there — and it starts by pointing out that the office already holds what you are being sent to fetch."
      />

      <div className="shell py-10 sm:py-14 space-y-14 stagger">
        {/* ---- The reframe. The whole page turns on this. ---- */}
        <section className="shell-reading">
          <h2 className="eyebrow section-mark mb-4">
            What an attestation actually is
          </h2>
          <p className="lede measure mb-5">
            Every month your establishment filed an electronic return naming
            you, your wages and your contribution, and paid against it. That
            return is how the money in your passbook got there.
          </p>
          <p className="text-ink-soft leading-relaxed measure mb-5">
            So when a form asks the employer to attest that you worked there,
            on those wages, from that date — it is asking for a countersignature
            on a record EPFO is already holding, filed by the same employer,
            under their own digital signature, before anything went wrong.
          </p>
          <div className="border-l-4 border-noting bg-noting-wash/50 rounded-lg px-5 py-4">
            <p className="leading-relaxed measure">
              That changes the question. It is not{" "}
              <em>how do I find a company that no longer exists</em>. It is{" "}
              <em>how do I get the office to read its own file</em> — and that
              question has answers, several of which need nobody&rsquo;s
              agreement at all.
            </p>
          </div>

          <ReadAloud
            className="mt-5"
            en="An employer's attestation is not new information. Every month, the establishment filed an electronic return naming you, your wages and your contribution. EPFO already holds it. So the question is not how to find a company that no longer exists. It is how to get the office to read its own file."
            hi="नियोक्ता का प्रमाणन कोई नई जानकारी नहीं है। हर महीने प्रतिष्ठान ने आपका नाम, वेतन और अंशदान दर्ज करके रिटर्न भरा था। वह रिकॉर्ड ईपीएफओ के पास पहले से है। इसलिए सवाल यह नहीं है कि बंद हो चुकी कंपनी को कैसे खोजें, बल्कि यह कि कार्यालय अपनी ही फ़ाइल कैसे देखे।"
          />
        </section>

        {/* ---- How wide the problem is ---- */}
        <section className="shell-reading">
          <h2 className="eyebrow section-mark mb-4">
            How often this is the real blocker
          </h2>
          <div className="border border-rule-heavy bg-paper-raised rounded-xl overflow-hidden">
            <div className="px-6 py-6 border-b border-rule">
              <p className="figure text-4xl mb-1">
                {blocked.length} of {REJECTIONS.length}
              </p>
              <p className="text-sm text-ink-soft leading-relaxed measure">
                documented rejection reasons contain at least one step that
                only the establishment can perform. Read them with a working
                employer and they are ordinary instructions. Read them without
                one and they are a wall.
              </p>
            </div>
            <ul className="divide-y divide-rule">
              {blocked.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/why/${r.id}/`}
                    className="flex items-baseline gap-3 px-6 py-3 hover:bg-noting-wash/40 transition-colors"
                  >
                    <span className="text-sm font-semibold tracking-[-0.01em] min-w-0 flex-1">
                      {r.title}
                    </span>
                    <span className="text-xs text-ink-faint shrink-0">
                      {r.fixSteps.filter((s) => s.actor === "employer").length}{" "}
                      employer step
                      {r.fixSteps.filter((s) => s.actor === "employer")
                        .length === 1
                        ? ""
                        : "s"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Which of the three are you in ---- */}
        <section>
          <div className="shell-reading">
            <h2 className="eyebrow section-mark mb-4">
              Which of these is you?
            </h2>
            <p className="text-ink-soft leading-relaxed measure mb-6">
              They are not the same problem. What you can establish, and which
              routes open, differ for each — so it is worth being precise before
              reading further.
            </p>
          </div>

          <div
            role="group"
            aria-label="Choose your situation"
            className="grid gap-4 lg:grid-cols-3"
          >
            {SITUATIONS.map((s) => {
              const active = situation === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSituation(active ? null : s.id)}
                  className={`press text-left border-2 rounded-xl px-5 py-5 transition-colors ${
                    active
                      ? "border-noting bg-noting-wash/60"
                      : "border-rule bg-paper-raised hover:border-rule-heavy"
                  }`}
                >
                  <span className="block display-3 mb-2">{s.label}</span>
                  <span className="block text-sm text-ink-soft leading-relaxed">
                    {s.recognise}
                  </span>
                  <span
                    className={`block text-xs mt-3 font-semibold ${
                      active ? "text-noting" : "text-ink-faint"
                    }`}
                  >
                    {active ? "Showing what applies →" : "This one"}
                  </span>
                </button>
              );
            })}
          </div>

          {chosen && (
            <div
              role="status"
              className="mt-6 border border-rule-heavy bg-paper-raised rounded-xl px-6 py-6"
            >
              <h3 className="display-3 mb-3">{chosen.label}</h3>
              <p className="leading-relaxed measure mb-5">
                {chosen.consequence}
              </p>
              <h4 className="eyebrow mb-3">
                What establishes it, in a form an office accepts
              </h4>
              <ul className="space-y-2.5">
                {chosen.establishBy.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      aria-hidden
                      className="num text-xs text-ink-faint pt-1 shrink-0"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed">{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ---- The routes ---- */}
        <section>
          <div className="shell-reading">
            <h2 className="eyebrow section-mark mb-4">
              {situation ? "What is open to you" : "Every route round it"}
            </h2>
            <p className="text-ink-soft leading-relaxed measure mb-6">
              Ordered by whose permission they need, because that is the only
              ordering that helps somebody who has just found out they need
              nobody&rsquo;s. Each one says what it cannot do, as well as what
              it can.
            </p>
          </div>

          <ol className="space-y-4">
            {shown.map((route, i) => {
              const dep = DEPENDENCY_LABEL[route.dependency];
              return (
                <li
                  key={route.id}
                  className="border border-rule-heavy bg-paper-raised rounded-xl overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-rule">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          aria-hidden
                          className="num text-xs text-ink-faint"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={`tag ${dep.tag}`}>{dep.label}</span>
                        <Tag kind={route.provenance} />
                      </div>
                    </div>
                    <h3 className="display-3 mb-2">{route.title}</h3>
                    <p className="lede measure">{route.summary}</p>
                  </div>

                  <div className="px-6 py-5 space-y-5">
                    <p className="leading-relaxed measure">{route.detail}</p>

                    <div>
                      <h4 className="eyebrow mb-3">How it is done</h4>
                      <ol className="space-y-2.5">
                        {route.steps.map((step, si) => (
                          <li key={si} className="flex gap-3">
                            <span
                              aria-hidden
                              className="num text-xs text-ink-faint pt-1 shrink-0 w-5"
                            >
                              {si + 1}
                            </span>
                            <span className="text-sm leading-relaxed">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Every route states its limit. A route without one
                        is a promise, and this product does not make
                        promises about somebody's money. */}
                    <div className="border-l-4 border-pending bg-pending-wash/40 rounded-lg px-5 py-4">
                      <h4 className="eyebrow mb-1.5">What it cannot do</h4>
                      <p className="text-sm leading-relaxed measure">
                        {route.limit}
                      </p>
                    </div>

                    {route.link && (
                      <Link
                        href={route.link.href}
                        className="btn btn-secondary btn-sm"
                      >
                        {route.link.label}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {situation && shown.length < ROUTES.length && (
            <p className="text-sm text-ink-faint mt-5">
              {ROUTES.length - shown.length} route
              {ROUTES.length - shown.length === 1 ? "" : "s"} hidden because{" "}
              {ROUTES.length - shown.length === 1 ? "it does" : "they do"} not
              apply to this situation.{" "}
              <button
                type="button"
                onClick={() => setSituation(null)}
                className="underline underline-offset-4 hover:text-ink"
              >
                Show everything
              </button>
            </p>
          )}
        </section>

        {/* ---- Who else can sign ---- */}
        <section>
          <div className="shell-reading">
            <h2 className="eyebrow section-mark mb-4">
              Who may sign instead of the employer
            </h2>
            <p className="text-ink-soft leading-relaxed measure mb-3">
              This list is printed on EPFO&rsquo;s own claim form. It is not a
              concession and it is not irregular — it is the form&rsquo;s
              instruction for exactly this situation, and it is one of the best
              kept open secrets in the scheme.
            </p>
            <p className="text-ink-soft leading-relaxed measure mb-6">
              Ordered here by how far an ordinary person has to walk, which is
              not the order the form uses.
            </p>
          </div>

          <ul className="border border-rule-heavy rounded-xl divide-y divide-rule overflow-hidden">
            {ATTESTERS.map((a) => (
              <li
                key={a.who}
                className="bg-paper-raised px-6 py-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-5"
              >
                <div className="sm:w-56 shrink-0">
                  <span
                    className={`tag ${
                      a.reach === "easy"
                        ? "tag-ok"
                        : a.reach === "moderate"
                          ? "tag-info"
                          : "tag-warn"
                    }`}
                  >
                    {REACH_LABEL[a.reach]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold tracking-[-0.01em] mb-1">
                    {a.who}
                  </p>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {a.note}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Disclose
            label="The two things that most often send one of these back"
            className="mt-5 border-l-4 border-rule-heavy bg-paper-inset/40 rounded-lg px-5 py-4"
          >
            <div className="text-sm text-ink-soft leading-relaxed measure space-y-3">
              <p>
                A signature without a seal, and a seal without a designation.
                An attesting authority is confirming who they are as much as
                who you are, so the office needs the name, the designation, the
                seal and the date. Ask for all four while you are standing
                there.
              </p>
              <p>
                And fill the form in before you go. An attesting authority
                signs what is in front of them — they do not complete it, and a
                half-filled form usually means a second trip.
              </p>
            </div>
          </Disclose>
        </section>

        {/* ---- The honest close ---- */}
        <section className="shell-reading">
          <h2 className="eyebrow section-mark mb-4">
            What this page is not claiming
          </h2>
          <div className="border border-rule bg-paper-inset/40 rounded-xl px-6 py-6 space-y-3">
            <p className="leading-relaxed measure">
              That any of this is quick, or certain. Two of the routes above
              depend on an officer exercising judgement, and an officer
              exercising judgement can decide either way. One of them —
              the RTI — carries a deadline, and it is the only one that does.
            </p>
            <p className="leading-relaxed measure">
              What is being claimed is narrower and, we think, more useful:
              that being told <em>ask your employer</em> when there is no
              employer is not the end of the matter, and that the routes which
              exist are not obscure. They are printed on the form, written into
              the procedure, and simply never mentioned to the person who needs
              them.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
