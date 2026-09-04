"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { ReadAloud } from "@/components/ReadAloud";
import { Disclose } from "@/components/Motion";
import { ENTITLEMENTS, NEEDED, STALLS } from "@/lib/survivors";
import { PageHero } from "@/components/PageHero";
import { CaseBackup } from "@/components/CaseBackup";

const DEMO_UAN = "990012345678";
const STORAGE = "rk-survivor-checklist";

/* Written for somebody who did not choose to be here.
 *
 * Three things follow from that and none of them are decoration.
 *
 * The most useful sentence goes first, before any orientation: there
 * are three separate entitlements and most families claim one. A page
 * that opens by explaining what a provident fund is has already
 * wasted the only attention this reader has.
 *
 * Nothing is cheerful and nothing is urgent. No exclamation, no
 * reassurance nobody asked for, no countdown. The tone that works
 * here is the tone of a competent clerk who is not in a hurry.
 *
 * The checklist remembers itself, because this is collected over
 * weeks and across several people, and being made to start again is
 * the point at which families give up.
 */

const TONE = {
  noting: { border: "border-noting", wash: "bg-noting-wash", text: "text-noting" },
  verify: { border: "border-verify", wash: "bg-verify-wash", text: "text-verify" },
  pending: { border: "border-pending", wash: "bg-pending-wash", text: "text-pending" },
} as const;

