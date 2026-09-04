import type { Member } from "@/lib/types";
import { assessAdvances } from "@/lib/advances";
import { Tag } from "@/components/Provenance";
import { Illustration } from "@/components/Illustration";

/* What you can take out today, and for what.

   Form 31 is not one thing. Each purpose carries its own minimum
   service, its own ceiling and its own limit on how often it can be
   used, and the portal offers the form without stating any of it. So
   members ask for an amount they are not entitled to, are rejected,
   and conclude the money is stuck — when a different purpose, or a
   smaller figure, would have been paid.

   Everything unavailable is still listed, with the reason and how far
   off it is. Hiding it would leave the same question unanswered. */

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

export function AdvanceOptions({ member }: { member: Member }) {
  const options = assessAdvances(member);
  const available = options.filter((o) => o.eligible);

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <h2 className="eyebrow section-mark mb-0">What you can take, and why</h2>
        <Tag kind="verified" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center mb-6">
        <p className="lede measure">
          {available.length} of {options.length} purposes are open to you today.
          Each has its own ceiling — asking for more than the purpose allows is
          one of the most common avoidable rejections.
        </p>
        <Illustration
          src="/img/advances.webp"
          tone="verify"
          className="hidden lg:block"
        />
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {options.map(({ purpose, eligible, ceiling, reason }) => (
          <li key={purpose.id}>
            <div
              className={`h-full rounded-lg border p-5 ${
                eligible
                  ? "border-rule bg-paper-raised lift-hover hover:border-verify"
                  : "border-rule bg-paper-inset/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <div className="min-w-0">
                  <p className={`title ${eligible ? "" : "text-ink-faint"}`}>
                    {purpose.label}
                  </p>
                  <p className="font-deva text-sm text-ink-faint">
                    {purpose.labelHi}
                  </p>
                </div>
                <span
                  className={`tag ${eligible ? "tag-ok" : "tag-neutral"}`}
                >
                  {eligible ? "Open to you" : "Not yet"}
                </span>
              </div>

              {eligible ? (
                <p className="figure text-2xl my-3">up to {rupees(ceiling)}</p>
              ) : (
                <p className="figure text-2xl my-3 text-ink-faint">—</p>
              )}

              <p className="text-sm text-ink-soft leading-relaxed mb-3">
                {reason}
              </p>

              <div className="pt-3 border-t border-rule space-y-1.5">
                <p className="text-sm text-ink-soft leading-relaxed">
                  {purpose.note}
                </p>
                <p className="num text-xs text-ink-faint">
                  {purpose.timesAllowed}
                  {purpose.minYears > 0 &&
                    ` · needs ${purpose.minYears} years of service`}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-sm text-ink-faint leading-relaxed measure mt-4">
        A good-faith reading of published EPF Scheme guidance on part
        withdrawal, computed against your own record. Not a ruling — the office
        decides, and the ceiling is a maximum rather than an entitlement.
      </p>
    </section>
  );
}
