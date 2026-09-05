import Link from "next/link";
import { notFound } from "next/navigation";
import { REJECTIONS, getRejection } from "@/lib/rejections";
import { TranslatedTitle } from "@/components/RejectionTitle";
import { DOCUMENTS } from "@/lib/documents";
import { DESK_LABEL, type Actor } from "@/lib/types";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";
import { EmployerGoneNote } from "@/components/EmployerGoneNote";
import { ReadAloud } from "@/components/ReadAloud";
import { ShareLink } from "@/components/ShareLink";
import { PrintButton } from "@/components/PrintButton";

export const dynamicParams = false;

export function generateStaticParams() {
  return REJECTIONS.map((r) => ({ reason: r.id }));
}

/* One public page per rejection reason.
 *
 * Everything else in this product needs a member to be inside it. This
 * does not, and that is the whole point of it. About 174 lakh claims
 * were rejected in a single year, and the first thing a person does
 * with a sentence they do not understand is type it into a search box.
 * Today that search returns forums, agents advertising their services,
 * and sites impersonating the portal. It should return an explanation.
 *
 * So each of these pages is titled with the remark itself rather than
 * with anything clever, carries the other phrasings the same fault
 * appears under, and answers the question in the first paragraph
 * rather than after an introduction. The structured data marks it as a
 * question and answer for the same reason: a member who never clicks
 * through should still see the real meaning in the results.
 *
 * They are also the shareable form. A member can send one link to
 * whoever is helping them, which is not true of anything behind a
 * sign-in.
 */

export async function generateMetadata({
  params,
}: PageProps<"/why/[reason]">) {
  const { reason } = await params;
  const r = getRejection(reason);
  if (!r) return { title: "Not found" };

  return {
    /* Absolute, so the site template does not append itself. A search
       result truncates around sixty characters, and the remark is the
       whole reason somebody clicks — losing its tail to a suffix
       nobody searched for would defeat the page. */
    title: { absolute: `${r.verbatim[0]} — what it means` },
    description: `${r.plain} Whose action is needed, the steps in order, and how long it usually takes.`,
    alternates: { canonical: `/why/${r.id}/` },
    openGraph: {
      title: `"${r.verbatim[0]}"`,
      description: r.plain,
    },
  };
}

const ACTOR: Record<Actor, { who: string; note: string; tag: string }> = {
  member: {
    who: "You",
    note: "Nobody else is holding this up. It can be fixed from your side.",
    tag: "tag-ok",
  },
  employer: {
    who: "Your employer",
    note: "Nothing you do on your own account will clear it. It needs their login or their signature.",
    tag: "tag-warn",
  },
  epfo: {
    who: "EPFO",
    note: "Put it on record, then escalate on a clock that actually binds them.",
    tag: "tag-danger",
  },
};

const PREVALENCE: Record<string, string> = {
  "very-common": "One of the most frequent reasons claims fail",
  common: "A common reason claims fail",
  occasional: "Less common, but well documented",
};

