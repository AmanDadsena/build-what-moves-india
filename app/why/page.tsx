import Link from "next/link";
import { REJECTIONS } from "@/lib/rejections";
import type { Actor, RejectionReason } from "@/lib/types";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Every reason a provident fund claim is rejected",
  description:
    "Fifteen rejection remarks, each translated into what it actually means, whose action is needed, and the steps to clear it. No sign-in.",
  alternates: { canonical: "/why/" },
};

/* The index a search engine can reach, and a member can scan.
 *
 * Ordered by how often each fault actually occurs rather than
 * alphabetically or by internal code, because somebody who reads only
 * the first three entries should have read the three most likely to
 * be theirs. The remark itself is shown under every title in the
 * machine face: a member does not recognise "your name is spelled
 * differently in two places", they recognise the exact sentence they
 * were shown, and that sentence is what they came here holding.
 */

const GROUPS: Array<{
  key: RejectionReason["prevalence"];
  label: string;
  note: string;
}> = [
  {
    key: "very-common",
    label: "Most often",
    note: "Between them these account for the great majority of failed claims.",
  },
  {
    key: "common",
    label: "Often",
    note: "Each of these is routine enough that every regional office sees it weekly.",
  },
  {
    key: "occasional",
    label: "Less often",
    note: "Rarer, and correspondingly worse served — which is why they are here.",
  },
];

const ACTOR_TAG: Record<Actor, { label: string; tag: string }> = {
  member: { label: "You can fix it", tag: "tag-ok" },
  employer: { label: "Needs your employer", tag: "tag-warn" },
  epfo: { label: "Needs EPFO", tag: "tag-danger" },
};

export default function WhyIndex() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Why was my claim rejected"
          provenance="verified"
          title="Fifteen sentences, and what each of them is actually telling you."
          lede="About 174 lakh provident fund claims were rejected in a single year, and almost every one ended with a line of text that named no field, no desk and no next step. Find yours below. You do not need to sign in to anything."
          actions={
            <>
              <Link href="/login/" className="btn btn-gold">
                Paste the exact words you were shown
              </Link>
              <Link href="/glossary/" className="btn btn-secondary">
                What the words mean
              </Link>
            </>
          }
        />

        <div className="shell py-10 sm:py-14 space-y-14">
          {GROUPS.map(({ key, label, note }) => {
            const items = REJECTIONS.filter((r) => r.prevalence === key);
            if (items.length === 0) return null;

            return (
              <section key={key}>
                <div className="mb-5">
                  <p className="eyebrow section-mark mb-2">
                    {label} &middot;{" "}
                    <span className="num">{items.length}</span>
                  </p>
                  <p className="text-ink-soft leading-relaxed measure">
                    {note}
                  </p>
                </div>

                <ul className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {items.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/why/${r.id}/`}
                        className="lift-hover group flex h-full flex-col border border-rule bg-paper-raised rounded-lg p-5 sm:p-6 hover:border-noting"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                          <h2 className="title leading-snug min-w-0">
                            {r.title}
                          </h2>
                          <span
                            className={`tag shrink-0 ${ACTOR_TAG[r.whoMustAct].tag}`}
                          >
                            {ACTOR_TAG[r.whoMustAct].label}
                          </span>
                        </div>

                        <p className="font-deva text-sm text-ink-faint mb-4">
                          {r.titleHi}
                        </p>

                        <div className="border-l-2 border-rule-heavy pl-3.5 mb-4 space-y-1">
                          {r.verbatim.slice(0, 2).map((v) => (
                            <p
                              key={v}
                              className="machine text-xs text-ink-soft leading-snug"
                            >
                              {v}
                            </p>
                          ))}
                          {r.verbatim.length > 2 && (
                            <p className="text-xs text-ink-faint">
                              and{" "}
                              <span className="num">
                                {r.verbatim.length - 2}
                              </span>{" "}
                              other wordings
                            </p>
                          )}
                        </div>

                        <p className="text-sm text-ink-soft leading-relaxed mb-4 flex-1">
                          {r.plain}
                        </p>

                        <p className="text-xs text-ink-faint num">
                          Usually clears in about {r.typicalDays} days &middot;{" "}
                          {r.fixSteps.length} steps
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <section className="border-l-4 border-stamp bg-stamp-wash/40 rounded-lg px-5 py-4">
            <p className="eyebrow mb-2">Before you pay anybody</p>
            <p className="text-sm leading-relaxed measure mb-3">
              None of this costs money. Every form named on these pages is free
              to file, and no office can charge you to settle, speed up or
              unblock a claim. If somebody has offered to do it for a fee, that
              is worth checking before anything else.
            </p>
            <Link href="/safety/" className="btn btn-secondary btn-sm">
              Check whether it is genuine
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
