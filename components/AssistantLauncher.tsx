"use client";

import { forwardRef } from "react";

/* The floating help button, on its own.
 *
 * It exists as its own file because two things render it: the
 * assistant, and the stand-in that waits for somebody to press it
 * before fetching the assistant. Keeping one definition means the
 * placeholder and the real one cannot drift into looking slightly
 * different, which is the failure this pattern usually produces — a
 * button that shifts by two pixels the first time it is clicked.
 *
 * It imports nothing but React on purpose. The whole point of the
 * stand-in is that it costs almost nothing to have on the page.
 */

export const AssistantLauncher = forwardRef<
  HTMLButtonElement,
  { open: boolean; onClick: () => void }
>(function AssistantLauncher({ open, onClick }, ref) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? "Close help" : "Open help"}
      className="assistant-launcher press fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full bg-noting text-paper pl-4 pr-5 py-3.5 font-semibold text-sm"
    >
      <span aria-hidden>
        {open ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 15.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 3V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5Z" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.5.2-.7.6-.7 1.1" />
            <path d="M12 15.5h.01" />
          </svg>
        )}
      </span>
      <span className="hidden sm:inline">{open ? "Close" : "Need help?"}</span>
    </button>
  );
});
