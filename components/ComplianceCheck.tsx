import Link from "next/link";
import type { Member } from "@/lib/types";
import { checkCompliance } from "@/lib/compliance";
import { Tag } from "@/components/Provenance";
import { IconGrievance } from "@/components/Icons";
import { Illustration } from "@/components/Illustration";

/* Months your employer did not file.

   A deduction leaves a payslip the month it is taken and reaches the
   fund only when the establishment files it. Where those two come
   apart, nothing tells the member: the passbook has no row for that
   month, and an absent row looks like nothing rather than like
   something missing.

   This names it, values it, and points at the one channel that can
   compel an establishment — which is not the member. */

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function ComplianceCheck({ member }: { member: Member }) {
  const report = checkCompliance(member);

  if (report.missingMonths === 0) {
    return (
      <section>
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <p className="eyebrow section-mark mb-0">Employer deposits</p>
          <Tag kind="mock" />
        </div>
        <div className="border-2 border-verify/30 bg-verify-wash rounded-lg px-5 py-4">
          <p className="text-sm font-medium text-verify leading-relaxed">
            Every month between your first and last contribution is accounted
            for. {report.recorded} of {report.expected} expected months are on
            record.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <p className="eyebrow section-mark mb-0">Employer deposits</p>
        <Tag kind="mock" />
      </div>

      <div className="border-2 border-stamp/40 bg-paper-raised rounded-xl overflow-hidden card-lift">
        <div className="flex items-center gap-3 px-5 py-3 bg-stamp-wash border-b border-stamp/20">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-paper-raised text-stamp shrink-0">
            <IconGrievance size={20} />
          </span>
          <p className="text-sm font-bold text-stamp">
            {report.missingMonths}{" "}
            {report.missingMonths === 1 ? "month is" : "months are"} missing
            from your record
          </p>
        </div>

        <div className="px-5 py-6 sm:px-6">
          <p className="figure text-3xl sm:text-4xl mb-1.5">
            {rupees(report.estimatedValue)}
          </p>
          <h3 className="display-3 mb-5">
            was never filed against your account.
          </h3>

          <Illustration src="/img/compliance.webp" tone="pending" className="mb-5" />

          <ul className="border border-rule rounded-lg divide-y divide-rule mb-5">
            {report.gaps.map((gap) => (
              <li
                key={gap.from}
                className="px-4 py-3.5 flex items-baseline justify-between gap-4 flex-wrap"
              >
                <span className="num font-semibold">
                  {gap.months.length === 1
                    ? monthLabel(gap.from)
                    : `${monthLabel(gap.from)} — ${monthLabel(gap.to)}`}
                </span>
                <span className="num text-sm text-ink-soft">
                  {gap.months.length}{" "}
                  {gap.months.length === 1 ? "month" : "months"} &middot; about{" "}
                  {rupees(gap.estimatedValue)}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-ink-soft leading-relaxed measure mb-3">
            A gap does not always mean wrongdoing — unpaid leave and a break in
            employment both look identical here. But if you were working and
            being paid in those months, the deduction left your salary and did
            not arrive.
          </p>
          <p className="text-ink-soft leading-relaxed measure mb-5">
            You cannot compel an establishment to file. EPFO can, and a
            grievance naming your establishment code is how that starts.
          </p>

          <Link
            href={`/portal/${member.uan}/grievance`}
            className="btn btn-primary"
          >
            Raise it against the establishment
          </Link>
        </div>
      </div>
    </section>
  );
}