export function AfterADeath() {
  const [have, setHave] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setHave(JSON.parse(raw));
    } catch {
      // A corrupt entry is not worth failing the page over.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(have));
    } catch {
      // Private mode. The list still works for this visit.
    }
  }, [have, ready]);

  const collected = NEEDED.filter((n) => have[n.id]).length;
  const blockingLeft = NEEDED.filter((n) => n.blocking && !have[n.id]).length;

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="If the member has died"
          provenance="verified"
          title="Three things are owed. Most families claim one."
          lede="The provident fund balance, a monthly pension, and an insurance payment are three separate entitlements with three separate forms. Being paid the first one looks, from outside, exactly like the matter being finished."
          actions={
            <ReadAloud
              size="md"
              en="Three things are owed, and most families claim one. The provident fund balance, a monthly pension, and an insurance payment are three separate entitlements with three separate forms. Being paid the first one looks, from outside, exactly like the matter being finished."
            />
          }
        />

        <div className="shell py-10 sm:py-14 space-y-14">
          {/* The three */}
          <section>
            <h2 className="eyebrow section-mark mb-5">What is owed</h2>
            <ul className="grid gap-5 lg:grid-cols-3">
              {ENTITLEMENTS.map((e) => {
                const tone = TONE[e.tone];
                return (
                  <li key={e.id}>
                    <div
                      className={`h-full flex flex-col border-2 rounded-xl overflow-hidden card-lift ${tone.border}`}
                    >
                      <div className={`px-5 py-3 ${tone.wash}`}>
                        <p className={`eyebrow mb-0 ${tone.text}`}>{e.form}</p>
                      </div>
                      <div className="px-5 py-5 bg-paper-raised flex-1 flex flex-col">
                        <h2 className="title leading-snug mb-1">{e.title}</h2>
                        <p className="font-deva text-sm text-ink-faint mb-4">
                          {e.titleHi}
                        </p>

                        <p className="text-sm leading-relaxed mb-4">{e.what}</p>

                        <div className="pt-4 mt-auto border-t border-rule">
                          <p className={`eyebrow mb-1.5 ${tone.text}`}>
                            What nobody tells you
                          </p>
                          <p className="text-sm leading-relaxed mb-3">
                            {e.missed}
                          </p>
                          <p className="text-xs text-ink-faint leading-relaxed">
                            <span className="font-semibold">Goes to</span>{" "}
                            {e.to}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 border-l-4 border-verify bg-verify-wash/40 rounded-lg px-5 py-4">
              <p className="eyebrow mb-2">The rule that does not apply here</p>
              <p className="text-sm leading-relaxed measure">
                Ten years of qualifying service decides whether a{" "}
                <em>living</em> member receives a pension. It has no bearing on
                a death in service. A family told there is no pension because
                the member had not completed ten years has been told something
                that is not true — sometimes by somebody who believes it.
              </p>
              <ReadAloud
                className="mt-4"
                en="Ten years of qualifying service decides whether a living member receives a pension. It has no bearing on a death in service. A family told there is no pension because the member had not completed ten years has been told something that is not true, sometimes by somebody who believes it."
              />
            </div>
          </section>

          {/* What to gather */}
          <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div>
              <h2 className="eyebrow section-mark mb-2">What to have ready</h2>
              <p className="text-ink-soft leading-relaxed measure mb-5">
                In the order that matters, not the order that is easy. The four
                marked as stopping everything are the ones to chase first — a
                family that collects the simple things first and finds the hard
                one in week three has lost three weeks.
              </p>

              <ul className="border border-rule rounded-xl divide-y divide-rule overflow-hidden">
                {NEEDED.map((n) => (
                  <li
                    key={n.id}
                    className={have[n.id] ? "bg-paper-inset/40" : "bg-paper-raised"}
                  >
                    <label className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-paper">
                      <input
                        type="checkbox"
                        checked={Boolean(have[n.id])}
                        onChange={(e) =>
                          setHave((prev) => ({
                            ...prev,
                            [n.id]: e.target.checked,
                          }))
                        }
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-verify)]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                          <span
                            className={`font-semibold leading-snug ${
                              have[n.id] ? "line-through text-ink-faint" : ""
                            }`}
                          >
                            {n.label}
                          </span>
                          {n.blocking && !have[n.id] && (
                            <span className="tag tag-danger">
                              Stops everything
                            </span>
                          )}
                        </span>
                        <span className="block text-sm text-ink-soft leading-relaxed">
                          {n.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div
              role="status"
              className="border border-rule-heavy bg-paper-raised rounded-xl p-6 lg:sticky lg:top-24"
            >
              <p className="eyebrow mb-2">Where you are</p>
              <p className="figure text-2xl mb-1">
                {collected} of {NEEDED.length}
              </p>
              <p className="text-sm text-ink-soft leading-relaxed mb-5">
                {blockingLeft === 0
                  ? "Everything that stops a claim outright is in hand. The rest can follow."
                  : `${blockingLeft} of the four that stop a claim outright ${blockingLeft === 1 ? "is" : "are"} still missing.`}
              </p>

              <div
                className="h-2 bg-paper-inset rounded-full overflow-hidden mb-5"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={NEEDED.length}
                aria-valuenow={collected}
                aria-label="Documents collected"
              >
                <div
                  className="h-full bg-verify transition-[width] duration-500"
                  style={{ width: `${(collected / NEEDED.length) * 100}%` }}
                />
              </div>

              <p className="text-xs text-ink-faint leading-relaxed mb-4">
                Ticks are kept on this device only. Nothing is sent anywhere and
                there is no account here.
              </p>
              <div className="pt-4 border-t border-rule">
                <CaseBackup />
              </div>
            </div>
          </section>

          {/* Where it stalls */}
          <section>
            <h2 className="eyebrow section-mark mb-2">Where it usually stalls</h2>
            <p className="text-ink-soft leading-relaxed measure mb-5">
              Four things account for most of the delay, and three of them have
              a route around that families are rarely told about.
            </p>

            <ul className="space-y-4">
              {STALLS.map((s) => (
                <li
                  key={s.when}
                  className="border border-rule bg-paper-raised rounded-xl overflow-hidden"
                >
                  <div className="px-5 py-3.5 bg-paper border-b border-rule">
                    <p className="font-semibold leading-snug">{s.when}</p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm text-ink-soft leading-relaxed mb-3 measure">
                      {s.why}
                    </p>
                    <p className="eyebrow mb-1.5">What to do</p>
                    <p className="text-sm leading-relaxed measure">{s.doThis}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* The thing that prevents all of it */}
          <section className="border-2 border-noting/40 bg-paper-raised rounded-xl p-6 sm:p-8 card-lift">
            <h2 className="eyebrow section-mark mb-3">
              If you are reading this and nobody has died
            </h2>
            <h2 className="display-2 measure mb-4">
              A nomination takes ten minutes and removes almost all of this.
            </h2>
            <p className="text-ink-soft leading-relaxed measure mb-6">
              Everything hard above — establishing who the family is, the court
              certificate, the months of waiting — exists because the record
              did not say who the money was for. A filed nomination answers
              that question in advance, and it is the only part of this whole
              process that can be done on an ordinary afternoon.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Link
                href={`/portal/${DEMO_UAN}/nomination`}
                className="btn btn-primary"
              >
                File a nomination
              </Link>
              <Link
                href="/why/nomination-missing-death-claim/"
                className="btn btn-secondary"
              >
                What happens when there is none
              </Link>
            </div>
          </section>

          <Disclose
            label="About the figures and rules on this page"
            className="border-l-4 border-rule-heavy bg-paper-inset/40 rounded-lg px-5 py-4"
          >
            <div className="text-sm text-ink-soft leading-relaxed measure space-y-3">
              <p>
                The three entitlements, their forms and the rule that a death in
                service does not carry the ten-year qualifying service
                requirement are documented provisions of the schemes. The
                insurance benefit is calculated from the member&rsquo;s wages
                and sits between a statutory floor and a ceiling, both of which
                are revised by notification from time to time — so no amount is
                quoted here that could be out of date by the time you read it.
              </p>
              <p>
                Who counts as family, and in what order, is defined by the
                schemes rather than by general succession law, which is why a
                court certificate is often unnecessary. Establish that before
                beginning a court process.
              </p>
              <p>
                This is a good-faith reading of published rules and is not legal
                advice. A contested claim deserves a person, not a page.
              </p>
            </div>
          </Disclose>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
