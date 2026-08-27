"use client";

import { useEffect, useState } from "react";
import { SimulatedAction } from "@/components/SimulatedAction";

/* Whether the member may record their own exit yet.
 *
 * This is a client component for one reason, and it is the reason
 * every date on this site is computed after mount rather than during
 * render: the whole app is exported to static HTML at build time, so
 * a `Date.now()` in a server component is not "now" — it is the
 * moment the site was built, frozen into the file.
 *
 * The consequence here would have been quiet and bad. A member who
 * became eligible the week after a deploy would open this page and
 * find the button still disabled, still telling them to wait, with a
 * date in the past. They would conclude the rule had not been met and
 * go on waiting for an employer who is never going to act.
 *
 * Until the first render on the client, the answer is genuinely
 * unknown, so nothing asserts either way.
 */

export function ExitEligibility({
  eligibleFromIso,
  lastContributionLabel,
  eligibleFromLabel,
  grievanceHref,
}: {
  eligibleFromIso: string;
  lastContributionLabel: string;
  eligibleFromLabel: string;
  grievanceHref: string;
}) {
  const [eligible, setEligible] = useState<boolean | null>(null);

  useEffect(() => {
    setEligible(Date.now() >= new Date(eligibleFromIso).getTime());
  }, [eligibleFromIso]);

  return (
    <div className="space-y-5">
      <div
        className={`border-l-4 rounded-lg px-5 py-4 ${
          eligible === null
            ? "border-rule-heavy bg-paper-inset/40"
            : eligible
              ? "border-verify bg-verify-wash/50"
              : "border-pending bg-pending-wash/50"
        }`}
      >
        <p className="title mb-1.5">
          {eligible === null
            ? "Checking today's date…"
            : eligible
              ? "You are eligible today"
              : "Not yet eligible"}
        </p>
        <p className="text-sm leading-relaxed measure">
          {eligible === null
            ? "This depends on today's date, which is read in your browser rather than baked into the page."
            : eligible
              ? `Two months have passed since ${lastContributionLabel}. You can record your exit yourself, without waiting for your employer to do anything.`
              : `You become eligible on ${eligibleFromLabel}. Until then only your employer can record it, so write to them in the meantime.`}
        </p>
      </div>

      <SimulatedAction
        label="Record exit"
        disabled={eligible !== true}
        disabledNote={
          eligible === null
            ? undefined
            : `You cannot mark your own exit until ${eligibleFromLabel}.`
        }
        what="A real submission would write your date of exit and its reason against this employment, authenticated with an Aadhaar OTP. It is what unblocks a final settlement, and it is the single most common thing an employer never does."
        href={grievanceHref}
        hrefLabel="Raise it against the employer instead"
      />
    </div>
  );
}
