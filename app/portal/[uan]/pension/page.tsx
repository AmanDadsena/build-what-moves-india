import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { Tag } from "@/components/Provenance";
import { ProgressRing } from "@/components/ProgressRing";
import { Disclose } from "@/components/Motion";
import { Illustration } from "@/components/Illustration";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

/* Ten years of qualifying service is the line that decides whether a
   member receives a monthly pension for life or a one-time
   withdrawal. It is the single most consequential number in the
   scheme and the portal never states it plainly. */
const QUALIFYING_MONTHS = 120;

export default async function Pension({
  params,
}: PageProps<"/portal/[uan]/pension">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const months = member.passbook.length;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const qualified = months >= QUALIFYING_MONTHS;
  const shortBy = Math.max(0, QUALIFYING_MONTHS - months);

  return (
    <div className="space-y-9 stagger">
      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <h2 className="eyebrow section-mark">Pension &middot; EPS-95</h2>
            <Tag kind="verified" />
          </div>
          <h2 className="display-2 measure mb-3">
            {qualified
              ? "You have qualified for a monthly pension for life."
              : `You are ${shortBy} months short of a pension for life.`}
          </h2>
          <p className="lede measure">
            Ten years of qualifying service is the line between a pension for
            life and a one-time withdrawal.
          </p>
        </div>
        <Illustration
          src="/img/pension.webp"
          ratio="square"
          className="hidden lg:block justify-self-end max-w-64"
        />
      </section>

      {/* Qualifying service, as a ring. */}
      <section className="border border-rule-heavy bg-paper-raised rounded-lg card-lift p-6 sm:p-8">
        <ProgressRing months={months} target={QUALIFYING_MONTHS} />
      </section>

      <section className="grid gap-px bg-rule border border-rule rounded-lg overflow-hidden sm:grid-cols-2">
        <div className="bg-paper p-5">
          <p className="eyebrow mb-2">Pension contributions held</p>
          <p className="figure text-2xl mb-2" data-numeric>
            {rupees(member.balance.pensionShare)}
          </p>
          <p className="text-sm text-ink-soft leading-relaxed">
            Paid by your employer out of their 12%, capped at a wage ceiling of
            ₹15,000. This is separate from your provident fund and is not part
            of the balance you withdraw.
          </p>
        </div>
        <div className="bg-paper p-5">
          <p className="eyebrow mb-2">What you can claim now</p>
          <p className="figure text-2xl mb-2">
            {qualified ? "Form 10D" : "Form 10C"}
          </p>
          <p className="text-sm text-ink-soft leading-relaxed">
            {qualified
              ? "Monthly pension from the age of 58, or a reduced pension from 50. A scheme certificate preserves your service if you would rather keep it."
              : "Withdrawal benefit — a one-time payment of the pension component. Taking it ends your pension service entirely."}
          </p>
        </div>
      </section>

      {!qualified && (
        <Disclose label="Before you withdraw" className="border-l-4 border-noting bg-noting-wash/50 rounded-lg px-5 py-4">
          <p className="text-ink-soft leading-relaxed max-w-2xl mb-3">
            A scheme certificate under Form 10C keeps your {years}y {remainder}m
            on record instead of cashing it out. If you expect to work in
            EPF-covered employment again, that preserved service adds to your
            next spell and may carry you across ten years. Withdrawing resets
            it to zero.
          </p>
          <Link
            href={`/portal/${member.uan}/transfer`}
            className="btn btn-secondary btn-sm"
          >
            Check for other accounts first
          </Link>
        </Disclose>
      )}
    </div>
  );
}
