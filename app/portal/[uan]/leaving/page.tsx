import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { Tag } from "@/components/Provenance";
import { IconExit, IconTransfer, IconRecords, IconPension } from "@/components/Icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]/leaving">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} · Leaving a job`,
    description:
      "What to settle with your provident fund before you leave an employer, checked against your own record.",
  };
}

/* The five minutes that prevent most of this.

   Almost every failure the rest of this portal explains was created
   at one moment: the day somebody left a job. KYC that was never
   approved, an exit nobody recorded, a fund withdrawn when it should
   have been transferred — all of it is cheap to fix while you still
   work there and expensive afterwards, because the employer's login
   is the only place several of these can be done and your leverage
   over it ends with your notice period.

   Nothing here is new information. What is new is saying it before
   it matters rather than after. */

export default async function Leaving({
  params,
}: PageProps<"/portal/[uan]/leaving">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const unverified = member.records.filter((r) => r.verified === false);
  const months = member.passbook.length;
  const years = months / 12;
  const hasLeft = Boolean(member.dateOfExit);

  const steps = [
    {
      Icon: IconRecords,
      title: "Get your KYC approved while you still work there",
      hi: "नौकरी रहते KYC स्वीकृत कराएँ",
      body: "Bank, PAN and Aadhaar all need your employer to approve them in their own login. Once you have left, that approval depends on a company with no reason left to help you — and this single step is behind a large share of every rejection in this portal.",
      done: unverified.length === 0,
      doneText: "Every record on your file is approved. This one is settled.",
      todoText: `${unverified.length} of your records are still waiting on your employer. Chase this now, not later.`,
      href: "/records",
      cta: "See which are pending",
    },
    {
      Icon: IconExit,
      title: "Make sure your exit date gets recorded",
      hi: "निकास तिथि दर्ज कराना सुनिश्चित करें",
      body: "Your employer records this in their monthly filing. Many simply stop filing and never mark the exit, which leaves you shown as still employed and blocks every final settlement. You can record it yourself, but only two months after your last contribution.",
      done: hasLeft,
      doneText: "Your exit is on record. Nothing is blocked by this.",
      todoText: "Nothing on your file says you left. Ask in writing before your last day, and check the portal a month later.",
      href: "/exit",
      cta: "Check your exit status",
    },
    {
      Icon: IconTransfer,
      title: "Transfer, do not withdraw, if you will work again",
      hi: "फिर काम करेंगे तो निकालें नहीं, स्थानांतरित करें",
      body: "Withdrawing closes the account and resets your service to zero. Pension needs ten years of qualifying service and it need not be continuous — so a transfer keeps the clock running, and a withdrawal starts it again from nothing.",
      done: years >= 10,
      doneText: "You have already crossed ten years, so your pension entitlement is secure either way.",
      todoText: `You have ${years.toFixed(1)} years. Withdrawing now sets that back to zero for pension purposes.`,
      href: "/transfer",
      cta: "See what a transfer preserves",
    },
    {
      Icon: IconPension,
      title: "Write down your establishment code",
      hi: "प्रतिष्ठान कोड लिख लें",
      body: "It is on your payslip and it identifies which office holds your file. Every grievance, every RTI and every office visit needs it, and it becomes surprisingly hard to obtain once you no longer have access to a payslip.",
      done: true,
      doneText: `Yours is ${member.establishmentCode}. Save it somewhere you will still have in five years.`,
      todoText: "",
      href: "/records",
      cta: "See your record",
    },
  ];

  const outstanding = steps.filter((s) => !s.done).length;

  return (
    <div className="space-y-10 stagger">
      <section>
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <h2 className="eyebrow section-mark mb-0">Leaving a job</h2>
          <Tag kind="verified" />
        </div>
        <h2 className="display-2 measure mb-4">
          {outstanding === 0
            ? "You have settled everything that usually goes wrong."
            : `${outstanding} of these will cost you later if you leave them.`}
        </h2>
        <p className="lede measure">
          Almost every problem this portal explains was created on the day
          somebody left a job. All of it is cheap to fix while you still work
          there.
        </p>
      </section>

      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={step.title}>
            <div
              className={`border-2 rounded-xl overflow-hidden card-lift ${
                step.done ? "border-verify/30" : "border-pending/40"
              }`}
            >
              <div
                className={`flex items-center gap-3 px-5 py-3 border-b ${
                  step.done
                    ? "border-verify/20 bg-verify-wash"
                    : "border-pending/20 bg-pending-wash"
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-paper-raised shrink-0 ${
                    step.done ? "text-verify" : "text-pending"
                  }`}
                >
                  <step.Icon size={20} />
                </span>
                <p className="num text-sm font-bold text-ink-soft">
                  Step {i + 1} of {steps.length}
                </p>
                <span
                  className={`tag ml-auto ${step.done ? "tag-ok" : "tag-warn"}`}
                >
                  {step.done ? "Settled" : "Do this"}
                </span>
              </div>

              <div className="px-5 py-5 sm:px-6 bg-paper-raised">
                <h3 className="display-3 mb-1">{step.title}</h3>
                <p className="font-deva text-sm text-ink-faint mb-4">
                  {step.hi}
                </p>

                <p className="text-ink-soft leading-relaxed measure mb-4">
                  {step.body}
                </p>

                <p
                  className={`leading-relaxed measure mb-5 font-medium ${
                    step.done ? "text-verify" : "text-pending"
                  }`}
                >
                  {step.done ? step.doneText : step.todoText}
                </p>

                <Link
                  href={`/portal/${member.uan}${step.href}`}
                  className="btn btn-secondary btn-sm"
                >
                  {step.cta}
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="border border-rule-heavy bg-paper-raised rounded-lg p-6">
        <h3 className="display-3 mb-2">Already left, and something is stuck?</h3>
        <p className="text-ink-soft leading-relaxed measure mb-5">
          Then this list is behind you and the question is what to do now.
          Three questions will name it.
        </p>
        <Link
          href={`/portal/${member.uan}/ask`}
          className="btn btn-primary btn-sm"
        >
          Start the guided check
        </Link>
      </section>
    </div>
  );
}
