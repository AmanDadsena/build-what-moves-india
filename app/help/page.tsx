import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { Disclose } from "@/components/Motion";
import { Illustration } from "@/components/Illustration";
import { IconAsk, IconGrievance, IconCertificate, IconRecords } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Help & contact",
  description:
    "Who to contact about a provident fund claim, what to have ready before you call, and what to actually say.",
};

/* The screen a member reaches when everything else has failed.

   Public-service help pages list numbers. The hard part was never
   finding the number — it is knowing what to have in your hand when
   somebody picks up, and what to say so the call produces a reference
   instead of an assurance. */

const CHANNELS = [
  {
    Icon: IconAsk,
    tone: {
      ring: "hover:border-verify",
      tile: "text-verify group-hover:bg-verify-wash",
      dot: "bg-verify",
    },
    name: "Member helpline",
    detail: "1800 000 000",
    hours: "Mon–Fri, 9:30–18:00 IST",
    best: "Quick questions about status. They can read your file but cannot change it.",
    cannot: "Cannot approve KYC, correct a name, or overrule a rejection.",
  },
  {
    Icon: IconGrievance,
    tone: {
      ring: "hover:border-noting",
      tile: "text-noting group-hover:bg-noting-wash",
      dot: "bg-noting",
    },
    name: "EPFiGMS grievance",
    detail: "Online, against your establishment code",
    hours: "Any time",
    best: "Getting a dated reference number on your complaint.",
    cannot: "No enforceable deadline. Can be closed with a reply that resolves nothing.",
  },
  {
    Icon: IconCertificate,
    tone: {
      ring: "hover:border-pending",
      tile: "text-pending group-hover:bg-pending-wash",
      dot: "bg-pending",
    },
    name: "Regional office",
    detail: "The office holding your establishment code",
    hours: "Working hours, in person or by post",
    best: "Joint Declarations and anything needing a physical signature.",
    cannot: "Will not discuss another member's file, or accept a declaration signed only by you.",
  },
  {
    Icon: IconRecords,
    tone: {
      ring: "hover:border-stamp",
      tile: "text-stamp group-hover:bg-stamp-wash",
      dot: "bg-stamp",
    },
    name: "RTI to the CPIO",
    detail: "Written application, ₹10 fee",
    hours: "Reply due in 30 days",
    best: "The only route that legally compels an answer about your own file.",
    cannot: "Not a complaint channel — it obtains information, which is often what unlocks the rest.",
  },
];

const BEFORE_YOU_CALL = [
  "Your UAN, and your establishment code if you have it",
  "The claim ID and the date you filed",
  "The exact rejection remark, copied not paraphrased",
  "Any EPFiGMS or CPGRAMS reference number already raised",
  "A pen — you will be given a reference number and it is said once",
];

const FAQ = [
  {
    q: "How long should settlement actually take?",
    a: "The service commitment is twenty days. It restarts every time a desk marks your file incomplete, so elapsed time and counted time are rarely the same number. Only the RTI reply period — thirty days under section 7(1) — cannot be restarted.",
  },
  {
    q: "My employer has shut down. What now?",
    a: "You are not stuck. Where an establishment no longer exists, EPFO can process a claim on the basis of your own records and Aadhaar verification. Raise it as a grievance naming the establishment code, and say the employer is non-operational.",
  },
  {
    q: "Can I withdraw while still employed?",
    a: "Not a final settlement. An advance under Form 31 is available for specific purposes — illness, housing, education, marriage — each with its own limit. Filing Form 19 while in service is one of the most common avoidable rejections.",
  },
  {
    q: "Does raising a grievance slow my claim down?",
    a: "No. It is recorded separately from claim processing and does not send your file back to the start. The fear that it will is common and costs people months of silence.",
  },
  {
    q: "Is there a fee for any of this?",
    a: "No fee for claims, corrections or grievances. An RTI application costs ₹10, and nothing else. Anybody asking for a payment to release your provident fund is not from EPFO.",
  },
];

