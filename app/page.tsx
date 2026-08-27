import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { SignInCard } from "@/components/SignInCard";
import { HeroArt } from "@/components/HeroArt";
import {
  SERVICE_ICONS,
  IconPassbook,
  IconWithdraw,
  IconRejected,
  IconNominee,
  IconTransfer,
  IconPension,
} from "@/components/Icons";
import { servicesByCategory } from "@/lib/services";
import { Ticker } from "@/components/Ticker";

const DEMO_UAN = "990012345678";

/* The landing page of a public-service portal.

   Structurally it is what these homepages always are — sign in, the
   things people came to do, services, notices — because members
   already know that shape. What changes is that it opens with a
   picture of the actual problem rather than a stock photograph of
   strangers, every task is one tap rather than nine rotating through
   a carousel, and each service says what we changed about it. */

const TASKS = [
  { href: "/passbook", label: "Check your balance", labelHi: "बैलेंस देखें", Icon: IconPassbook },
  { href: "/file", label: "Withdraw your PF", labelHi: "पीएफ निकालें", Icon: IconWithdraw },
  { href: "/claims", label: "Why was my claim rejected", labelHi: "दावा क्यों अस्वीकृत", Icon: IconRejected },
  { href: "/nomination", label: "Name a nominee", labelHi: "नामांकन करें", Icon: IconNominee },
  { href: "/transfer", label: "Transfer an old account", labelHi: "पुराना खाता जोड़ें", Icon: IconTransfer },
  { href: "/pension", label: "Check pension service", labelHi: "पेंशन सेवा देखें", Icon: IconPension },
];

