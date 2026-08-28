"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { OFFICES, AT_THE_OFFICE, searchOffices } from "@/lib/offices";
import { IconCertificate, IconRecords, IconGrievance } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";
import { VoiceInput } from "@/components/VoiceInput";

const DEMO_UAN = "990012345678";

/* Finding an office is the easy half.

   The original locator answers where the building is. It does not
   answer the question that actually costs people a day's wages: what
   this particular counter can do, and what it will send you away to
   do somewhere else. So that comes first here, and the addresses
   come second. */

export default function Offices() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchOffices(query), [query]);

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Offices"
          provenance="mock"
          title="Before you travel, check the counter can actually help."
          lede="An office holds particular establishment codes and does a particular set of things. Arriving with the wrong paper at the wrong counter costs a day's wages and changes nothing."
        />
        <div className="shell py-10 sm:py-14 space-y-12 stagger">
          {/* What a counter can and cannot do — the part that matters */}
          <section>
            <p className="eyebrow section-mark mb-4">
              What a counter can and cannot do
            </p>
            <div className="grid gap-4 lg:grid-cols-3">
              <Panel
                tone="ok"
                Icon={IconCertificate}
                title="They can"
                items={AT_THE_OFFICE.can}
              />
              <Panel
                tone="danger"
                Icon={IconGrievance}
                title="They cannot"
                items={AT_THE_OFFICE.cannot}
              />
              <Panel
                tone="info"
                Icon={IconRecords}
                title="Bring with you"
                items={AT_THE_OFFICE.bring}
              />
            </div>
          </section>

          {/* The directory */}
          <section>
            <p className="eyebrow section-mark mb-4">Find your office</p>

            <div className="relative max-w-xl mb-6">
              <label htmlFor="office-q" className="sr-only">
                Search by city, state or establishment code
              </label>
              <div className="flex items-start gap-2">
                <input
                  id="office-q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="City, state, or the first letters of your establishment code"
                  autoComplete="off"
                  className="flex-1 min-w-0 border border-rule-heavy bg-paper rounded-md px-4 py-3.5 text-base outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12 placeholder:text-ink-faint/60"
                />
                <VoiceInput
                  className="shrink-0"
                  label="Say your city or establishment code"
                  onResult={(text) => setQuery(text)}
                />
              </div>
            </div>

            {results.length === 0 ? (
              <div
                role="status"
                className="border border-rule bg-paper-raised rounded-lg px-5 py-6"
              >
                <p className="leading-relaxed measure">
                  No office here matches that. Your establishment code is on
                  your payslip and on your member record — its first five
                  letters identify the office that holds your file.
                </p>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {results.map((o) => (
                  <li key={o.id}>
                    <div className="lift-hover h-full border border-rule bg-paper-raised rounded-lg p-5 hover:border-noting">
                      <p className="title mb-0.5">{o.name}</p>
                      <p className="text-sm text-ink-soft mb-3">
                        {o.city}, {o.state}
                      </p>

                      <p className="text-sm text-ink-soft leading-relaxed mb-3">
                        {o.address}
                      </p>

                      <dl className="text-sm space-y-1.5 pt-3 border-t border-rule">
                        <div className="flex gap-2">
                          <dt className="eyebrow shrink-0 pt-0.5">Codes</dt>
                          <dd className="num text-ink-soft">
                            {o.covers.join(", ")}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="eyebrow shrink-0 pt-0.5">Phone</dt>
                          <dd className="num text-ink-soft">{o.phone}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="eyebrow shrink-0 pt-0.5">Open</dt>
                          <dd className="text-ink-soft">{o.hours}</dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-sm text-ink-faint leading-relaxed measure mt-5">
              {results.length} of {OFFICES.length} offices. Every address and
              number here is invented for this prototype and none of them
              works. What is real is the division of work between an office,
              your employer&rsquo;s login and the online portal.
            </p>
          </section>

          <section className="border border-rule-heavy bg-paper-raised rounded-lg card-lift p-6">
            <h2 className="display-3 mb-2">
              Most of this never needs a visit
            </h2>
            <p className="text-ink-soft leading-relaxed measure mb-5">
              Corrections, transfers, exit marking and grievances are all done
              online. The counter is for a signature on paper, an RTI receipt,
              or a case nobody online will answer.
            </p>
            <Link
              href={`/portal/${DEMO_UAN}/ask`}
              className="btn btn-primary btn-sm"
            >
              Check whether yours needs a visit
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function Panel({
  tone,
  Icon,
  title,
  items,
}: {
  tone: "ok" | "danger" | "info";
  Icon: (p: { size?: number }) => React.JSX.Element;
  title: string;
  items: string[];
}) {
  const style =
    tone === "ok"
      ? { border: "border-verify/30", tile: "text-verify", mark: "text-verify" }
      : tone === "danger"
        ? { border: "border-stamp/30", tile: "text-stamp", mark: "text-stamp" }
        : { border: "border-noting/30", tile: "text-noting", mark: "text-noting" };

  return (
    <div className={`h-full border-2 ${style.border} bg-paper-raised rounded-lg p-5`}>
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-lg bg-paper-inset mb-4 ${style.tile}`}
      >
        <Icon size={22} />
      </span>
      <h3 className="display-3 mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
            <span aria-hidden className={`shrink-0 font-bold ${style.mark}`}>
              {tone === "danger" ? "×" : tone === "ok" ? "✓" : "•"}
            </span>
            <span className="text-ink-soft">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
