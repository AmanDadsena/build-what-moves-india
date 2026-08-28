"use client";

import { useCallback, useEffect, useState } from "react";

/* Sending a page to somebody else.
 *
 * This matters more here than it looks. A great many members do not
 * pursue a stuck claim alone — a son, a neighbour who is good with
 * phones, an NGO worker. The way a page reaches that person in India
 * is that somebody forwards it, and the share sheet is what opens
 * WhatsApp with the link already in it.
 *
 * Three levels, because the platforms genuinely differ:
 *
 *   navigator.share opens the real share sheet. Mobile browsers have
 *   it, and it is the one people actually use.
 *
 *   The clipboard is the desktop answer, with the confirmation the
 *   member needs — a copy that gives no feedback reads as a dead
 *   button, which is the same failure as the ones just fixed.
 *
 *   Failing both, the link is shown as selectable text. Something is
 *   always on screen; nothing is ever offered that cannot happen.
 *
 * Rendered only after mount, because which of the three applies is a
 * fact about the device and the server cannot know it.
 */

type Mode = "unknown" | "share" | "copy" | "show";

export function ShareLink({
  title,
  text,
  url: given,
  label,
  className = "",
}: {
  /** Passed to the share sheet as the subject. */
  title: string;
  /** One line describing what is being shared. */
  text?: string;
  /** What to send. Defaults to the page the button is on; passed in
   *  where the link is built rather than visited — a case handed over
   *  carries its payload in the fragment. */
  url?: string;
  /** Overrides the button text where "this page" is not what it is. */
  label?: string;
  className?: string;
}) {
  const [mode, setMode] = useState<Mode>("unknown");
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(given ?? window.location.href);
    /* `"share" in navigator` rather than a typeof check: the DOM types
       declare share as always present, so TypeScript narrows a typeof
       away as impossible — while desktop Firefox genuinely does not
       ship it. The feature test has to survive the type system. */
    if ("share" in navigator) setMode("share");
    else if ("clipboard" in navigator) setMode("copy");
    else setMode("show");
  }, [given]);

  const act = useCallback(async () => {
    const href = given ?? window.location.href;
    if (mode === "share") {
      try {
        await navigator.share({ title, text, url: href });
      } catch {
        // A cancelled share sheet is a normal outcome, not an error.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(href);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("failed");
      setMode("show");
    }
  }, [mode, title, text, given]);

  if (mode === "unknown") return null;

  if (mode === "show") {
    return (
      <div className={className}>
        <p className="eyebrow mb-1.5">
          {label ?? "Send this page to whoever is helping"}
        </p>
        <p className="machine text-xs break-all border border-rule bg-paper rounded-md px-3 py-2.5 select-all">
          {url}
        </p>
        {state === "failed" && (
          <p className="text-xs text-ink-faint mt-2">
            Copying is blocked here. Select the address above.
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={act}
      aria-live="polite"
      className={`press inline-flex items-center gap-2 border rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${
        state === "copied"
          ? "border-verify bg-verify-wash text-verify"
          : "border-rule text-ink-soft hover:border-noting hover:text-noting"
      } ${className}`}
    >
      <Icon copied={state === "copied"} />
      {state === "copied"
        ? "Link copied"
        : (label ?? (mode === "share" ? "Send to someone" : "Copy link to send"))}
    </button>
  );
}

function Icon({ copied }: { copied: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {copied ? (
        <path d="M5 13l4 4L19 7" />
      ) : (
        <>
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
          <path d="M12 15V4M8 8l4-4 4 4" />
        </>
      )}
    </svg>
  );
}