export default function Home() {
  const groups = servicesByCategory();

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* ================= HERO ================= */}
        <section className="border-b border-rule bg-paper-raised overflow-hidden">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-12 pb-12 sm:pt-20 sm:pb-20">
            <div className="grid lg:grid-cols-[1fr_1.12fr] gap-10 lg:gap-14 items-center">
              <div>
                <p className="eyebrow mb-4">
                  Employees&rsquo; Provident Fund &middot; member services
                </p>

                <h1 className="display-1 mb-5">
                  Your provident fund. And, for once, a straight answer about
                  it.
                </h1>

                <p className="lede measure mb-8">
                  Check your balance, file a claim, name a nominee. And when a
                  claim is rejected, find out what actually went wrong — in
                  words that tell you what to fix.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <Link href="/login" className="btn btn-primary btn-lg">
                    Sign in to your account
                  </Link>
                  <Link href="/services" className="btn btn-secondary btn-lg">
                    Browse all services
                  </Link>
                </div>

                {/* Three promises a member can check for themselves in
                    the first ten seconds — worth more here than another
                    paragraph of description. */}
                <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
                  {[
                    ["Works on any phone", "var(--color-verify)"],
                    ["Hindi and English", "var(--color-noting)"],
                    ["Nothing to install", "var(--color-ochre-deep)"],
                  ].map(([text, colour]) => (
                    <li key={text} className="flex items-center gap-2 text-sm text-ink-soft">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: colour }}
                      />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:-mr-6">
                <HeroArt className="w-full h-auto max-w-[42rem] mx-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* ================= SCALE ================= */}
        <section className="border-b border-rule bg-paper">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8">
            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
              <p className="eyebrow">EPFO &middot; 2024&ndash;25</p>
              <Figure value="796 lakh" label="claims filed" />
              <Figure value="174 lakh" label="rejected" accent />
              <Figure value="21.9%" label="about one in five" />
              <Figure value="one line" label="of explanation each" />
            </div>
          </div>
        </section>

        <Ticker />

        {/* ================= TASKS + SIGN IN ================= */}
        <section className="border-b border-rule">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-start">
              <div>
                <p className="eyebrow section-mark mb-2">Common tasks</p>
                <h2 className="display-2 measure mb-6">
                  The six things people actually come here to do.
                </h2>

                {/* All visible at once. The original rotates nine of
                    these through a carousel, which hides eight and
                    moves the one you were reading. */}
                <ul className="grid sm:grid-cols-2 gap-px bg-rule border border-rule rounded-lg overflow-hidden">
                  {TASKS.map(({ href, label, labelHi, Icon }) => (
                    <li key={href} className="bg-paper">
                      <Link
                        href={`/portal/${DEMO_UAN}${href}`}
                        className="press flex items-start gap-3.5 px-5 py-4 hover:bg-paper-raised h-full group"
                      >
                        <span className="text-noting mt-0.5 shrink-0 transition-transform group-hover:-translate-y-0.5">
                          <Icon size={22} />
                        </span>
                        <span className="min-w-0">
                          <span className="block title">{label}</span>
                          <span className="block font-deva text-sm text-ink-faint mt-0.5">
                            {labelHi}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:sticky lg:top-24">
                <SignInCard />
              </div>
            </div>
          </div>
        </section>

        {/* ================= THE DECODER ================= */}
        <section className="border-b border-rule bg-paper-raised">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div>
                <p className="eyebrow section-mark mb-3">
                  Reject Kyun? &middot; रिजेक्ट क्यों?
                </p>
                <h2 className="display-2 measure-tight mb-4">
                  The portal gives you one sentence. We give you the reason.
                </h2>
                <p className="lede measure-tight mb-6">
                  We name the failure, show the exact character that differs
                  across your records, rebuild the desks your file passed, and
                  draft every letter you can send — including the RTI that
                  legally compels an answer.
                </p>
                <Link
                  href={`/portal/${DEMO_UAN}/claims/CLM26061101`}
                  className="btn btn-primary"
                >
                  Open a rejected claim
                </Link>
              </div>

              <div className="space-y-3">
                <div className="border border-rule bg-paper rounded-lg px-5 py-4">
                  <p className="eyebrow mb-2">What the portal says</p>
                  <p className="machine text-sm leading-snug text-ink-soft">
                    Claim rejected: Demographic discrepancy in EPFO portal
                  </p>
                </div>

                <div
                  aria-hidden
                  className="flex justify-center text-ink-faint text-lg leading-none"
                >
                  ↓
                </div>

                <div className="border-2 border-noting/30 bg-noting-wash rounded-lg px-5 py-4">
                  <p className="eyebrow mb-2 text-noting">What it means</p>
                  <p className="text-lg leading-snug">
                    Your Aadhaar says Rajesh Kumar{" "}
                    <mark className="bg-paper-raised text-noting px-1.5 rounded font-semibold">
                      Singh
                    </mark>
                    . Your PF record stops at Kumar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section id="services" className="border-b border-rule scroll-mt-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
            <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
              <div>
                <p className="eyebrow section-mark mb-2">Services</p>
                <h2 className="display-2 measure">
                  Everything a member needs, and what we changed about each.
                </h2>
              </div>
              <Link href="/services" className="btn btn-secondary btn-sm shrink-0">
                See the A&ndash;Z
              </Link>
            </div>

            <div className="space-y-10">
              {groups.map(([category, services]) => (
                <div key={category}>
                  <p className="eyebrow mb-4">{category}</p>
                  <ul className="grid gap-px bg-rule border border-rule rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((s) => {
                      const Icon = SERVICE_ICONS[s.id];
                      return (
                        <li key={s.id} className="bg-paper">
                          <Link
                            href={`/portal/${DEMO_UAN}${s.path}`}
                            className="press block h-full p-5 hover:bg-paper-raised group"
                          >
                            {Icon && (
                              <span className="block text-noting mb-3 transition-transform group-hover:-translate-y-0.5">
                                <Icon size={24} />
                              </span>
                            )}
                            <h3 className="title mb-1">{s.title}</h3>
                            <p className="font-deva text-sm text-ink-faint mb-2.5">
                              {s.titleHi}
                            </p>
                            <p className="text-sm text-ink-soft leading-relaxed mb-3">
                              {s.blurb}
                            </p>
                            <p className="text-sm text-noting leading-relaxed">
                              {s.change}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= NOTICES ================= */}
        <section className="border-b border-rule bg-paper-raised">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
            <p className="eyebrow section-mark mb-2">Worth knowing</p>
            <h2 className="display-2 measure mb-8">
              Things that affect your money which nobody tells you.
            </h2>

            <ul className="grid gap-px bg-rule border border-rule rounded-lg overflow-hidden lg:grid-cols-3">
              <Notice
                tag="A right you may not know"
                title="You can record your own exit date"
                body="Two months after your last contribution you no longer need your employer to mark that you left. Most members are never told, and wait indefinitely for a company that has stopped replying."
                href={`/portal/${DEMO_UAN}/exit`}
                cta="Check your dates"
              />
              <Notice
                tag="Costs you silently"
                title="A second UAN can cost you a pension"
                body="Pension needs ten years of qualifying service. Split across two account numbers neither may reach it — and a settlement paid on one cannot be reopened to count the other."
                href={`/portal/${DEMO_UAN}/transfer`}
                cta="Search for old accounts"
              />
              <Notice
                tag="The only real deadline"
                title="One clock has a penalty behind it"
                body="The twenty-day settlement commitment restarts every time a desk marks your file incomplete. An RTI reply does not: thirty days, then a deemed refusal and a penalty against the officer personally."
                href={`/portal/${DEMO_UAN}/grievance`}
                cta="See the ladder"
              />
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

/* ------------------------------------------------------------------ */

function Figure({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <p className="flex items-baseline gap-2">
      <span
        className={`text-xl sm:text-2xl font-semibold tracking-[-0.02em] ${
          accent ? "text-stamp" : "text-ink"
        }`}
        data-numeric
      >
        {value}
      </span>
      <span className="text-sm text-ink-soft">{label}</span>
    </p>
  );
}

function Notice({
  tag,
  title,
  body,
  href,
  cta,
}: {
  tag: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <li className="bg-paper p-6 flex flex-col">
      <p className="text-xs font-semibold text-stamp mb-3">{tag}</p>
      <h3 className="display-3 mb-2.5">{title}</h3>
      <p className="text-sm text-ink-soft leading-relaxed mb-5 flex-1">{body}</p>
      <Link href={href} className="btn btn-secondary btn-sm self-start">
        {cta}
      </Link>
    </li>
  );
}