export default async function Why({ params }: PageProps<"/why/[reason]">) {
  const { reason } = await params;
  const r = getRejection(reason);
  if (!r) notFound();

  const actor = ACTOR[r.whoMustAct];
  const drafts = r.documents
    .map((id) => DOCUMENTS.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  /* Marked up as a question and its answer, using the remark as the
     question, because that is literally what a member types. */
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: r.verbatim.map((remark) => ({
      "@type": "Question",
      name: `EPFO claim rejected: ${remark}. What does it mean?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${r.title}. ${r.plain} ${
          r.whoMustAct === "member"
            ? "This is yours to fix."
            : r.whoMustAct === "employer"
              ? "This needs your employer to act; you cannot clear it alone."
              : "This needs EPFO to act."
        }`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Our own static strings. The escape keeps a stray angle
        // bracket from ending the script element early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faq).replace(/</g, "\\u003c"),
        }}
      />

      <SiteHeader />

      <main id="main" className="flex-1">
        <div className="shell-reading py-10 sm:py-14 space-y-12 stagger">
          <nav aria-label="Breadcrumb" className="text-sm no-print">
            <Link
              href="/why/"
              className="press inline-flex items-center gap-2 text-ink-soft hover:text-ink"
            >
              <span aria-hidden>&larr;</span> Every reason a claim is rejected
            </Link>
          </nav>

          {/* Everything down to the mechanism prints. A member takes
              this to an employer or a counter, and what is useful on
              paper is the remark, what it means, whose job it is and
              the steps — not the navigation around them. */}
          <div data-print className="space-y-12">
            <div className="print-head">
              <p style={{ fontWeight: 700, fontSize: "12pt" }}>
                {r.title}
              </p>
              <p style={{ fontSize: "9.5pt" }}>
                Rejection remark explained &middot; prepared for a provident
                fund member
              </p>
            </div>

          <section>
            <div className="flex items-center gap-2.5 mb-4 flex-wrap">
              <h2 className="eyebrow section-mark mb-0">
                {PREVALENCE[r.prevalence]}
              </h2>
              <Tag kind="verified" />
            </div>

            <p className="eyebrow mb-3">If the portal told you</p>
            <ul className="space-y-2 mb-8">
              {r.verbatim.map((v) => (
                <li
                  key={v}
                  className="border border-rule-heavy bg-paper-raised px-5 py-3.5 rounded-md"
                >
                  <p className="machine text-sm leading-snug">{v}</p>
                </li>
              ))}
            </ul>

            <h1 className="display-1 measure mb-3">{r.title}</h1>

            {/* Renders only where one of the six languages without a
                full translation is chosen — so the member at least
                recognises the problem as theirs before meeting an
                explanation this build only holds in English and
                Hindi. */}
            <TranslatedTitle id={r.id} />

            <p className="lede measure">{r.plain}</p>
            <p className="font-deva text-ink-faint measure mt-4">{r.plainHi}</p>

            <div className="flex items-center gap-3 flex-wrap mt-6">
              <ReadAloud
                size="md"
                en={`${r.title}. ${r.plain}`}
                hi={`${r.titleHi}. ${r.plainHi}`}
              />
              <ShareLink
                title={r.title}
                text={`What "${r.verbatim[0]}" actually means, and what to do about it.`}
              />
              <PrintButton label="Print this" />
            </div>
          </section>

          <section>
            <p className="eyebrow mb-3">Whose job it is to fix it</p>
            <div className={`border rounded-lg px-5 py-4 ${actor.tag}`}>
              <p className="display-3 mb-1">{actor.who}</p>
              <p className="text-sm leading-relaxed opacity-90">{actor.note}</p>
            </div>
            <p className="text-sm text-ink-faint mt-3 measure">
              Raised at the {DESK_LABEL[r.rejectedAt].full} desk. Done
              correctly, this usually clears in about{" "}
              <span className="num">{r.typicalDays}</span> days.
            </p>
          </section>

          <section>
            <p className="eyebrow mb-4">What to do, in order</p>
            <ol className="border border-rule divide-y divide-rule rounded-lg overflow-hidden">
              {r.fixSteps.map((step, i) => (
                <li key={i} className="bg-paper-raised p-5">
                  <div className="flex items-start gap-4">
                    <span className="num text-xs text-ink-faint pt-1 w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`tag ${ACTOR[step.actor].tag}`}>
                          {ACTOR[step.actor].who}
                        </span>
                        <span className="num text-xs text-ink-faint">
                          about {step.days}{" "}
                          {step.days === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <p className="leading-relaxed">{step.instruction}</p>
                      <Disclose label="हिंदी में पढ़ें" className="mt-2.5">
                        <p className="font-deva text-sm text-ink-soft leading-relaxed">
                          {step.instructionHi}
                        </p>
                      </Disclose>
                      <p className="text-xs text-ink-faint mt-2.5">
                        {step.where}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <ReadAloud
              className="mt-5"
              en={r.fixSteps
                .map(
                  (s, i) =>
                    `Step ${i + 1}. ${ACTOR[s.actor].who}. ${s.instruction} This is done at ${s.where}.`,
                )
                .join(" ")}
              hi={r.fixSteps.map((s, i) => `${i + 1}. ${s.instructionHi}`).join(" ")}
            />
          </section>

          {/* Rendered only where a step above belongs to the
              establishment. For those nine reasons the instructions
              are unfollowable without a working employer, and this is
              the moment a member finds that out. */}
          <EmployerGoneNote reason={r} />

          <section>
            <p className="eyebrow mb-3">
              Why the message could not tell you any of this
            </p>
            <p className="text-ink-soft leading-relaxed measure">
              {r.mechanism}
            </p>
          </section>

            <div className="print-foot">
              <p>
                Produced by an independent prototype of a provident fund
                member portal. Not an official EPFO document and not legal
                advice.
              </p>
            </div>
          </div>

          {drafts.length > 0 && (
            <section className="border border-rule-heavy bg-paper-raised rounded-xl p-6 card-lift">
              <p className="eyebrow mb-3">
                {drafts.length === 1
                  ? "There is a letter for this"
                  : `There are ${drafts.length} letters for this`}
              </p>
              <p className="text-ink-soft leading-relaxed mb-5">
                Each one is drafted with your details filled in and the correct
                statutory wording, ready to send yourself. Nothing is filed on
                your behalf.
              </p>
              <ul className="space-y-2 mb-6">
                {drafts.map((d) => (
                  <li key={d.id} className="flex gap-3 text-sm">
                    <span aria-hidden className="text-noting shrink-0">
                      &rarr;
                    </span>
                    <span>
                      <span className="font-semibold">{d.title}</span>
                      <span className="block text-ink-soft leading-relaxed">
                        {d.purpose}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/login/" className="btn btn-primary">
                Open the case tools
              </Link>
            </section>
          )}

          <section className="border-l-4 border-noting bg-noting-wash/40 rounded-lg px-5 py-4">
            <p className="eyebrow mb-2">If nothing moves</p>
            <p className="text-sm leading-relaxed measure mb-3">
              The twenty-day settlement commitment restarts every time a desk
              returns the file, so it can be exceeded indefinitely without ever
              being formally breached. An RTI application about your own file
              must be answered in thirty days, and silence past that is a deemed
              refusal that opens an appeal — and a penalty on the officer
              personally.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Link href="/glossary/" className="btn btn-secondary btn-sm">
                What these words mean
              </Link>
              <Link href="/safety/" className="btn btn-ghost btn-sm">
                Somebody contacted you about it?
              </Link>
            </div>
          </section>

          {r.id === "nomination-missing-death-claim" && (
            <section className="border-2 border-noting/40 bg-paper-raised rounded-xl p-6">
              <h2 className="eyebrow section-mark mb-3">
                If you are claiming for somebody who has died
              </h2>
              <p className="text-ink-soft leading-relaxed measure mb-5">
                Three separate things are owed — the fund balance, a monthly
                pension and an insurance payment — and most families claim only
                the first. The ten-year service rule does not apply to a death
                in service, whatever you may have been told.
              </p>
              <Link href="/after-a-death/" className="btn btn-primary">
                What a family is owed, and how to claim it
              </Link>
            </section>
          )}

          <Related current={r.id} />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

/* Other reasons, because a member frequently has two faults at once
   and only ever sees the first one the system happened to reach. */
function Related({ current }: { current: string }) {
  const others = REJECTIONS.filter(
    (r) => r.id !== current && r.prevalence === "very-common",
  ).slice(0, 4);

  return (
    <section>
      <p className="eyebrow mb-4">Often the real problem instead</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {others.map((r) => (
          <li key={r.id}>
            <Link
              href={`/why/${r.id}/`}
              className="lift-hover block h-full border border-rule bg-paper-raised rounded-lg p-5 hover:border-noting"
            >
              <p className="font-semibold leading-snug mb-1.5">{r.title}</p>
              <p className="machine text-xs text-ink-faint leading-snug">
                {r.verbatim[0]}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
