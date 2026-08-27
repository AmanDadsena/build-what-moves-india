import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { getRejection } from "@/lib/rejections";
import type { ClaimStatus } from "@/lib/types";
import { IconRejected, IconClaims } from "@/components/Icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]/claims">) {
  const { uan } = await params;
  const member = getMember(uan);

  if (!member) return { title: "Member not found" };

  return {
    title: `${member.name} · Claims`,
    description: `PF claim history for ${member.name}.`,
  };
}

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

const STATUS: Record<ClaimStatus, { label: string; className: string }> = {
  settled: {
    label: "Settled",
    className: "tag-ok",
  },
  rejected: {
    label: "Rejected",
    className: "tag-danger",
  },
  "under-process": {
    label: "Under process",
    className: "tag-warn",
  },
};

export default async function Claims({ params }: PageProps<"/portal/[uan]">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const claims = [...member.claims].sort(
    (a, b) => +new Date(b.filedOn) - +new Date(a.filedOn)
  );

  return (
    <div className="space-y-8 stagger">
      <section>
        <p className="eyebrow mb-3">Claim history</p>
        <h2 className="display-2 measure mb-3">
          {claims.length} claim{claims.length === 1 ? "" : "s"} on your UAN
        </h2>
        <p className="lede measure">
          Open a rejected claim to see the reason behind the remark.
        </p>
      </section>

      <ul className="space-y-4">
        {claims.map((claim) => {
          const status = STATUS[claim.status];
          const rejection = claim.rejectionId
            ? getRejection(claim.rejectionId)
            : undefined;
          const isRejected = claim.status === "rejected";

          return (
            <li
              key={claim.id}
              className={`bg-paper-raised rounded-xl overflow-hidden card-lift border-2 ${
                isRejected ? "border-stamp/40" : "border-rule"
              }`}
            >
              <div
                className={`px-4 py-3 sm:px-5 border-b flex items-center gap-3 flex-wrap ${
                  isRejected
                    ? "border-stamp/25 bg-stamp-wash"
                    : "border-rule bg-paper-inset/60"
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-paper-raised shrink-0 ${
                    isRejected ? "text-stamp" : "text-verify"
                  }`}
                >
                  {isRejected ? (
                    <IconRejected size={19} />
                  ) : (
                    <IconClaims size={19} />
                  )}
                </span>
                <p className="num text-xs text-ink-soft flex-1 min-w-0">
                  {claim.id}
                </p>
                <span
                  className={`tag ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="px-4 py-5 sm:px-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="min-w-0">
                    <h3 className="display-3">{claim.type}</h3>
                    <p className="num text-xs text-ink-faint mt-1">
                      {claim.form} &middot; filed {fmt(claim.filedOn)}
                      {claim.settledOn && ` · paid ${fmt(claim.settledOn)}`}
                    </p>
                  </div>
                  <p className="figure text-lg shrink-0" data-numeric>
                    {rupees(claim.amount)}
                  </p>
                </div>

                {isRejected && (
                  <>
                    <div className="border border-rule bg-paper-raised px-4 py-3 mb-4">
                      <p className="eyebrow mb-1.5">Remark shown to you</p>
                      <p className="machine text-sm leading-snug">
                        {claim.remark}
                      </p>
                    </div>

                    {rejection && (
                      <p className="text-sm text-ink-soft leading-relaxed mb-4 max-w-2xl">
                        <span className="text-noting">Actually means:</span>{" "}
                        {rejection.title}.
                      </p>
                    )}

                    <Link
                      href={`/portal/${member.uan}/claims/${claim.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Open the case file
                    </Link>
                  </>
                )}

                {claim.status === "settled" && (
                  <>
                    <p className="text-sm text-ink-soft leading-relaxed mb-4">
                      Paid without objection. Nothing to do.
                    </p>
                    <Link
                      href={`/portal/${member.uan}/claims/${claim.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      See how it moved
                    </Link>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
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
