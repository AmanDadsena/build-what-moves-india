import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { findMismatches } from "@/lib/diff";
import { MismatchCard } from "@/components/MismatchCard";
import { Tag } from "@/components/Provenance";
import type { FieldKey } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}


/* Only these can be corrected by joint declaration. Bank details and
   Aadhaar are changed elsewhere, and saying so here saves a member
   from filing the wrong instrument. */
const CORRECTABLE: FieldKey[] = ["name", "fatherName", "dateOfBirth", "gender"];

export default async function Correct({
  params,
}: PageProps<"/portal/[uan]/correct">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const pairs = member.records
    .filter((r) => r.source === "aadhaar" && CORRECTABLE.includes(r.field))
    .map((r) => ({ left: "epfo", right: r.source, field: r.field }));

  const mismatches = findMismatches(member.records, pairs).filter(
    (m) => m.severity !== "tolerated"
  );

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow section-mark">Corrections &middot; Joint Declaration</p>
          <Tag kind="verified" />
        </div>
        <h2 className="display-2 measure mb-3">
          {mismatches.length === 0
            ? "Nothing on your file needs correcting."
            : mismatches.length === 1
              ? "One field needs correcting before you claim."
              : `${mismatches.length} fields need correcting before you claim.`}
        </h2>
        <p className="lede measure">
          Changed by a joint declaration: one document, signed by you and
          countersigned by your employer.
        </p>
      </section>

      {mismatches.length > 0 ? (
        <>
          <section>
            <p className="eyebrow mb-4">What differs from your Aadhaar</p>
            <ul className="space-y-5">
              {mismatches.map((m, i) => (
                <MismatchCard key={i} mismatch={m} />
              ))}
            </ul>
          </section>

          <section>
            <p className="eyebrow mb-4">How the correction is made</p>
            <ol className="border border-rule divide-y divide-rule rounded-lg overflow-hidden">
              <Step
                n="01"
                who="You"
                whoClass="tag-ok"
                body="Decide which record is correct. Aadhaar is usually the one to keep, because PAN and your bank follow it — but for a date of birth, a school leaving certificate outranks Aadhaar."
              />
              <Step
                n="02"
                who="You"
                whoClass="tag-ok"
                body="Sign the joint declaration naming the field, the value currently held, and the value it should read. We generate it filled in from your record."
              />
              <Step
                n="03"
                who="Your employer"
                whoClass="tag-warn"
                body="Your employer countersigns and submits it through their EPFO login with your Aadhaar as proof. A declaration signed only by you will not be processed — this is the step that stalls."
              />
              <Step
                n="04"
                who="EPFO"
                whoClass="tag-danger"
                body="The regional office approves the change. Wait until it shows on your record before refiling any claim, or it will fail on the old value."
              />
            </ol>
          </section>

          <section className="border border-rule-heavy bg-paper-raised rounded-lg p-5">
            <p className="eyebrow mb-2">Your declaration</p>
            <p className="leading-relaxed max-w-2xl mb-4">
              A joint declaration written for this correction — with your UAN,
              establishment and the exact values already filled in — is
              generated inside the case file for your rejected claim, together
              with the letter that asks your employer to countersign it.
            </p>
            <Link
              href={`/portal/${member.uan}/claims`}
              className="btn btn-primary btn-sm"
            >
              Open your documents
            </Link>
          </section>
        </>
      ) : (
        <section className="border-2 border-verify/30 bg-verify-wash rounded-lg px-5 py-5">
          <p className="leading-relaxed max-w-2xl">
            Every correctable field on your record agrees with your Aadhaar.
            Nothing here would benefit from a joint declaration — if a claim of
            yours was still rejected, the cause lies elsewhere.
          </p>
        </section>
      )}
    </div>
  );
}

function Step({
  n,
  who,
  whoClass,
  body,
}: {
  n: string;
  who: string;
  whoClass: string;
  body: string;
}) {
  return (
    <li className="bg-paper p-5">
      <div className="flex items-start gap-4">
        <span className="num text-xs text-ink-faint pt-1 w-6 shrink-0">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <span
            className={`tag inline-block mb-2 ${whoClass}`}
          >
            {who}
          </span>
          <p className="leading-relaxed text-ink-soft">{body}</p>
        </div>
      </div>
    </li>
  );
}