export default function Help() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Help & contact"
          provenance="verified"
          title="Reaching a person is the easy part. Knowing what to say is not."
          lede="Four ways to raise this, what each one can actually do, and what to have in your hand first."
          aside={
            <div className="rounded-lg bg-paper p-5 border border-paper/20">
              <Illustration src="/img/help.webp" priority />
            </div>
          }
        />

        <div className="shell py-10 sm:py-14 space-y-12 stagger">

          {/* Channels */}
          <section>
            <p className="eyebrow mb-4">Where to take it</p>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {CHANNELS.map((c) => (
                <li key={c.name}>
                  <div
                    className={`lift-hover group h-full border border-rule bg-paper-raised rounded-lg p-5 sm:p-6 ${c.tone.ring}`}
                  >
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-lg bg-paper-inset transition-colors mb-4 ${c.tone.tile}`}
                    >
                      <c.Icon size={22} />
                    </span>

                    <h2 className="title mb-1">{c.name}</h2>
                    <p className="text-sm font-semibold text-noting mb-4">
                      {c.detail}
                    </p>

                    <p className="text-sm text-ink-soft leading-relaxed mb-2 flex gap-2">
                      <span className="text-verify font-semibold shrink-0">
                        Good for
                      </span>
                      {c.best}
                    </p>
                    <p className="text-sm text-ink-soft leading-relaxed mb-4 flex gap-2">
                      <span className="text-stamp font-semibold shrink-0">
                        Cannot
                      </span>
                      {c.cannot}
                    </p>

                    <p className="flex items-center gap-2 text-sm text-ink-faint">
                      <span
                        aria-hidden
                        className={`h-1.5 w-1.5 rounded-full ${c.tone.dot}`}
                      />
                      {c.hours}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Before you call */}
          <section className="grid lg:grid-cols-2 gap-8">
            <div>
              <p className="eyebrow mb-4">Have these ready</p>
              <ul className="border border-rule divide-y divide-rule rounded-lg overflow-hidden">
                {BEFORE_YOU_CALL.map((item) => (
                  <li
                    key={item}
                    className="bg-paper px-5 py-3.5 flex items-start gap-3"
                  >
                    <span
                      aria-hidden
                      className="text-xs text-ink-faint pt-1"
                    >
                      □
                    </span>
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow mb-4">What to say</p>
              <div className="border border-rule-heavy bg-paper-raised rounded-lg overflow-hidden">
                <div className="border-b border-rule px-5 py-3">
                  <p className="eyebrow">Opening line</p>
                </div>
                <div className="px-5 py-5">
                  <p className="quoted text-lg leading-relaxed mb-4">
                    &ldquo;My claim under Form 19 against UAN [number] was
                    rejected on [date]. The remark says [exact words]. I need to
                    know which specific field failed and what value it was
                    compared against.&rdquo;
                  </p>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    Ask for a reference number before the call ends, and write
                    down the name of the person you spoke to. A call with no
                    reference number did not happen as far as the file is
                    concerned.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <p className="eyebrow mb-4">Questions people actually ask</p>
            <ul className="border border-rule divide-y divide-rule rounded-lg overflow-hidden">
              {FAQ.map((item) => (
                <li key={item.q} className="bg-paper px-5 py-4">
                  <Disclose label={item.q}>
                    <p className="text-ink-soft leading-relaxed measure">
                      {item.a}
                    </p>
                  </Disclose>
                </li>
              ))}
            </ul>
          </section>

          {/* The people least likely to find this on their own */}
          <section className="border-2 border-noting/40 bg-paper-raised rounded-lg p-6">
            <p className="eyebrow section-mark mb-3">
              If you are calling on behalf of somebody who has died
            </p>
            <h2 className="display-3 measure mb-3">
              Three things are owed, and most families claim one.
            </h2>
            <p className="text-ink-soft leading-relaxed measure mb-5">
              The fund balance, a monthly pension and an insurance payment are
              three separate claims with three separate forms. The ten-year
              service rule does not apply to a death in service, whatever you
              may have been told.
            </p>
            <Link href="/after-a-death/" className="btn btn-primary btn-sm">
              What a family is owed, and how to claim it
            </Link>
          </section>

          <section className="border border-rule-heavy bg-paper-raised rounded-lg p-6">
            <h2 className="display-3 mb-2">Still not sure what your problem is?</h2>
            <p className="text-ink-soft leading-relaxed measure mb-5">
              Answer three questions and we will name it, then point you at the
              screen that fixes it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/portal/990012345678/ask"
                className="btn btn-primary btn-sm"
              >
                Start the guided check
              </Link>
              <Link href="/offices" className="btn btn-secondary btn-sm">
                Find your office
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
