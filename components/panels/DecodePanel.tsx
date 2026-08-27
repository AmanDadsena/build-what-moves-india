"use client";

import type { Actor, Claim, RejectionReason } from "@/lib/types";
import { DESK_LABEL } from "@/lib/types";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";
import { ReadAloud } from "@/components/ReadAloud";

/* The decode screen, kept short on purpose.

   A member needs three facts fast: what it means, whose job it is,
   and what to do next. The mechanism behind it matters — it is the
   reason the remark was useless — but it is background, so it sits
   behind a disclosure rather than between them and the answer. */

const ACTOR: Record<Actor, { who: string; note: string; className: string }> = {
  member: {
    who: "You",
    note: "Nobody else is holding this up.",
    className: "tag-ok",
  },
  employer: {
    who: "Your employer",
    note: "Nothing on your own account will clear it.",
    className: "tag-warn",
  },
  epfo: {
    who: "EPFO",
    note: "Put it on record, then escalate on a clock that binds them.",
    className: "tag-danger",
  },
};

export function DecodePanel({
  claim,
  rejection,
}: {
  claim: Claim;
  rejection: RejectionReason;
}) {
  const actor = ACTOR[rejection.whoMustAct];

  return (
    <div className="space-y-11 stagger">
      {/* The remark, then what it meant. */}
      <section>
        <p className="eyebrow mb-3">The portal said</p>
        <div className="border border-rule-heavy bg-paper-raised px-5 py-4 mb-8">
          <p className="machine text-sm sm:text-base leading-snug">
            {claim.remark}
          </p>
        </div>

        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          <p className="eyebrow">It meant</p>
          <Tag kind="verified" />
        </div>
        <h3 className="display-2 measure mb-4">{rejection.title}</h3>
        <p className="lede measure">{rejection.plain}</p>
        <p className="font-deva text-ink-faint measure mt-3">
          {rejection.plainHi}
        </p>

        <ReadAloud
          className="mt-5"
          size="md"
          en={`${rejection.title}. ${rejection.plain}`}
          hi={`${rejection.titleHi}. ${rejection.plainHi}`}
        />

        <Disclose
          label="Why the remark could not tell you this"
          className="mt-6"
        >
          <p className="text-ink-soft leading-relaxed measure">
            {rejection.mechanism}
          </p>
        </Disclose>
      </section>

      {/* Whose job. */}
      <section>
        <p className="eyebrow mb-3">Whose job it is</p>
        <div className={`border px-5 py-4 ${actor.className}`}>
          <p className="display-3 mb-1">{actor.who}</p>
          <p className="text-sm leading-relaxed opacity-90">{actor.note}</p>
        </div>
        <p className="text-sm text-ink-faint mt-3 measure">
          Raised at the {DESK_LABEL[rejection.rejectedAt].short} desk &middot;
          usually clears in about {rejection.typicalDays} days.
        </p>
      </section>

      {/* The steps. */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <p className="eyebrow mb-0">In this order</p>
          {/* One player for the whole list. Somebody who cannot read
              the steps cannot read six separate buttons either. */}
          <ReadAloud
            en={rejection.fixSteps
              .map(
                (step, i) =>
                  `Step ${i + 1}. ${ACTOR[step.actor].who}. ${step.instruction} This is done at ${step.where}, and takes about ${step.days} ${step.days === 1 ? "day" : "days"}.`,
              )
              .join(" ")}
            hi={rejection.fixSteps
              .map((step, i) => `${i + 1}. ${step.instructionHi}`)
              .join(" ")}
          />
        </div>
        <ol className="border border-rule divide-y divide-rule rounded-lg overflow-hidden">
          {rejection.fixSteps.map((step, i) => (
            <li key={i} className="bg-paper p-5">
              <div className="flex items-start gap-4">
                <span className="num text-xs text-ink-faint pt-1 w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`tag ${ACTOR[step.actor].className}`}
                    >
                      {ACTOR[step.actor].who}
                    </span>
                    <span className="text-xs text-ink-faint">
                      ~{step.days} {step.days === 1 ? "day" : "days"}
                    </span>
                  </div>

                  <p className="leading-relaxed measure">{step.instruction}</p>

                  <Disclose label="हिंदी में पढ़ें" className="mt-2.5">
                    <p className="font-deva text-sm text-ink-soft leading-relaxed measure">
                      {step.instructionHi}
                    </p>
                  </Disclose>

                  <p className="text-xs text-ink-faint mt-2.5">
                    {step.where}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
