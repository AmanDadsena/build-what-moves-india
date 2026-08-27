import type { Claim, Member, NoteSheetEntry } from "@/lib/types";
import { DESK_LABEL } from "@/lib/types";
import { Tag } from "@/components/Provenance";

/* The signature screen.

   A member is shown one sentence. Inside the office, the same claim
   carries a running noting — every desk it reached, what each
   officer recorded, and each point the file was sent back. This
   rebuilds that record and marks the moments the twenty-day
   commitment silently restarted, which is how a claim can sit for
   months without the commitment ever being recorded as breached. */

const ACTION_COPY: Record<
  NoteSheetEntry["action"],
  { label: string; className: string }
> = {
  forwarded: { label: "Forwarded", className: "tag-neutral" },
  "returned-incomplete": {
    label: "Returned incomplete",
    className: "tag-danger",
  },
  rejected: {
    label: "Rejected",
    className: "tag-danger",
  },
  settled: {
    label: "Settled",
    className: "tag-ok",
  },
};

export function NoteSheetPanel({
  member,
  claim,
}: {
  member: Member;
  claim: Claim;
}) {
  const noteSheet = claim.noteSheet ?? [];
  const resets = noteSheet.filter((n) => n.resetsClock);
  const lastEntry = noteSheet[noteSheet.length - 1];
  const totalDays = lastEntry?.dayOffset ?? 0;
  const lastResetDay = resets.length
    ? Math.max(...resets.map((r) => r.dayOffset))
    : 0;
  const officialDays = totalDays - lastResetDay;

  return (
    <div className="space-y-8 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow">The internal file</p>
          <Tag kind="reconstructed" />
        </div>
        <h2 className="display-2 measure mb-4">
          Your claim was discussed {noteSheet.length} times. You were
          told once.
        </h2>
        <p className="lede measure">
          Every claim carries a noting inside the office. This is what a file
          like yours looks like — and it is what the RTI on the Documents tab
          asks EPFO to hand over for your actual case.
        </p>
      </section>

      {/* The arithmetic that matters */}
      <section className="grid gap-px bg-rule border border-rule rounded-lg overflow-hidden sm:grid-cols-3">
        <Metric
          label="Days your file was open"
          value={String(totalDays)}
          tone="ink"
        />
        <Metric
          label="Times the clock was reset"
          value={String(resets.length)}
          tone="stamp"
        />
        <Metric
          label="Days EPFO counts against its commitment"
          value={String(officialDays)}
          tone="pending"
          note={
            resets.length > 0
              ? `Counted from the last return, not from the day you filed.`
              : undefined
          }
        />
      </section>

      {resets.length > 0 && (
        <p className="text-sm text-ink-soft leading-relaxed max-w-2xl border-l-4 border-stamp bg-stamp-wash/40 rounded-lg px-5 py-4">
          You waited {totalDays} days. Against its own twenty-day commitment,
          EPFO counts {officialDays}. Each time a desk marked the file
          incomplete, the count began again — so the commitment was never
          formally missed.
        </p>
      )}

      {/* The note sheet itself */}
      <section>
        <div className="border border-rule-heavy rounded-lg overflow-hidden">
          <div className="border-b border-rule-heavy bg-paper-inset/60 px-4 py-2.5 flex items-center justify-between gap-3">
            <p className="eyebrow">Note sheet &middot; {claim.form}</p>
            <p className="text-xs text-ink-faint">
              UAN {member.uan}
            </p>
          </div>

          <ol className="notesheet">
            {noteSheet.map((entry, i) => {
              const action = ACTION_COPY[entry.action];
              return (
                <li
                  key={i}
                  className="note-in border-b border-rule last:border-0 px-4 py-5 sm:px-6"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div className="sm:flex sm:gap-6">
                    {/* Officer column, as a real note sheet has */}
                    <div className="sm:w-48 shrink-0 mb-3 sm:mb-0">
                      <p className="num text-xs text-ink-faint mb-1">
                        Day {entry.dayOffset}
                      </p>
                      <p className="text-sm font-medium leading-snug">
                        {DESK_LABEL[entry.desk].short}
                      </p>
                      <p className="text-xs text-ink-faint leading-snug mt-0.5">
                        {DESK_LABEL[entry.desk].full}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="noting-ink leading-relaxed mb-3">
                        {entry.noting}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`tag ${action.className}`}
                        >
                          {action.label}
                        </span>
                        {entry.resetsClock && (
                          <span className="text-xs font-semibold text-stamp">
                            &larr; clock reset to zero here
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="text-sm text-ink-faint mt-3 leading-relaxed max-w-2xl">
          Reconstructed from EPFO&rsquo;s documented claim workflow and the
          remark on this case. It is not a copy of any real person&rsquo;s file.
          To obtain your own, send the RTI on the Documents tab.
        </p>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  note,
}: {
  label: string;
  value: string;
  tone: "ink" | "stamp" | "pending";
  note?: string;
}) {
  const color =
    tone === "stamp"
      ? "text-stamp"
      : tone === "pending"
        ? "text-pending"
        : "text-ink";
  return (
    <div className="bg-paper p-5">
      <p className="eyebrow mb-2">{label}</p>
      <p className={`figure text-3xl ${color}`} data-numeric>
        {value}
      </p>
      {note && (
        <p className="text-xs text-ink-faint mt-2 leading-relaxed">{note}</p>
      )}
    </div>
  );
}
