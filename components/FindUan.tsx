"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { routesFor, type Need } from "@/lib/uan";
import { PageHero } from "@/components/PageHero";
import { ReadAloud } from "@/components/ReadAloud";
import { Disclose } from "@/components/Motion";

/* The first gate, and the only screen addressed to somebody standing
 * in front of it.
 *
 * One question comes before the list, because the answer to it removes
 * three of the seven options entirely. Asking it first is the whole
 * value of the page: a member who no longer has the registered mobile
 * can spend an afternoon on lookups that were never going to
 * authenticate them, and nothing anywhere says so.
 */

const NEED_TONE: Record<Need, string> = {
  payslip: "tag-ok",
  mobile: "tag-info",
  employer: "tag-warn",
  office: "tag-danger",
  nothing: "tag-neutral",
};

export function FindUan() {
  const [hasMobile, setHasMobile] = useState<boolean | null>(null);
  const answer = useMemo(() => routesFor(hasMobile), [hasMobile]);

  return (
    <>
      <PageHero
        eyebrow="Before anything else"
        provenance="verified"
        title="You cannot do any of this without a UAN. Here is how to find yours."
        lede="Every screen in a provident fund portal, including this one, begins by assuming you have your Universal Account Number. It was allotted by an employer, printed on a payslip you may no longer have, for a job you may have left years ago."
      />

      {/* The question that shortens the list */}
      <section className="border-b border-rule bg-paper-raised">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-8">
          <p className="eyebrow section-mark mb-2">One question first</p>
          <p className="title measure mb-1">
            Do you still have the mobile number that was registered when the
            account was opened?
          </p>
          <p className="font-deva text-sm text-ink-faint mb-5">
            क्या वही मोबाइल नंबर अब भी आपके पास है जो खाता खुलते समय दर्ज हुआ था?
          </p>

          <div
            role="radiogroup"
            aria-label="Do you still have the registered mobile number"
            className="flex gap-2 flex-wrap"
          >
            {[
              { value: true, label: "Yes, I have it" },
              { value: false, label: "No, that number is gone" },
              { value: null, label: "I don't know" },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                role="radio"
                aria-checked={hasMobile === opt.value}
                onClick={() => setHasMobile(opt.value)}
                className={`press text-sm font-semibold py-2.5 px-4 rounded-md border transition-colors ${
                  hasMobile === opt.value
                    ? "border-noting bg-noting text-paper"
                    : "border-rule hover:border-noting hover:bg-noting-wash/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-10 sm:py-14 space-y-10">
        <section
          role="status"
          className={`border-2 rounded-xl p-6 ${
            hasMobile === false
              ? "border-stamp/40 bg-stamp-wash/40"
              : hasMobile === true
                ? "border-verify/40 bg-verify-wash/40"
                : "border-rule bg-paper-raised"
          }`}
        >
          <h2 className="display-3 mb-3">{answer.headline}</h2>
          <p className="leading-relaxed measure">{answer.note}</p>
          <ReadAloud
            className="mt-5"
            en={`${answer.headline} ${answer.note}`}
          />
        </section>

        <section>
          <p className="eyebrow section-mark mb-5">
            {answer.routes.length} ways, in the order worth trying them
          </p>

          <ol className="space-y-4">
            {answer.routes.map((route, index) => (
              <li
                key={route.id}
                className="border border-rule bg-paper-raised rounded-xl overflow-hidden card-lift"
              >
                <div className="px-5 py-3.5 bg-paper border-b border-rule flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-semibold leading-snug flex items-baseline gap-3">
                    <span className="num text-xs text-ink-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {route.title}
                  </p>
                  <span className={`tag ${NEED_TONE[route.needs]}`}>
                    {route.needsLabel}
                  </span>
                </div>

                <div className="px-5 py-4">
                  <p className="font-deva text-sm text-ink-faint mb-3">
                    {route.titleHi}
                  </p>
                  <p className="leading-relaxed measure mb-3">{route.how}</p>
                  <p className="num text-xs text-ink-faint">{route.speed}</p>

                  {route.catch && (
                    <p className="text-sm leading-relaxed measure mt-4 pt-4 border-t border-rule text-stamp">
                      {route.catch}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-l-4 border-noting bg-noting-wash/40 rounded-lg px-5 py-4">
          <p className="eyebrow mb-2">If you find more than one</p>
          <p className="text-sm leading-relaxed measure mb-3">
            Being allotted a second UAN by a later employer is common and it
            blocks claims on its own — the service is split across two accounts
            and neither shows the whole of it. It has its own fix.
          </p>
          <Link href="/why/multiple-uan/" className="btn btn-secondary btn-sm">
            What to do about two UANs
          </Link>
        </section>

        <Disclose
          label="Why no phone numbers are printed on this page"
          className="border-l-4 border-rule-heavy bg-paper-inset/40 rounded-lg px-5 py-4"
        >
          <div className="text-sm text-ink-soft leading-relaxed measure space-y-3">
            <p>
              The missed-call and SMS services are real and the routes above
              describe them accurately. The digits are deliberately not here.
            </p>
            <p>
              This build says plainly that it is not an official EPFO service
              and that the helpline in its own footer is invented. Printing a
              genuine government number in the same interface would be the one
              place a reader could not tell which kind of fact they were
              looking at — and a wrong number on a page about somebody&rsquo;s
              money is worse than no number.
            </p>
            <p>
              Knowing the route exists is the part almost nobody has. Take that
              to the official site for the current numbers.
            </p>
          </div>
        </Disclose>
      </div>
    </>
  );
}
