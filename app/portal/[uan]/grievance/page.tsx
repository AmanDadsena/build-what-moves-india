import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { ESCALATION_LADDER } from "@/lib/escalation";
import { Tag } from "@/components/Provenance";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export default async function Grievance({
  params,
}: PageProps<"/portal/[uan]/grievance">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const rejected = member.claims.find((c) => c.status === "rejected");

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow section-mark">Grievance</p>
          <Tag kind="statutory" />
        </div>
        <h2 className="display-2 measure mb-3">
          Complaining is not one thing. It is a ladder, and only the top rung
          binds anyone.
        </h2>
        <p className="lede measure">
          You are told to raise a grievance. Nobody says which rung actually
          obliges an answer.
        </p>
      </section>

      <ol className="space-y-4">
        {ESCALATION_LADDER.filter((s) => s.id !== "refile").map((step) => {
          const hard = step.clock.kind === "hard";
          return (
            <li
              key={step.id}
              className={`border ${
                hard ? "border-stamp/50 bg-stamp-wash/25" : "border-rule"
              }`}
            >
              <div
                className={`px-5 py-3 border-b flex items-center justify-between gap-3 flex-wrap ${
                  hard
                    ? "border-stamp/30 bg-stamp-wash/50"
                    : "border-rule bg-paper-inset/50"
                }`}
              >
                <p className="eyebrow">
                  {step.order}. {step.channel}
                </p>
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
                  className={`border-l-2 pl-4 py-1 ${hard ? "border-stamp" : "border-rule-heavy"}`}
                >
                  <p className="eyebrow mb-1.5">When it lapses</p>
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
        <p className="eyebrow mb-2">Your drafts</p>
        {rejected ? (
          <>
            <p className="leading-relaxed max-w-2xl mb-4">
              Every document on this ladder — the employer letter, the EPFiGMS
              text, the CPGRAMS escalation and the RTI — is written for claim{" "}
              <span className="num">{rejected.id}</span> with your dates,
              employer and the exact remark already filled in.
            </p>
            <Link
              href={`/portal/${member.uan}/claims/${rejected.id}`}
              className="btn btn-primary btn-sm"
            >
              Open the documents
            </Link>
          </>
        ) : (
          <p className="leading-relaxed max-w-2xl">
            You have no rejected claim, so there is nothing to escalate. If a
            claim of yours fails later, its case file will generate every
            document on this ladder, filled in from your record.
          </p>
        )}
      </section>
    </div>
  );
}
