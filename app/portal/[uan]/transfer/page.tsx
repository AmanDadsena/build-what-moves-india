import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";
import { SimulatedAction } from "@/components/SimulatedAction";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

/* Mock result of a search against the member's Aadhaar for earlier
   provident fund accounts. In production this is a lookup EPFO
   already performs internally; here it is invented, like everything
   else about these members. */
const EARLIER_ACCOUNTS: Record<
  string,
  Array<{ establishment: string; period: string; months: number; balance: number }>
> = {
  "990012345678": [
    {
      establishment: "Ashwin Freight Carriers",
      period: "Aug 2017 — Feb 2021",
      months: 42,
      balance: 96_400,
    },
  ],
  "990055512340": [],
  "990087654321": [],
};

export default async function Transfer({
  params,
}: PageProps<"/portal/[uan]/transfer">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const earlier = EARLIER_ACCOUNTS[member.uan] ?? [];
  const found = earlier.length > 0;
  const extraMonths = earlier.reduce((s, a) => s + a.months, 0);
  const combined = member.passbook.length + extraMonths;

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow section-mark">Transfer &middot; Form 13</p>
          <Tag kind="mock" />
        </div>
        <h2 className="display-2 measure mb-3">
          {found
            ? `${earlier.length} earlier account still holds your money.`
            : "No other accounts are held against your Aadhaar."}
        </h2>
        <p className="lede measure">
          {found
            ? "Your service is split across two numbers. The balance is safe; your pension eligibility is counted separately, and that is the real loss."
            : "Your service sits under a single UAN. Nothing needs transferring, which also means your pension service is being counted in one place."}
        </p>
      </section>

      {found ? (
        <>
          <section>
            <p className="eyebrow mb-4">Found against your Aadhaar</p>
            <ul className="border border-rule divide-y divide-rule rounded-lg overflow-hidden">
              {earlier.map((a) => (
                <li key={a.establishment} className="bg-paper p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold mb-1">{a.establishment}</p>
                      <p className="num text-xs text-ink-faint">
                        {a.period} &middot; {a.months} months
                      </p>
                    </div>
                    <p className="figure text-lg shrink-0" data-numeric>
                      {rupees(a.balance)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* The argument that actually matters is the service count,
              not the balance. */}
          <section className="border border-pending/50 bg-pending-wash px-5 py-5">
            <p className="eyebrow mb-2">What the split is costing you</p>
            <dl className="grid sm:grid-cols-3 gap-4 mb-4">
              <Stat label="Counted here" value={`${member.passbook.length} mo`} />
              <Stat label="Sitting elsewhere" value={`${extraMonths} mo`} />
              <Stat
                label="If merged"
                value={`${combined} mo`}
                emphasis
              />
            </dl>
            <p className="text-sm leading-relaxed max-w-2xl">
              Pension eligibility needs 120 months of qualifying service.
              Counted separately, neither account reaches it. Merged, you would
              be at {combined} — {combined >= 120
                ? "past the line, which changes a one-time withdrawal into a pension for life."
                : `still ${120 - combined} months short, but the months are preserved rather than lost.`}
            </p>
          </section>

          <section>
            <p className="eyebrow mb-4">Transfer request</p>
            <div className="border border-rule-heavy bg-paper-raised rounded-lg p-5">
              <p className="leading-relaxed max-w-2xl mb-4">
                Form 13 moves the earlier balance and its service into this
                account. Where your e-KYC is fully verified this no longer needs
                your old employer to attest it.
              </p>
              <SimulatedAction
                label="Request transfer"
                what="A real Form 13 moves the earlier balance and, more importantly, its qualifying service into this account. Where your e-KYC is fully verified it no longer needs your old employer to attest it."
                href={`/portal/${member.uan}/pension`}
                hrefLabel="What the service is worth to your pension"
              />
            </div>
          </section>

          <Disclose label="Do this first" className="border-l-4 border-stamp bg-stamp-wash/40 rounded-lg px-5 py-4">
            <p className="text-ink-soft leading-relaxed max-w-2xl mb-3">
              Transfer before you file any withdrawal. A settlement computed on
              one account cannot be reopened to add the other, and the service
              in the account you left behind is simply not counted.
            </p>
            <Link
              href={`/portal/${member.uan}/pension`}
              className="btn btn-secondary btn-sm"
            >
              See what it does to your pension
            </Link>
          </Disclose>
        </>
      ) : (
        <section className="border-2 border-verify/30 bg-verify-wash rounded-lg px-5 py-5">
          <p className="leading-relaxed max-w-2xl">
            We searched for provident fund accounts registered against your
            Aadhaar and found only this one. If you have worked somewhere that
            deducted PF and it is not reflected here, that employer may have
            created a second UAN — raise it as a grievance rather than filing a
            transfer against an account that does not appear.
          </p>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <dt className="eyebrow mb-1.5">{label}</dt>
      <dd
        data-numeric
        className={`figure text-xl ${emphasis ? "text-verify" : "text-ink"}`}
      >
        {value}
      </dd>
    </div>
  );
}
