import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default async function MarkExit({
  params,
}: PageProps<"/portal/[uan]/exit">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const last = member.passbook[member.passbook.length - 1];
  const [ly, lm] = last.month.split("-").map(Number);

  /* A member may record their own exit once two months have passed
     since the last contribution. Almost nobody is told this exists,
     so the useful thing is not the button — it is the date. */
  const lastContribution = new Date(ly, lm - 1, 1);
  const eligibleFrom = new Date(ly, lm + 1, 1);
  const eligibleNow = Date.now() >= eligibleFrom.getTime();

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow section-mark">Mark your exit</p>
          <Tag kind="verified" />
        </div>
        <h2 className="display-2 measure mb-3">
          {member.dateOfExit
            ? "Your exit is already recorded."
            : "Your employer never recorded that you left. You can do it yourself."}
        </h2>
        <p className="lede measure">
          {member.dateOfExit
            ? "Nothing here needs your attention. This page exists for the far more common case where an employer simply stops filing and never marks the exit."
            : "You can record your own exit without the employer, two months after your last contribution. Almost nobody is told this."}
        </p>
      </section>

      <section className="grid gap-px bg-rule border border-rule rounded-lg overflow-hidden sm:grid-cols-3">
        <Cell label="Last contribution" value={fmt(lastContribution)} />
        <Cell
          label="Exit recorded by employer"
          value={member.dateOfExit ? fmt(new Date(member.dateOfExit)) : "Never"}
          alarm={!member.dateOfExit}
        />
        <Cell
          label="You may self-record from"
          value={fmt(eligibleFrom)}
          good={eligibleNow && !member.dateOfExit}
        />
      </section>

      {!member.dateOfExit && (
        <>
          <section
            className={`border px-5 py-5 ${
              eligibleNow
                ? "border-verify/50 bg-verify-wash"
                : "border-pending/50 bg-pending-wash"
            }`}
          >
            <p className="eyebrow mb-2">
              {eligibleNow ? "You are eligible today" : "Not yet eligible"}
            </p>
            <p className="leading-relaxed max-w-2xl">
              {eligibleNow
                ? `Two months have passed since ${fmt(lastContribution)}. You can record your exit yourself, without waiting for your employer to do anything.`
                : `You become eligible on ${fmt(eligibleFrom)}. Until then only your employer can record it, so write to them in the meantime.`}
            </p>
          </section>

          <section>
            <p className="eyebrow mb-4">Record your exit</p>
            <div className="border border-rule-heavy bg-paper-raised p-5 space-y-5">
              <Field label="Date you actually left">
                <p className="num text-base">
                  {fmt(new Date(ly, lm, 0))}
                  <span className="font-sans text-sm text-ink-faint">
                    {" "}
                    — last day of your final contributing month
                  </span>
                </p>
              </Field>

              <Field label="Reason for leaving">
                <p className="text-base">
                  Cessation (short service)
                  <span className="text-sm text-ink-faint">
                    {" "}
                    — the usual entry for a resignation
                  </span>
                </p>
              </Field>

              <Field label="Verification">
                <p className="text-base text-ink-soft">
                  Aadhaar OTP, simulated in this prototype
                </p>
              </Field>

              <button
                disabled={!eligibleNow}
                className="btn btn-primary"
              >
                Record exit
              </button>
              <p className="text-sm text-ink-faint leading-relaxed">
                Simulated. Nothing is submitted to any government system.
              </p>
            </div>
          </section>

          <Disclose label="Why this matters" className="border-l-4 border-noting bg-noting-wash/50 rounded-lg px-5 py-4">
            <p className="text-ink-soft leading-relaxed max-w-2xl mb-3">
              While no exit is recorded, EPFO reads your file as continuing
              service. A final settlement cannot be paid to someone who is, on
              paper, still employed — so every claim you file will be rejected
              for this reason, however correct the rest of your record is.
            </p>
            <Link
              href={`/portal/${member.uan}/file`}
              className="btn btn-secondary btn-sm"
            >
              Run the pre-flight check
            </Link>
          </Disclose>
        </>
      )}
    </div>
  );
}

function Cell({
  label,
  value,
  alarm,
  good,
}: {
  label: string;
  value: string;
  alarm?: boolean;
  good?: boolean;
}) {
  return (
    <div className="bg-paper px-4 py-3.5">
      <p className="eyebrow mb-1.5">{label}</p>
      <p
        data-numeric
        className={`num text-base ${
          alarm ? "text-stamp" : good ? "text-verify" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      {children}
    </div>
  );
}
