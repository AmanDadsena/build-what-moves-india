import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { Tag } from "@/components/Provenance";
import { ContributionChart } from "@/components/ContributionChart";
import { ComplianceCheck } from "@/components/ComplianceCheck";
import type { PassbookEntry } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]/passbook">) {
  const { uan } = await params;
  const member = getMember(uan);

  if (!member) return { title: "Member not found" };

  return {
    title: `${member.name} · Passbook`,
    description: `PF contribution history for ${member.name}.`,
  };
}

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

export default async function Passbook({ params }: PageProps<"/portal/[uan]">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  // Newest first: a member checking a passbook is almost always
  // looking at the recent months, not at their first year.
  const entries = [...member.passbook].reverse();
  const byYear = groupByYear(entries);
  const stopped = !member.dateOfExit && member.passbook.length > 0;
  const last = member.passbook[member.passbook.length - 1];

  return (
    <div className="space-y-8 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h2 className="eyebrow section-mark">Contributions</h2>
          <Tag kind="mock" />
        </div>
        <h2 className="display-2 measure mb-3">
          {member.passbook.length} months on record
        </h2>
        <p className="lede measure">
          Your 12%, your employer&rsquo;s 12%, and how much of theirs goes to
          instead of to your fund.
        </p>
      </section>

      <ContributionChart entries={member.passbook} stopped={stopped} />

      <ComplianceCheck member={member} />

      {stopped && (
        <p className="text-sm leading-relaxed border-l-4 border-stamp bg-stamp-wash/40 rounded-lg px-5 py-4 max-w-2xl">
          Contributions stop at {monthName(last.month)} and no exit was ever
          recorded. That gap is the reason your claim was rejected — and it was
          visible here months before anyone told you.
        </p>
      )}

      {byYear.map(([year, rows]) => (
        <section key={year}>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="num text-sm text-ink-faint">{year}</h3>
            <p className="num text-sm text-ink-soft" data-numeric>
              {rupees(
                rows.reduce(
                  (s, r) => s + r.employeeShare + r.employerShare,
                  0
                )
              )}{" "}
              added
            </p>
          </div>

          <div className="max-w-full border border-rule rounded-lg overflow-x-auto overscroll-x-contain">
            <table className="w-full text-sm min-w-[34rem]">
              <thead>
                <tr className="bg-paper-inset/60 text-left">
                  <th className="eyebrow font-normal px-4 py-2.5">Month</th>
                  <th className="eyebrow font-normal px-4 py-2.5 text-right">
                    Wages
                  </th>
                  <th className="eyebrow font-normal px-4 py-2.5 text-right">
                    Yours
                  </th>
                  <th className="eyebrow font-normal px-4 py-2.5 text-right">
                    Employer
                  </th>
                  <th className="eyebrow font-normal px-4 py-2.5 text-right">
                    Pension
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule num">
                {rows.map((e) => (
                  <tr key={e.month} className="bg-paper">
                    <td className="px-4 py-2.5 font-sans text-ink-soft">
                      {monthName(e.month)}
                    </td>
                    <td className="px-4 py-2.5 text-right" data-numeric>
                      {rupees(e.wages)}
                    </td>
                    <td className="px-4 py-2.5 text-right" data-numeric>
                      {rupees(e.employeeShare)}
                    </td>
                    <td className="px-4 py-2.5 text-right" data-numeric>
                      {rupees(e.employerShare)}
                    </td>
                    <td
                      className="px-4 py-2.5 text-right text-ink-faint"
                      data-numeric
                    >
                      {rupees(e.pensionShare)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function groupByYear(entries: PassbookEntry[]): Array<[string, PassbookEntry[]]> {
  const map = new Map<string, PassbookEntry[]>();
  for (const e of entries) {
    const year = e.month.slice(0, 4);
    const list = map.get(year);
    if (list) list.push(e);
    else map.set(year, [e]);
  }
  return [...map.entries()];
}

function monthName(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}
