import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { Tag } from "@/components/Provenance";

/* The same thirty seconds of a person's life, rendered twice.

   The left column is a recreation of what a member is shown at the
   moment a claim fails, built from the portal's documented behaviour.
   It is not a screenshot, contains no logo and copies no code — and
   it is set in the system faces those portals actually use, because
   the typography is part of what the experience does to you. */

export const metadata = {
  title: "Before and after",
  description:
    "The moment a PF claim is rejected, shown as the portal presents it and as it could be presented instead.",
};

export default function Compare() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14">
          <p className="eyebrow mb-3">The same moment, twice</p>
          <h1 className="display-1 mb-4">
            ₹1,87,430 is not coming. Here is how you find out.
          </h1>
          <p className="text-ink-soft leading-relaxed max-w-2xl mb-10">
            Nothing about the underlying facts changes between these two
            columns. The same claim failed for the same reason on the same day.
            Only what the member is told changes.
          </p>

          <div className="grid lg:grid-cols-2 gap-px bg-rule border border-rule mb-12">
            {/* ---------------- BEFORE ---------------- */}
            <section className="bg-paper">
              <div className="border-b border-rule px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <p className="eyebrow">What the portal shows</p>
                <Tag kind="reconstructed" />
              </div>

              <div className="p-4 sm:p-5">
                {/* Deliberately plain: system faces, cramped rows, grey
                    text — the visual grammar of the real thing. */}
                <div
                  className="border border-[#b8b8b8] bg-white text-[#333]"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                >
                  <div className="bg-[#eeeeee] border-b border-[#b8b8b8] px-3 py-1.5 text-[12px] font-bold">
                    Claim Status
                  </div>

                  <table className="w-full text-[11.5px] border-collapse">
                    <tbody>
                      <Row label="Claim ID" value="CLM26061101" />
                      <Row label="Member ID" value="MHBAN00432170000012345" />
                      <Row label="Claim Type" value="FORM19" />
                      <Row label="Date of Submission" value="11/06/2026" />
                      <Row
                        label="Status"
                        value="CLAIM REJECTED"
                        valueClass="text-[#c00] font-bold"
                      />
                      <Row
                        label="Remarks"
                        value="CLAIM REJECTED: DEMOGRAPHIC DISCREPANCY IN EPFO PORTAL"
                      />
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-ink-faint mt-3 leading-relaxed">
                  A recreation of the rejection view from the portal&rsquo;s
                  documented behaviour. Not a screenshot; no logo or code is
                  reproduced.
                </p>

                <ul className="mt-6 space-y-2.5 text-sm">
                  <Miss>Which field failed is not stated</Miss>
                  <Miss>Which record it was compared against is not stated</Miss>
                  <Miss>Whose action is required is not stated</Miss>
                  <Miss>What to do next is not stated</Miss>
                  <Miss>There is nothing to click</Miss>
                </ul>
              </div>
            </section>

            {/* ---------------- AFTER ---------------- */}
            <section className="bg-paper">
              <div className="border-b border-rule px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <p className="eyebrow">What we show</p>
                <Tag kind="mock" />
              </div>

              <div className="p-4 sm:p-5">
                <div className="border border-stamp/50 bg-stamp-wash/40 px-4 py-4">
                  <span className="stamp text-[10px] -rotate-2 inline-block mb-3">
                    Rejected
                  </span>
                  <h2 className="text-lg font-semibold tracking-[-0.015em] mb-3">
                    Your Aadhaar says Rajesh Kumar{" "}
                    <mark className="bg-noting-wash text-noting px-1 rounded-xs">
                      Singh
                    </mark>
                    . Your PF record stops at Kumar.
                  </h2>

                  <div className="border border-rule bg-paper-raised px-3 py-2.5 mb-3">
                    <p className="eyebrow mb-1">EPFO record</p>
                    <p className="num text-sm">RAJESH KUMAR</p>
                  </div>
                  <div className="border border-rule bg-paper-raised px-3 py-2.5 mb-4">
                    <p className="eyebrow mb-1">Aadhaar</p>
                    <p className="num text-sm">
                      RAJESH KUMAR
                      <span className="bg-noting-wash text-noting rounded-xs px-0.5 font-medium">
                        {" "}
                        SINGH
                      </span>
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed">
                    Fix this with a Joint Declaration through your employer.
                    About 26 days. We have written it for you.
                  </p>
                </div>

                <ul className="mt-6 space-y-2.5 text-sm">
                  <Has>The exact word that differs</Has>
                  <Has>The record it was compared against</Has>
                  <Has>Who must act, in what order</Has>
                  <Has>Four documents, already filled in</Has>
                  <Has>The one deadline that legally binds them</Has>
                </ul>
              </div>
            </section>
          </div>

          {/* ---------------- The ledger of difference ---------------- */}
          <section className="mb-12">
            <p className="eyebrow mb-4">What actually changes</p>
            <div className="border border-rule rounded-lg overflow-x-auto">
              <table className="w-full text-sm min-w-[36rem]">
                <thead>
                  <tr className="bg-paper-inset/60 text-left">
                    <th className="eyebrow font-normal px-4 py-2.5 w-[34%]">
                      The member learns
                    </th>
                    <th className="eyebrow font-normal px-4 py-2.5">
                      On the portal
                    </th>
                    <th className="eyebrow font-normal px-4 py-2.5">Here</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  <CompareRow
                    what="What went wrong"
                    before="That something did not match"
                    after="That SINGH is present in Aadhaar and absent from the PF record"
                  />
                  <CompareRow
                    what="Who has to act"
                    before="Not stated"
                    after="You, then your employer, then the Regional Office — in order"
                  />
                  <CompareRow
                    what="What to send"
                    before="Not stated"
                    after="Joint Declaration, employer letter, EPFiGMS, RTI — pre-filled"
                  />
                  <CompareRow
                    what="How long it should take"
                    before="Not stated"
                    after="About 26 days, broken down per step"
                  />
                  <CompareRow
                    what="Which deadline binds them"
                    before="Not stated"
                    after="RTI reply under section 7(1) — 30 days, then a personal penalty"
                  />
                  <CompareRow
                    what="Why it took 74 days"
                    before="Not stated"
                    after="Five entries, two clock resets — shown on the note sheet"
                  />
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/portal/990012345678/claims/CLM26061101"
              className="btn btn-primary"
            >
              Open this case file
            </Link>
            <Link
              href="/how-real"
              className="btn btn-secondary"
            >
              What is real and what is mocked
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <tr className="border-b border-[#ddd] last:border-0">
      <td className="px-3 py-1.5 bg-[#f7f7f7] border-r border-[#ddd] whitespace-nowrap align-top">
        {label}
      </td>
      <td className={`px-3 py-1.5 break-words ${valueClass}`}>{value}</td>
    </tr>
  );
}

function Miss({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-ink-soft">
      <span aria-hidden className="text-stamp machine shrink-0">
        ×
      </span>
      <span>{children}</span>
    </li>
  );
}

function Has({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-ink-soft">
      <span aria-hidden className="text-verify machine shrink-0">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function CompareRow({
  what,
  before,
  after,
}: {
  what: string;
  before: string;
  after: string;
}) {
  return (
    <tr className="bg-paper align-top">
      <td className="px-4 py-3">{what}</td>
      <td className="px-4 py-3 text-ink-faint italic">{before}</td>
      <td className="px-4 py-3 text-ink-soft">{after}</td>
    </tr>
  );
}
