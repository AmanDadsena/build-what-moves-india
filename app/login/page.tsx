"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { SignInCard } from "@/components/SignInCard";
import { MEMBERS } from "@/lib/members";
import { matchRemark } from "@/lib/match";
import { VoiceInput } from "@/components/VoiceInput";

/* Two doors, because members arrive in two states: some can sign in
   and want their own file, and some only have the sentence the portal
   gave them. Making the second group sign in first would be asking
   for a password before answering their question. */

const CONFIDENCE_COPY = {
  high: "This matches a remark we know.",
  likely: "This looks like a remark we know.",
  uncertain: "A partial match. Read it and judge for yourself.",
} as const;

export default function Login() {
  const [remark, setRemark] = useState("");
  const matches = useMemo(() => matchRemark(remark), [remark]);
  const showResults = remark.trim().length > 6;

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <div className="shell py-10 sm:py-14">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div>
              <p className="eyebrow mb-3">Sign in</p>
              <h1 className="display-2 mb-3">
                Open your member file
              </h1>
              <p className="text-ink-soft leading-relaxed mb-6 max-w-md">
                Simulated sign-in. No account is created, no OTP is sent, and
                nothing you type leaves your browser.
              </p>
              <SignInCard />
            </div>

            <div className="lg:pt-10">
              <p className="eyebrow mb-3">No sign-in needed</p>
              <h2 className="display-2 mb-3">
                Or just paste what it told you
              </h2>
              <p className="text-ink-soft leading-relaxed mb-6 max-w-md">
                Copy the rejection remark from the portal. Approximate wording
                is fine — most people retype it from memory.
              </p>

              <div className="border border-rule-heavy bg-paper-raised rounded-lg overflow-hidden">
                <label htmlFor="remark" className="block eyebrow px-4 pt-4">
                  Rejection remark
                </label>
                <textarea
                  id="remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={3}
                  spellCheck={false}
                  placeholder="Claim rejected: Demographic discrepancy in EPFO portal"
                  className="machine w-full resize-none bg-transparent px-4 py-3 text-base outline-none placeholder:text-ink-faint/60"
                />
                {/* Reading a remark aloud off a phone screen is easier
                    than transcribing it, and the words in these are
                    exactly the ones hardest to spell from memory. */}
                <div className="px-4 pb-4">
                  <VoiceInput
                    label="Read the remark out instead of typing it"
                    onResult={(text) =>
                      setRemark((prev) => (prev ? `${prev} ${text}` : text))
                    }
                  />
                </div>
              </div>

              {showResults && (
                <div className="mt-5">
                  {matches.length === 0 ? (
                    <p role="status" className="text-sm text-ink-soft border-l-4 border-rule-heavy bg-paper-inset/50 rounded-lg px-5 py-4">
                      No known remark matches that wording yet. Try pasting more
                      of the sentence, or sign in to a demo account to see how
                      the decoding works.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {matches.map(({ rejection, confidence }) => {
                        const demo = MEMBERS.find((m) =>
                          m.claims.some((c) => c.rejectionId === rejection.id)
                        );
                        const claim = demo?.claims.find(
                          (c) => c.rejectionId === rejection.id
                        );
                        return (
                          <li
                            key={rejection.id}
                            className="border border-rule bg-paper p-4"
                          >
                            <p className="eyebrow mb-2">
                              {CONFIDENCE_COPY[confidence]}
                            </p>
                            <h3 className="title mb-1.5">
                              {rejection.title}
                            </h3>
                            <p className="text-sm text-ink-soft leading-relaxed mb-2">
                              {rejection.plain}
                            </p>
                            <p className="font-deva text-sm text-ink-soft leading-relaxed mb-3">
                              {rejection.plainHi}
                            </p>
                            {demo && claim && (
                              <Link
                                href={`/portal/${demo.uan}/claims/${claim.id}`}
                                className="btn btn-primary btn-sm"
                              >
                                Open the worked example
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
