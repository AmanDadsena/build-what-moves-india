"use client";

import Link from "next/link";
import { useState } from "react";

/* The buttons that cannot really do the thing.
 *
 * Recording an exit, saving a nomination, requesting a transfer — all
 * of these need Aadhaar authentication against a live government
 * system, which this build must not touch and would not be given
 * access to. So there were three buttons here that did nothing at all
 * when pressed, under a line of small print explaining that they were
 * simulated.
 *
 * Small print does not survive a click. Somebody presses a button, the
 * page does not move, and what they learn is that this site is broken
 * — which is exactly the lesson the real portal already teaches and
 * the one thing this build exists to unteach.
 *
 * So the button works. It does not pretend to have filed anything, and
 * it never shows a success message for something that did not happen.
 * It says what a real submission would do, what this build did
 * instead, and gives the one thing it genuinely can: somewhere real to
 * go next.
 */

export function SimulatedAction({
  label,
  what,
  href,
  hrefLabel,
  disabled = false,
  disabledNote,
}: {
  /** The button's own text. */
  label: string;
  /** What a real submission would set in motion. One or two sentences. */
  what: string;
  /** Somewhere genuinely useful. */
  href: string;
  hrefLabel: string;
  disabled?: boolean;
  disabledNote?: string;
}) {
  const [pressed, setPressed] = useState(false);

  if (pressed) {
    return (
      <div
        role="status"
        className="border-2 border-pending/40 bg-pending-wash/50 rounded-lg px-5 py-4"
      >
        <p className="title text-pending mb-2">Nothing was submitted.</p>
        <p className="text-sm leading-relaxed measure mb-3">{what}</p>
        <p className="text-sm leading-relaxed measure mb-4">
          This is an independent prototype. It reaches no government system, so
          it will not tell you a claim went through when it did not — the one
          thing worse than a form that does not work is a form that says it
          worked.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link href={href} className="btn btn-primary btn-sm">
            {hrefLabel}
          </Link>
          <button onClick={() => setPressed(false)} className="btn btn-ghost btn-sm">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setPressed(true)}
        disabled={disabled}
        className="btn btn-primary"
      >
        {label}
      </button>
      {disabled && disabledNote && (
        <p className="text-sm text-ink-faint leading-relaxed mt-3 measure">
          {disabledNote}
        </p>
      )}
    </div>
  );
}
