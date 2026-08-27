import type { Member, RejectionReason } from "@/lib/types";
import { findMismatches } from "@/lib/diff";
import { MismatchCard } from "@/components/MismatchCard";
import { Tag } from "@/components/Provenance";

export function RecordsPanel({
  member,
  rejection,
}: {
  member: Member;
  rejection: RejectionReason;
}) {
  const mismatches = findMismatches(member.records, rejection.compare);

  return (
    <div className="space-y-8 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow">Character by character</p>
          <Tag kind="mock" />
        </div>
        <h2 className="display-2 measure mb-4">
          {mismatches.length === 0
            ? "Your records agree with each other."
            : mismatches.length === 1
              ? "One field does not match. Here it is."
              : `${mismatches.length} fields do not match. Most serious first.`}
        </h2>
        <p className="lede measure">
          Correct the one field that differs, not all four.
        </p>
      </section>

      {mismatches.length === 0 ? (
        <p className="border border-rule bg-paper-raised px-5 py-4 text-ink-soft leading-relaxed max-w-2xl">
          Nothing in the compared fields differs — which means the rejection was
          not caused by a records mismatch at all. Read the Remark tab: the
          fault lies elsewhere, and correcting documents would waste your time.
        </p>
      ) : (
        <ul className="space-y-5">
          {mismatches.map((m, i) => (
            <MismatchCard key={i} mismatch={m} />
          ))}
        </ul>
      )}
    </div>
  );
}
