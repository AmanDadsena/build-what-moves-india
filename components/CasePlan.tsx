"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Claim, Member, RejectionReason, Actor } from "@/lib/types";
import {
  buildPlan,
  schedule,
  remaining,
  toCalendar,
  type PlanProgress,
} from "@/lib/plan";
import { Tag } from "@/components/Provenance";
import { ReadAloud } from "@/components/ReadAloud";

/* The plan a member actually works through, over months.
 *
 * Progress is kept on the device and nowhere else. There is no
 * account here and there is not going to be one, so the only honest
 * place for "I did this on the fourteenth" is the browser that member
 * is holding. It is stated on screen rather than assumed, because a
 * person who has ticked nine things deserves to know that clearing
 * their browsing data will lose them.
 *
 * The dates reschedule from what was actually done rather than from a
 * fixed plan made on day one — get an employer signature a fortnight
 * late and everything after it moves a fortnight. A plan that keeps
 * asserting dates which have already passed stops being read.
 */

const ACTOR_LABEL: Record<Actor, { who: string; tag: string }> = {
  member: { who: "You", tag: "tag-ok" },
  employer: { who: "Your employer", tag: "tag-warn" },
  epfo: { who: "EPFO", tag: "tag-danger" },
};

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function CasePlan({
  member,
  claim,
  rejection,
}: {
  member: Member;
  claim: Claim;
  rejection: RejectionReason;
}) {
  const storageKey = `rk-plan-${claim.id}`;

  const [progress, setProgress] = useState<PlanProgress>({});
  const [ready, setReady] = useState(false);

  // Read after mount. The server cannot know this, and guessing at it
  // during render produces a hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setProgress(JSON.parse(raw));
    } catch {
      // A corrupt entry is not worth failing the page over.
    }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      // Private mode. The plan still works for this visit.
    }
  }, [progress, ready, storageKey]);

  const items = useMemo(() => buildPlan(claim, rejection), [claim, rejection]);
  const dated = useMemo(() => schedule(items, progress), [items, progress]);

  const doneCount = dated.filter((i) => i.done).length;
  const left = remaining(dated);
  const next = dated.find((i) => i.next);

  const toggle = useCallback((id: string) => {
    setProgress((prev) => {
      if (prev[id]) {
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== id),
        );
      }
      return { ...prev, [id]: new Date().toISOString() };
    });
  }, []);

  const download = useCallback(() => {
    const ics = toCalendar(dated, claim, rejection);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${claim.id}-plan.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revoking immediately can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, [dated, claim, rejection]);

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          <p className="eyebrow mb-0">Your plan</p>
          <Tag kind="verified" />
        </div>
        <h2 className="display-2 measure mb-4">
          {dated.length} things, in order, with the date each one falls due.
        </h2>
        <p className="lede measure">
          This runs for months, not for an afternoon. Tick things off as you do
          them and the remaining dates move with you.
        </p>
      </section>

      {/* Where you are */}
      <section className="gold-top border border-rule-heavy bg-paper-raised rounded-xl overflow-hidden card-lift">
        <div className="px-5 py-4 sm:px-6 border-b border-rule bg-paper flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="eyebrow mb-1">Progress</p>
            <p className="figure text-2xl">
              {doneCount} of {dated.length} done
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={download}
              disabled={left.length === 0}
              className="btn btn-primary btn-sm disabled:opacity-40"
            >
              Put the dates in your calendar
            </button>
            {doneCount > 0 && (
              <button
                onClick={() => setProgress({})}
                className="btn btn-ghost btn-sm"
              >
                Start over
              </button>
            )}
          </div>
        </div>

        <div
          className="h-2 bg-paper-inset"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={dated.length}
          aria-valuenow={doneCount}
          aria-label="Steps completed"
        >
          <div
            className="h-full bg-verify transition-[width] duration-500"
            style={{ width: `${(doneCount / dated.length) * 100}%` }}
          />
        </div>

        {next && (
          <div className="px-5 py-5 sm:px-6">
            <p className="eyebrow mb-2">Do this next</p>
            <p className="title mb-1.5">{next.title}</p>
            <p className="text-ink-soft leading-relaxed measure mb-3">
              {next.detail}
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`tag ${ACTOR_LABEL[next.actor].tag}`}>
                {ACTOR_LABEL[next.actor].who}
              </span>
              <span className="num text-sm text-ink-soft">
                by {fmt(next.due)}
              </span>
              {next.binding === "hard" && <Statutory />}
            </div>
            <ReadAloud className="mt-4" en={`Do this next. ${next.detail}`} />
          </div>
        )}

        {!next && ready && (
          <div className="px-5 py-6 sm:px-6">
            <p className="title mb-1.5">Everything on the plan is done.</p>
            <p className="text-ink-soft leading-relaxed measure">
              If the claim still has not moved, the second appeal to the Central
              Information Commission is what remains — and it is the step that
              can put a personal penalty on the officer who did not reply.
            </p>
          </div>
        )}
      </section>

      {/* The whole list */}
      <section>
        <p className="eyebrow mb-4">Everything, in order</p>
        <ol className="border border-rule rounded-xl divide-y divide-rule overflow-hidden">
          {dated.map((item, index) => (
            <li
              key={item.id}
              className={
                item.done
                  ? "bg-paper-inset/40"
                  : item.next
                    ? "bg-noting-wash/40"
                    : "bg-paper-raised"
              }
            >
              <label className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-paper">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggle(item.id)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-verify)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-3 mb-1 flex-wrap">
                    <span className="num text-xs text-ink-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-semibold leading-snug ${
                        item.done ? "line-through text-ink-faint" : ""
                      }`}
                    >
                      {item.title}
                    </span>
                  </span>

                  <span className="block text-sm text-ink-soft leading-relaxed mb-2.5">
                    {item.detail}
                  </span>

                  <span className="flex items-center gap-2.5 flex-wrap">
                    <span className={`tag ${ACTOR_LABEL[item.actor].tag}`}>
                      {ACTOR_LABEL[item.actor].who}
                    </span>
                    {item.binding === "hard" ? (
                      <Statutory />
                    ) : (
                      <span className="tag tag-neutral">Courtesy period</span>
                    )}
                    <span
                      className={`num text-xs ${
                        item.done
                          ? "text-verify"
                          : item.overdue
                            ? "text-stamp font-semibold"
                            : "text-ink-faint"
                      }`}
                    >
                      {item.done
                        ? `done ${fmt(item.due)}`
                        : item.overdue
                          ? `was due ${fmt(item.due)}`
                          : `by ${fmt(item.due)}`}
                    </span>
                    <span className="text-xs text-ink-faint">{item.where}</span>
                  </span>

                  {item.binding === "hard" && item.consequence && !item.done && (
                    <span className="block text-xs text-stamp leading-relaxed mt-2.5 measure">
                      {item.consequence}
                    </span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-l-4 border-noting bg-noting-wash/40 rounded-lg px-5 py-4">
        <p className="eyebrow mb-2">Where this is kept</p>
        <p className="text-sm leading-relaxed measure mb-3">
          On this device, in this browser, and nowhere else. There is no account
          here and nothing is sent anywhere — which also means clearing your
          browsing data clears the ticks. The calendar file is the copy that
          survives that, which is the main reason it exists.
        </p>
        <Link
          href={`/portal/${member.uan}/summary`}
          className="btn btn-secondary btn-sm"
        >
          Print the case summary instead
        </Link>
      </section>
    </div>
  );
}

/* The one distinction this product exists to teach cannot share a
   colour with the actor tag beside it. A washed crimson chip reading
   "Statutory" next to a washed crimson chip reading "EPFO" is two
   different facts wearing the same clothes — so this one is solid,
   and reads as a stamp rather than as a label. */
function Statutory() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-stamp text-paper px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]">
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-paper/70" />
      Statutory
    </span>
  );
}
