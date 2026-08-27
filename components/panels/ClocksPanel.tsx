import type { Claim, RejectionReason } from "@/lib/types";
import { ESCALATION_LADDER } from "@/lib/escalation";
import { Tag } from "@/components/Provenance";
import { DeadlineBoard } from "@/components/DeadlineBoard";
import { Illustration } from "@/components/Illustration";

/* The distinction this product exists to teach: a member is handed
   four numbers and told to wait, and only one of them can be
   enforced. Soft and hard clocks are therefore rendered as visibly
   different objects, never as a uniform list of steps. */

export function ClocksPanel({
  claim,
  rejection,
  elapsed,
}: {
  claim: Claim;
  rejection: RejectionReason;
  elapsed: number | null;
}) {
  const relevant = ESCALATION_LADDER.filter(
    (step) =>
      step.id === "refile" ||
      step.id === "rti" ||
      step.id === "rti-appeal" ||
      rejection.escalation.includes(step.id)
  );

  return (
    <div className="space-y-9 stagger">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow">Deadlines</p>
          <Tag kind="statutory" />
        </div>
        <h2 className="display-2 measure mb-4">
          Four of these clocks are courtesies. One of them is law.
        </h2>
        <p className="lede measure">
          {elapsed === null
            ? "This claim has been open since it was filed."
            : `This claim has been open ${elapsed} days.`}{" "}
          Below is every route available to you, in order, with what actually
          happens when each deadline passes.
        </p>
        </div>
        <Illustration
          src="/img/deadlines.webp"
          tone="stamp"
          className="hidden lg:block"
        />
      </section>

      <DeadlineBoard claim={claim} rejection={rejection} />

      <ol className="space-y-4">
        {relevant.map((step) => {
          const hard = step.clock.kind === "hard";
          return (
            <li
              key={step.id}
              className={`border ${
                hard ? "border-stamp/50 bg-stamp-wash/30" : "border-rule"
              }`}
            >
              <div
                className={`px-5 py-3 border-b flex items-center justify-between gap-3 flex-wrap ${
                  hard
                    ? "border-stamp/30 bg-stamp-wash/50"
                    : "border-rule bg-paper-inset/50"
                }`}
              >
                <p className="eyebrow">{step.channel}</p>
                <span
                  className={`tag ${hard ? "tag-danger" : "tag-warn"}`}
                >
                  {hard ? "Statutory" : "Courtesy"}
                </span>
              </div>

              <div className="px-5 py-5">
                <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                  <p
                    className={`figure text-2xl ${hard ? "text-stamp" : "text-ink"}`}
                    data-numeric
                  >
                    {step.clock.days} days
                  </p>
                  {step.clock.resettable && (
                    <span className="text-xs font-semibold text-pending">
                      resets on every return
                    </span>
                  )}
                </div>

                <p className="text-ink-soft leading-relaxed mb-4 max-w-2xl">
                  {step.what}
                </p>

                <div
                  className={`border-l-2 pl-4 py-1 ${
                    hard ? "border-stamp" : "border-rule-heavy"
                  }`}
                >
                  <p className="eyebrow mb-1.5">
                    {hard ? "When it lapses" : "When it lapses"}
                  </p>
                  <p className="text-sm leading-relaxed max-w-2xl">
                    {step.clock.consequence}
                  </p>
                </div>

                <p className="text-xs text-ink-faint mt-4">
                  {step.clock.authority}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="border border-rule-heavy bg-paper-raised rounded-lg px-5 py-5">
        <p className="eyebrow mb-2.5">The short version</p>
        <p className="leading-relaxed max-w-2xl">
          Waiting on the courtesy clocks costs you nothing and gets you nothing.
          Use them to build the record, then use the RTI, because it is the only
          one where somebody becomes personally answerable for the silence.
        </p>
      </section>
    </div>
  );
}
