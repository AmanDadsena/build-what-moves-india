"use client";

import { useEffect, useState } from "react";
import type { Claim, RejectionReason } from "@/lib/types";
import { CLOCKS, ESCALATION_LADDER } from "@/lib/escalation";

/* Every deadline on this claim, as a date.

   The clocks page explains which periods bind anyone. This turns that
   into a calendar: the actual day each one falls due, whether it has
   already passed, and what — if anything — passing it changed.

   The point lands hardest on the soft clocks. Watching a settlement
   commitment sit forty days overdue with the consequence column
   reading "nothing happened" says more than any amount of
   explanation. */

interface Deadline {
  id: string;
  label: string;
  due: Date;
  kind: "soft" | "hard";
  consequence: string;
  authority: string;
  /** Days from filing until this one falls due. */
  offset: number;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function DeadlineBoard({
  claim,
  rejection,
}: {
  claim: Claim;
  rejection: RejectionReason;
}) {
  // "Today" is genuinely now, so it is read after mount rather than
  // baked into a static page at build time.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const filed = new Date(claim.filedOn);

  /* The ladder, laid end to end. Each step's clock only starts when
     the one before it has run out, which is why the RTI deadline sits
     months after filing rather than days. */
  const relevant = ESCALATION_LADDER.filter(
    (s) =>
      s.id === "refile" ||
      s.id === "rti" ||
      s.id === "rti-appeal" ||
      rejection.escalation.includes(s.id)
  );

  let cursor = 0;
  const deadlines: Deadline[] = relevant.map((step) => {
    cursor += step.clock.days;
    return {
      id: step.id,
      label: step.channel,
      due: addDays(filed, cursor),
      kind: step.clock.kind,
      consequence: step.clock.consequence,
      authority: step.clock.authority,
      offset: cursor,
    };
  });

  const rtiReply = CLOCKS["rti-reply"];

  return (
    <section>
      <p className="eyebrow section-mark mb-4">Every deadline, as a date</p>

      <div className="border border-rule bg-paper-raised rounded-xl overflow-hidden card-lift">
        <div className="px-5 py-4 border-b border-rule bg-paper">
          <p className="text-sm text-ink-soft leading-relaxed measure">
            Counted from the day you filed, {fmt(filed)}. Each step&rsquo;s
            clock begins when the one before it has run out — which is why the
            only deadline with a penalty behind it sits{" "}
            <span className="num font-semibold">
              {rtiReply.days + deadlines[deadlines.length - 2]?.offset || 0}
            </span>{" "}
            days out rather than thirty.
          </p>
        </div>

        <ol className="divide-y divide-rule">
          {deadlines.map((d) => {
            const lapsed = today ? today > d.due : false;
            const daysAway = today
              ? Math.round((+d.due - +today) / 86_400_000)
              : null;

            return (
              <li key={d.id} className="px-5 py-4">
                <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                  {/* The date column */}
                  <div className="w-28 shrink-0">
                    <p
                      className={`num font-bold ${
                        lapsed
                          ? d.kind === "hard"
                            ? "text-stamp"
                            : "text-ink-faint"
                          : "text-ink"
                      }`}
                    >
                      {fmt(d.due)}
                    </p>
                    {today && (
                      <p className="num text-xs text-ink-faint mt-0.5">
                        {lapsed
                          ? `${Math.abs(daysAway ?? 0)} days ago`
                          : `in ${daysAway} days`}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="title">{d.label}</p>
                      <span
                        className={`tag ${
                          d.kind === "hard" ? "tag-danger" : "tag-warn"
                        }`}
                      >
                        {d.kind === "hard" ? "Statutory" : "Courtesy"}
                      </span>
                      {lapsed && (
                        <span className="tag tag-neutral">Passed</span>
                      )}
                    </div>

                    <p className="text-sm text-ink-soft leading-relaxed measure">
                      {d.consequence}
                    </p>

                    {lapsed && d.kind === "soft" && (
                      <p className="text-sm font-semibold text-pending mt-2">
                        This date passed and nothing happened. No penalty, no
                        remedy, nobody answerable.
                      </p>
                    )}
                    {lapsed && d.kind === "hard" && (
                      <p className="text-sm font-semibold text-stamp mt-2">
                        This one passing gives you a right you did not have
                        before. Act on it.
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="px-5 py-4 border-t border-rule bg-paper">
          <p className="text-sm text-ink-soft leading-relaxed measure">
            Dates are computed from your filing date and the periods each
            channel works to. They are what should happen, not a promise that
            it will.
          </p>
        </div>
      </div>
    </section>
  );
}
