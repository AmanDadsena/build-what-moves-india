"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MEMBERS, MOCK_PASSWORD } from "@/lib/members";
import { Emblem } from "@/components/Emblem";
import Link from "next/link";

/* The sign-in card, shared by the landing and the sign-in page.

   It authenticates nothing and transmits nothing: the check runs
   against a list compiled into the page, and no value leaves the
   browser. The warning about real credentials is not boilerplate —
   this build reproduces a government service closely enough that
   somebody could arrive believing it is one.

   The demo accounts are presented as people rather than as a list of
   numbers, because a reviewer choosing between them is really
   choosing which problem to look at. */

const CASE_LABEL: Record<string, string> = {
  "990012345678": "Name mismatch",
  "990087654321": "Exit never recorded",
  "990055512340": "Employer has not approved KYC",
};

export function SignInCard({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [uan, setUan] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    const member = MEMBERS.find((m) => m.uan === uan.trim());
    if (!member) {
      setError("No account with that UAN. Choose one of the demo members below.");
      return;
    }
    if (password !== MOCK_PASSWORD) {
      setError(`Wrong password. For this prototype it is ${MOCK_PASSWORD}.`);
      return;
    }
    router.push(`/portal/${member.uan}`);
  }

  const field =
    "w-full border border-rule-heavy bg-paper px-4 py-3 text-base rounded-md outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12 placeholder:text-ink-faint/60";

  return (
    <div className="gold-top bg-paper-raised border border-rule-heavy rounded-xl overflow-hidden card-lift">
      {/* An accent rule, so the card reads as the page's one entry
          point rather than another bordered box. */}
      <div className="h-1.5 bg-noting" />

      <div className="px-5 pt-5 pb-4 sm:px-6 border-b border-rule">
        <div className="flex items-center gap-3">
          <Emblem size={34} className="text-noting shrink-0" />
          <div className="min-w-0">
            <p className="title">Member sign in</p>
            <p className="font-deva text-sm text-ink-faint">सदस्य लॉगिन</p>
          </div>
        </div>
      </div>

      <form onSubmit={signIn} className="p-5 sm:p-6 space-y-4">
        <div>
          {/* The one place a member discovers they are blocked before
              they have begun. Every portal asks for this number and
              none of them says what to do when you do not have it. */}
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <label htmlFor="uan" className="eyebrow">
              UAN
            </label>
            <Link
              href="/find-your-uan/"
              className="text-xs font-semibold text-noting underline underline-offset-4 decoration-rule-heavy hover:decoration-noting"
            >
              I don&rsquo;t know mine
            </Link>
          </div>
          <input
            id="uan"
            value={uan}
            onChange={(e) => {
              setUan(e.target.value);
              setError(null);
            }}
            inputMode="numeric"
            autoComplete="off"
            placeholder="12 digits"
            className={`num ${field}`}
          />
        </div>

        <div>
          <label htmlFor="password" className="eyebrow block mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            autoComplete="off"
            placeholder="Demo password"
            className={`num ${field}`}
          />
        </div>

        {/* Announced, not merely coloured. */}
        {error && (
          <p
            role="alert"
            className="text-sm text-stamp bg-stamp-wash border border-stamp/25 rounded-md px-3 py-2.5 leading-relaxed"
          >
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block">
          Sign in
        </button>

        <p className="text-xs text-stamp leading-relaxed flex items-start gap-2">
          <span aria-hidden className="mt-0.5 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 8v5M12 17h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </span>
          Never enter a real UAN or password. This prototype authenticates
          nothing and stores nothing.
        </p>
      </form>

      {!compact && (
        <div className="border-t border-rule bg-paper px-5 py-4 sm:px-6">
          <p className="eyebrow mb-3">Demo members &middot; choose a problem</p>
          <ul className="space-y-1.5">
            {MEMBERS.map((m) => (
              <li key={m.uan}>
                <button
                  onClick={() => {
                    setUan(m.uan);
                    setPassword(MOCK_PASSWORD);
                    setError(null);
                  }}
                  className="press w-full text-left border border-rule rounded-md px-3.5 py-2.5 hover:border-noting hover:bg-noting-wash/50 group"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium group-hover:text-noting">
                      {m.name}
                    </span>
                    <span className="num text-xs text-ink-faint shrink-0">
                      {m.uan}
                    </span>
                  </span>
                  <span className="block text-xs text-ink-soft mt-0.5">
                    {CASE_LABEL[m.uan]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="num text-xs text-ink-faint mt-3">
            password &middot; {MOCK_PASSWORD}
          </p>
        </div>
      )}
    </div>
  );
}
