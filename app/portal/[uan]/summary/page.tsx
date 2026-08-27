import { notFound } from "next/navigation";
import { MEMBERS, getMember, corpus } from "@/lib/members";
import { getRejection } from "@/lib/rejections";
import { checkCompliance } from "@/lib/compliance";
import { findOffice } from "@/lib/offices";
import { PrintButton } from "@/components/PrintButton";
import { Tag } from "@/components/Provenance";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]/summary">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} · Case summary`,
    description:
      "One page carrying everything somebody helping with this claim would need.",
  };
}

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");
const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* One page to hand to whoever is helping.

   A great many members do not pursue this alone. A son fills the
   forms, a neighbour who is good with phones makes the calls, an NGO
   worker or a lawyer takes it on. Every one of them starts by
   assembling the same facts out of six different screens.

   This is those facts on one sheet, written to be printed and handed
   over — which is also why it carries no interface, only the record. */

export default async function Summary({
  params,
}: PageProps<"/portal/[uan]/summary">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const blocked = member.claims.find((c) => c.status === "rejected");
  const rejection = blocked?.rejectionId
    ? getRejection(blocked.rejectionId)
    : undefined;
  const compliance = checkCompliance(member);
  const office = findOffice(member.establishmentCode);
  const unverified = member.records.filter((r) => r.verified === false);
  const months = member.passbook.length;

  return (
    <div className="space-y-8 stagger">
      <section className="no-print">
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <p className="eyebrow section-mark mb-0">Case summary</p>
          <Tag kind="mock" />
        </div>
        <h2 className="display-2 measure mb-4">
          One page to hand to whoever is helping you.
        </h2>
        <p className="lede measure mb-5">
          Most people do not do this alone — a son fills the forms, a
          neighbour makes the calls, an NGO worker takes it on. Each of them
          starts by assembling the same facts from six different screens. This
          is all of them on one sheet.
        </p>
        <PrintButton label="Print this page" />
      </section>

      {/* The sheet itself */}
      <div
        data-print
        className="gold-top border border-rule-heavy bg-paper-raised rounded-xl overflow-hidden card-lift"
      >
        <div className="print-head">
          <p style={{ fontWeight: 700, fontSize: "12pt" }}>
            Provident fund case summary — {member.name}
          </p>
          <p style={{ fontSize: "9.5pt" }}>
            UAN {member.uan} · prepared {fmt(new Date().toISOString())}
          </p>
        </div>

        <div className="print-body px-5 py-6 sm:px-7 space-y-7">
          <Block title="Who this concerns">
            <Fact label="Name" value={member.name} />
            <Fact label="UAN" value={member.uan} mono />
            <Fact label="Employer" value={member.employer} />
            <Fact
              label="Establishment code"
              value={member.establishmentCode}
              mono
            />
            <Fact
              label="Office holding the file"
              value={office ? `${office.name}, ${office.city}` : "Not identified"}
            />
          </Block>

          <Block title="The account">
            <Fact label="Joined" value={fmt(member.dateOfJoining)} />
            <Fact
              label="Left"
              value={
                member.dateOfExit ? fmt(member.dateOfExit) : "Not recorded — see below"
              }
            />
            <Fact label="Months contributed" value={String(months)} mono />
            <Fact
              label="Withdrawable balance"
              value={rupees(corpus(member))}
              mono
            />
            <Fact
              label="Pension contributions"
              value={rupees(member.balance.pensionShare)}
              mono
            />
          </Block>

          {blocked && (
            <Block title="What is blocked">
              <Fact label="Claim" value={`${blocked.form} · ${blocked.id}`} mono />
              <Fact label="Filed on" value={fmt(blocked.filedOn)} />
              <Fact label="Amount" value={rupees(blocked.amount)} mono />
              <Fact
                label="Remark shown to the member"
                value={blocked.remark ?? "—"}
              />
              {rejection && (
                <>
                  <Fact label="What that actually means" value={rejection.title} />
                  <Fact
                    label="Whose action is required"
                    value={
                      rejection.whoMustAct === "member"
                        ? "The member"
                        : rejection.whoMustAct === "employer"
                          ? "The employer"
                          : "EPFO"
                    }
                  />
                </>
              )}
            </Block>
          )}

          {(unverified.length > 0 || !member.dateOfExit) && (
            <Block title="Open problems on the record">
              {!member.dateOfExit && (
                <Fact
                  label="Date of exit"
                  value="Never recorded by the employer. Blocks any final settlement."
                />
              )}
              {unverified.length > 0 && (
                <Fact
                  label="Unverified records"
                  value={`${unverified.length} awaiting employer approval. Every claim is checked against these.`}
                />
              )}
              {compliance.missingMonths > 0 && (
                <Fact
                  label="Months not filed"
                  value={`${compliance.missingMonths} months missing, about ${rupees(compliance.estimatedValue)} never deposited.`}
                />
              )}
            </Block>
          )}

          {rejection && (
            <Block title="What should happen next, in order">
              <ol className="space-y-2 mt-1">
                {rejection.fixSteps.map((s, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-3">
                    <span className="num font-bold shrink-0">{i + 1}.</span>
                    <span>
                      {s.instruction}{" "}
                      <span className="text-ink-faint">
                        ({s.actor === "member"
                          ? "member"
                          : s.actor === "employer"
                            ? "employer"
                            : "EPFO"}
                        , about {s.days} {s.days === 1 ? "day" : "days"}, at{" "}
                        {s.where})
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          <Block title="If nothing moves">
            <p className="text-sm leading-relaxed">
              The twenty-day settlement commitment restarts each time a desk
              returns the file, so it can be exceeded indefinitely without ever
              being formally breached. The only period that binds anybody is an
              RTI reply under section 7(1) of the Right to Information Act
              2005: thirty days, after which silence is a deemed refusal and a
              penalty of ₹250 a day, up to ₹25,000, can fall on the Public
              Information Officer personally.
            </p>
          </Block>
        </div>

        <div className="print-foot">
          <p>
            Produced by an independent prototype of a provident fund member
            portal. Not an official EPFO document and not legal advice. Every
            figure here is invented for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="display-3 mb-3 pb-2 border-b border-rule">{title}</h3>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="sm:flex sm:gap-4">
      <dt className="text-sm text-ink-soft sm:w-56 shrink-0">{label}</dt>
      <dd className={`text-sm leading-relaxed ${mono ? "num font-semibold" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
