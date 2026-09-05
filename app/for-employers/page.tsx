import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { PageHero } from "@/components/PageHero";
import { ShareLink } from "@/components/ShareLink";
import { PrintButton } from "@/components/PrintButton";
import { DUTIES, employerBlockedCount } from "@/lib/employers";
import { getRejection } from "@/lib/rejections";

export const metadata = {
  title: "For employers — what only you can do",
  description:
    "A member has asked you to approve a KYC, record an exit date, sign a Joint Declaration or file a missing month. Here is why they cannot do it themselves, roughly where it lives, and what it costs while it waits.",
  alternates: { canonical: "/for-employers/" },
  openGraph: {
    title: "Five things only an employer can do",
    description:
      "The commonest reply to a member's request is 'please do it from your own login'. It is wrong, and it costs them another month.",
  },
};

/* Written for the person on the other end of the letter.
 *
 * This product drafts a request to an employer. It had nowhere for the
 * employer to read. That letter lands on an HR assistant who has not
 * done this before and does not know a member cannot do it themselves
 * — so the commonest outcome is not refusal but a reply saying "do it
 * from your own login", which is wrong and costs the member another
 * month.
 *
 * No accusation anywhere on this page. Somebody being asked is usually
 * not the person who caused it. */

export default function ForEmployers() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="For employers"
          provenance="verified"
          title="Five things a member cannot do without you."
          lede="Somebody has probably sent you this because they asked for one of them. Each is a single action in your establishment's login — and in every case the reason they cannot do it themselves is by design, not oversight."
          actions={
            <>
              <ShareLink
                onDark
                title="For employers — what only you can do"
                text="Why a provident fund member cannot approve their own KYC, exit date or correction."
              />
              <PrintButton label="Print this page" />
            </>
          }
        />

        <div className="shell-reading py-10 sm:py-14 space-y-12">
          <section className="border-l-4 border-noting bg-noting-wash/40 rounded-lg px-5 py-4">
            <p className="eyebrow mb-2">Why this page exists</p>
            <p className="leading-relaxed measure">
              Of the fifteen documented reasons a claim fails,{" "}
              <span className="num font-semibold">
                {employerBlockedCount()}
              </span>{" "}
              have at least one step that only the establishment can take. The
              member can start most of them; none of those can finish without
              you. The most common reply they get is that they should do it
              from their own login — which they cannot, and that answer costs
              them roughly a month each time.
            </p>
          </section>

          <ol className="space-y-6">
            {DUTIES.map((duty, index) => (
              <li
                key={duty.id}
                className="gold-top border border-rule-heavy bg-paper-raised rounded-xl overflow-hidden card-lift"
              >
                <div className="px-5 py-4 sm:px-6 bg-paper border-b border-rule">
                  <p className="flex items-baseline gap-3">
                    <span className="num text-xs text-ink-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="title leading-snug">{duty.ask}</span>
                  </p>
                  <p className="font-deva text-sm text-ink-faint mt-1 ml-8">
                    {duty.askHi}
                  </p>
                </div>

                <div className="px-5 py-5 sm:px-6 space-y-5">
                  <div>
                    <p className="eyebrow mb-1.5">Why they cannot do it</p>
                    <p className="leading-relaxed measure">
                      {duty.whyNotMember}
                    </p>
                  </div>

                  <div>
                    <p className="eyebrow mb-1.5">Where it lives</p>
                    <p className="text-sm text-ink-soft leading-relaxed measure">
                      {duty.where}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border-l-4 border-stamp bg-stamp-wash/40 rounded-lg px-4 py-3">
                      <p className="eyebrow mb-1.5">
                        What it costs them meanwhile
                      </p>
                      <p className="text-sm leading-relaxed">
                        {duty.costToMember}
                      </p>
                    </div>
                    <div className="border-l-4 border-pending bg-pending-wash/40 rounded-lg px-4 py-3">
                      <p className="eyebrow mb-1.5">What it costs you</p>
                      <p className="text-sm leading-relaxed">
                        {duty.costToEmployer}
                      </p>
                    </div>
                  </div>

                  {duty.resolves.length > 0 && (
                    <div className="pt-4 border-t border-rule">
                      <p className="eyebrow mb-2.5">
                        Rejections this one clears
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {duty.resolves.map((id) => {
                          const r = getRejection(id);
                          if (!r) return null;
                          return (
                            <li key={id}>
                              <Link
                                href={`/why/${id}/`}
                                className="press inline-block border border-rule rounded-full px-3 py-1.5 text-xs hover:border-noting hover:bg-noting-wash/50"
                              >
                                {r.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <section className="border border-rule-heavy bg-paper-raised rounded-xl p-6">
            <h2 className="display-3 mb-3">
              If you are the member, not the employer
            </h2>
            <p className="text-ink-soft leading-relaxed measure mb-5">
              Send them this page along with the letter. The letter says what
              you need; this says why you cannot do it yourself, which is the
              part that usually gets it moving.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Link href="/why/" className="btn btn-primary btn-sm">
                Find which one applies to you
              </Link>
              <Link href="/login/" className="btn btn-secondary btn-sm">
                Have the letter drafted
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
