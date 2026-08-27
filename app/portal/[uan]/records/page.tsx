import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { findMismatches } from "@/lib/diff";
import { MismatchCard } from "@/components/MismatchCard";
import { Tag } from "@/components/Provenance";
import type { FieldKey, RecordSource } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]/records">) {
  const { uan } = await params;
  const member = getMember(uan);

  if (!member) return { title: "Member not found" };

  return {
    title: `${member.name} · Records`,
    description: `EPFO, Aadhaar, PAN and bank record checks for ${member.name}.`,
  };
}

const SOURCE_LABEL: Record<RecordSource, string> = {
  epfo: "EPFO record",
  aadhaar: "Aadhaar",
  pan: "PAN",
  bank: "Bank account",
  employer: "Employer record",
};

const FIELD_LABEL: Record<FieldKey, string> = {
  name: "Name",
  fatherName: "Father's or husband's name",
  dateOfBirth: "Date of birth",
  gender: "Gender",
  accountNumber: "Account number",
  ifsc: "IFSC code",
  dateOfJoining: "Date of joining",
  dateOfExit: "Date of exit",
  uan: "UAN",
};

export default async function Records({ params }: PageProps<"/portal/[uan]">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  /* Compare every other source against what EPFO holds. EPFO's own
     record is the one that has to agree with the rest, because it is
     the one every claim is checked against. */
  const pairs = member.records
    .filter((r) => r.source !== "epfo")
    .filter((r) =>
      member.records.some((e) => e.source === "epfo" && e.field === r.field)
    )
    .map((r) => ({ left: "epfo", right: r.source, field: r.field }));

  const mismatches = findMismatches(member.records, pairs);
  const unverified = member.records.filter((r) => r.verified === false);

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow section-mark">Cross-check</p>
          <Tag kind="mock" />
        </div>
        <h2 className="display-2 measure mb-3">
          {mismatches.length === 0
            ? "Everything on your file agrees."
            : mismatches.length === 1
              ? "One record disagrees with EPFO. Fix it before you file."
              : `${mismatches.length} records disagree with EPFO.`}
        </h2>
        <p className="lede measure">
          The portal runs this same check and reports only pass or fail. This
          shows you the character.
        </p>
      </section>

      {mismatches.length > 0 && (
        <ul className="space-y-5">
          {mismatches.map((m, i) => (
            <MismatchCard key={i} mismatch={m} />
          ))}
        </ul>
      )}

      {unverified.length > 0 && (
        <section className="border-2 border-pending/30 bg-pending-wash rounded-lg px-5 py-4">
          <p className="eyebrow mb-2">Awaiting employer approval</p>
          <p className="text-sm leading-relaxed mb-3 max-w-2xl">
            These records were submitted but never approved in your
            employer&rsquo;s login. Nothing you do on your own account will
            clear them.
          </p>
          <ul className="text-sm space-y-1">
            {unverified.map((r, i) => (
              <li key={i}>
                {FIELD_LABEL[r.field]} &middot; {SOURCE_LABEL[r.source]}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <p className="eyebrow mb-4">Everything on file</p>
        <div className="max-w-full border border-rule rounded-lg overflow-x-auto overscroll-x-contain">
          <table className="w-full text-sm min-w-[30rem]">
            <thead>
              <tr className="bg-paper-inset/60 text-left">
                <th className="eyebrow font-normal px-4 py-2.5">Field</th>
                <th className="eyebrow font-normal px-4 py-2.5">Source</th>
                <th className="eyebrow font-normal px-4 py-2.5">Value</th>
                <th className="eyebrow font-normal px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {member.records.map((r, i) => (
                <tr key={i} className="bg-paper">
                  <td className="px-4 py-2.5 text-ink-soft">
                    {FIELD_LABEL[r.field]}
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {SOURCE_LABEL[r.source]}
                  </td>
                  <td className="px-4 py-2.5 machine">
                    {r.value || (
                      <span className="text-ink-faint italic font-sans">
                        not recorded
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs font-semibold ${
                        r.verified ? "text-verify" : "text-pending"
                      }`}
                    >
                      {r.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
