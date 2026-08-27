import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember, corpus } from "@/lib/members";
import { getRejection } from "@/lib/rejections";
import { Tag } from "@/components/Provenance";
import { BentoTile } from "@/components/Bento";
import {
  IconPassbook,
  IconWithdraw,
  IconRejected,
  IconNominee,
  IconRecords,
  IconExit,
} from "@/components/Icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} · Overview`,
    description: `PF balance, claim status and record checks for ${member.name}.`,
  };
}

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

/* The first screen after signing in.

   It follows the same language as the public pages — icon tiles,
   lifting cards, the same figure style and the same colour meanings —
   because a member who signs in has not arrived somewhere else. The
   difference is what it leads with: a blocked claim, not a menu. */

export default async function Overview({ params }: PageProps<"/portal/[uan]">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const blocked = member.claims.filter((c) => c.status === "rejected");
  const lastEntry = member.passbook[member.passbook.length - 1];
  const unverified = member.records.filter((r) => r.verified === false);

  const shortcuts = [
    { href: "/passbook", label: "Passbook", hi: "पासबुक", Icon: IconPassbook },
    { href: "/file", label: "File a claim", hi: "दावा दाखिल करें", Icon: IconWithdraw },
    { href: "/records", label: "Your records", hi: "अभिलेख", Icon: IconRecords },
    { href: "/nomination", label: "Nomination", hi: "नामांकन", Icon: IconNominee },
  ];

  return (
    <div className="space-y-10 stagger">
      {/* ---- What needs attention ----
          The original portal shows a rejection as one row in a table.
          Here it is the first thing on the screen, because it is the
          only thing on the screen the member can act on. */}
      {blocked.length > 0 && (
        <section>
          <p className="eyebrow section-mark mb-4">Needs your attention</p>

          {blocked.map((claim) => {
            const rejection = claim.rejectionId
              ? getRejection(claim.rejectionId)
              : undefined;
            return (
              <div
                key={claim.id}
                className="border-2 border-stamp/45 bg-paper-raised rounded-xl overflow-hidden card-lift"
              >
                <div className="flex items-center gap-3 px-5 py-3 bg-stamp-wash border-b border-stamp/20">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-paper-raised text-stamp shrink-0">
                    <IconRejected size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stamp">
                      Claim rejected
                    </p>
                    <p className="text-xs text-ink-soft">
                      {claim.form} &middot; {claim.id} &middot; filed{" "}
                      {fmt(claim.filedOn)}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-6 sm:px-6">
                  <p className="figure text-3xl sm:text-4xl mb-1.5">
                    {rupees(claim.amount)}
                  </p>
                  <h2 className="display-3 mb-5">is not coming to you.</h2>

                  <div className="border border-rule bg-paper rounded-lg px-4 py-3 mb-4">
                    <p className="eyebrow mb-1.5">The portal told you</p>
                    <p className="machine text-sm leading-snug text-ink-soft">
                      {claim.remark}
                    </p>
                  </div>

                  {rejection && (
                    <div className="border-2 border-noting/25 bg-noting-wash rounded-lg px-4 py-3 mb-6">
                      <p className="eyebrow mb-1.5 text-noting">
                        What that actually means
                      </p>
                      <p className="leading-relaxed font-medium">
                        {rejection.title}
                      </p>
                    </div>
                  )}

                  <Link
                    href={`/portal/${member.uan}/claims/${claim.id}`}
                    className="btn btn-primary"
                  >
                    Find out why, and what to send
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ---- Balance ---- */}
      <section>
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <p className="eyebrow section-mark mb-0">Your balance</p>
          <Tag kind="mock" />
        </div>

        <div className="border border-rule bg-paper-raised rounded-xl overflow-hidden card-lift">
          <div className="px-5 py-6 sm:px-6 border-b border-rule">
            <p className="eyebrow mb-2">Withdrawable provident fund</p>
            <p className="figure text-4xl sm:text-5xl">
              {rupees(corpus(member))}
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-rule">
            <Cell
              label="Your contributions"
              value={rupees(member.balance.employeeShare)}
            />
            <Cell
              label="Employer contributions"
              value={rupees(member.balance.employerShare)}
            />
            <Cell
              label="Pension (EPS)"
              value={rupees(member.balance.pensionShare)}
              note="Held separately, not part of the amount above"
            />
          </dl>
        </div>
      </section>

      {/* ---- Quick links, matching the landing's task grid ---- */}
      <section>
        <p className="eyebrow section-mark mb-4">Go straight to</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map(({ href, label, hi, Icon }) => (
            <li key={href} className="contents">
              <BentoTile
                href={`/portal/${member.uan}${href}`}
                title={label}
                titleHi={hi}
                Icon={Icon}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Service ---- */}
      <section>
        <p className="eyebrow section-mark mb-4">Your service</p>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule border border-rule rounded-lg overflow-hidden">
          <Cell label="Joined" value={fmt(member.dateOfJoining)} />
          <Cell
            label="Left"
            value={member.dateOfExit ? fmt(member.dateOfExit) : "Not recorded"}
            alarm={!member.dateOfExit}
          />
          <Cell
            label="Months contributed"
            value={String(member.passbook.length)}
          />
          <Cell
            label="Last contribution"
            value={lastEntry ? monthName(lastEntry.month) : "—"}
          />
        </dl>

        {!member.dateOfExit && (
          <div className="mt-4 border-2 border-stamp/30 bg-stamp-wash/40 rounded-lg px-5 py-4 flex items-start gap-3.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-paper-raised text-stamp shrink-0">
              <IconExit size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-bold mb-1">
                Your employer never recorded that you left
              </p>
              <p className="text-sm leading-relaxed measure mb-3">
                On paper you are still working here, and a final settlement
                cannot be paid to somebody still employed — whatever else is
                correct on your file.
              </p>
              <Link
                href={`/portal/${member.uan}/exit`}
                className="btn btn-secondary btn-sm"
              >
                Record it yourself
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ---- Verification ---- */}
      <section>
        <p className="eyebrow section-mark mb-4">Verification status</p>
        {unverified.length === 0 ? (
          <div className="border-2 border-verify/30 bg-verify-wash rounded-lg px-5 py-4 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-paper-raised text-verify shrink-0">
              <IconRecords size={20} />
            </span>
            <p className="text-sm font-medium text-verify">
              Every record on your file is verified.
            </p>
          </div>
        ) : (
          <div className="border-2 border-pending/30 bg-pending-wash rounded-lg px-5 py-4 flex items-start gap-3.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-paper-raised text-pending shrink-0">
              <IconRecords size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-bold mb-1">
                {unverified.length}{" "}
                {unverified.length === 1 ? "record is" : "records are"} still
                unverified
              </p>
              <p className="text-sm leading-relaxed measure mb-3">
                Every claim is checked against these, so an unverified record is
                a rejection waiting to happen.
              </p>
              <Link
                href={`/portal/${member.uan}/records`}
                className="btn btn-secondary btn-sm"
              >
                See which ones
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Cell({
  label,
  value,
  note,
  alarm,
}: {
  label: string;
  value: string;
  note?: string;
  alarm?: boolean;
}) {
  return (
    <div className="bg-paper-raised px-5 py-4">
      <dt className="eyebrow mb-1.5">{label}</dt>
      <dd
        data-numeric
        className={`figure-sm text-base ${alarm ? "text-stamp" : "text-ink"}`}
      >
        {value}
      </dd>
      {note && (
        <p className="text-xs text-ink-faint mt-1.5 leading-relaxed">{note}</p>
      )}
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function monthName(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}
