import type { Claim } from "@/lib/types";
import { DESK_LABEL } from "@/lib/types";
import { journey, type StageState } from "@/lib/journey";
import { Tag } from "@/components/Provenance";

/* Where the claim actually is.

   Drawn as a vertical track rather than a row of circles: a phone is
   tall, the stages carry a sentence each, and a horizontal stepper
   would either truncate them or scroll sideways. The rail between
   markers is solid where the file has been and hairline where it has
   not, so the stopping point is visible before a word is read. */

const MARKER: Record<StageState, string> = {
  done: "border-verify bg-verify",
  current: "border-noting bg-paper-raised",
  pending: "border-rule bg-paper-raised",
  failed: "border-stamp bg-stamp",
};

const RAIL: Record<StageState, string> = {
  done: "bg-verify/40",
  current: "bg-rule-heavy",
  pending: "bg-rule",
  failed: "bg-stamp/30",
};

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

export function ClaimTimeline({ claim }: { claim: Claim }) {
  const j = journey(claim);

  return (
    <div className="space-y-8">
      {/* The three facts a member opens this page for. */}
      <section
        className={`border rounded-lg overflow-hidden card-lift ${
          j.outcome === "rejected"
            ? "border-stamp/40"
            : j.outcome === "settled"
              ? "border-verify/40"
              : "border-rule-heavy"
        }`}
      >
        <div
          className={`px-5 py-4 border-b ${
            j.outcome === "rejected"
              ? "border-stamp/25 bg-stamp-wash/50"
              : j.outcome === "settled"
                ? "border-verify/25 bg-verify-wash"
                : "border-rule bg-paper-inset/60"
          }`}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="eyebrow">Where it stands</p>
            <Tag kind="reconstructed" />
          </div>
        </div>

        <dl className="grid sm:grid-cols-3 gap-px bg-rule">
          <div className="bg-paper px-5 py-4">
            <dt className="eyebrow mb-1.5">Days open</dt>
            <dd className="figure text-2xl" data-numeric>
              {j.totalDays}
            </dd>
          </div>
          <div className="bg-paper px-5 py-4">
            <dt className="eyebrow mb-1.5">Sent back</dt>
            <dd
              className={`figure text-2xl ${
                j.resets > 0 ? "text-stamp" : "text-ink"
              }`}
              data-numeric
            >
              {j.resets} {j.resets === 1 ? "time" : "times"}
            </dd>
          </div>
          <div className="bg-paper px-5 py-4">
            <dt className="eyebrow mb-1.5">Amount</dt>
            <dd className="figure text-2xl" data-numeric>
              {rupees(claim.amount)}
            </dd>
          </div>
        </dl>

        <div className="bg-paper-raised px-5 py-4 border-t border-rule space-y-3">
          <div>
            <p className="eyebrow mb-1">Who holds it now</p>
            <p className="leading-relaxed">{j.holder}</p>
          </div>
          <div>
            <p className="eyebrow mb-1">What has to happen next</p>
            <p className="leading-relaxed">{j.nextStep}</p>
          </div>
        </div>
      </section>

      {/* The track */}
      <section>
        <p className="eyebrow mb-5">Every stage, and where it stopped</p>

        <ol className="relative">
          {j.stages.map((stage, i) => {
            const last = i === j.stages.length - 1;
            return (
              <li key={stage.id} className="relative flex gap-4 pb-7 last:pb-0">
                {/* Rail */}
                {!last && (
                  <span
                    aria-hidden
                    className={`absolute left-[7px] top-5 bottom-0 w-0.5 ${RAIL[stage.state]}`}
                  />
                )}

                {/* Marker */}
                <span
                  aria-hidden
                  className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${MARKER[stage.state]}`}
                />

                <div className="min-w-0 flex-1 -mt-0.5">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <p
                      className={`title ${
                        stage.state === "pending"
                          ? "text-ink-faint"
                          : stage.state === "failed"
                            ? "text-stamp"
                            : "text-ink"
                      }`}
                    >
                      {stage.label}
                    </p>
                    {stage.day !== undefined && (
                      <p className="text-sm text-ink-faint" data-numeric>
                        {stage.day === 0 ? "day one" : `day ${stage.day}`}
                      </p>
                    )}
                  </div>

                  <p className="font-deva text-sm text-ink-faint mt-0.5">
                    {stage.labelHi}
                  </p>

                  <p
                    className={`text-sm leading-relaxed mt-2 measure ${
                      stage.state === "pending" ? "text-ink-faint" : "text-ink-soft"
                    }`}
                  >
                    {stage.note}
                  </p>

                  {stage.desk && stage.state !== "pending" && (
                    <p className="text-sm text-ink-faint mt-1.5">
                      {DESK_LABEL[stage.desk].full}
                    </p>
                  )}

                  {stage.returns ? (
                    <p className="text-sm font-semibold text-stamp mt-2">
                      Sent back {stage.returns}{" "}
                      {stage.returns === 1 ? "time" : "times"} from here — each
                      one restarted the twenty-day clock.
                    </p>
                  ) : null}

                  {stage.state === "failed" && (
                    <p className="text-sm text-stamp leading-relaxed mt-2 measure">
                      This is where it stopped. Everything below never happened.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="text-sm text-ink-faint leading-relaxed measure">
        The stages are EPFO&rsquo;s documented claim workflow. The dates come
        from this case&rsquo;s reconstructed noting, not from a live system.
      </p>
    </div>
  );
}
