"use client";

import { useEffect, useId, useState } from "react";
import {
  speak,
  stop,
  subscribe,
  supported,
  canSpeak,
  type Passage,
  type Lang,
} from "@/lib/speech";

/* The listen button.
 *
 * Three rules it follows, each of which is the difference between a
 * useful control and an irritating one.
 *
 * It does not appear unless it will work. Support is a client-only
 * fact, and a device with no Hindi voice installed cannot read Hindi
 * however cheerfully the button offers to — so each language is
 * checked for a real voice before its button is drawn. A control that
 * does nothing when pressed teaches a member that this whole site is
 * unreliable.
 *
 * It never starts on its own. Audio that begins without being asked
 * for is the single most hostile thing a page can do to somebody in a
 * shared room, an office, or a waiting hall.
 *
 * Only one thing speaks at a time, across the whole page. Pressing a
 * second button stops the first rather than talking over it.
 */

export function ReadAloud({
  en,
  hi,
  className = "",
  size = "sm",
  onDark = false,
}: {
  /** The English passage. */
  en: string;
  /** The Hindi passage, where one exists. */
  hi?: string;
  className?: string;
  size?: "sm" | "md";
  /** True where this sits on one of the navy bands.
   *
   *  Without it the button inherits the light-background palette —
   *  ink-soft on a rule-coloured border — and lands on the hero at
   *  1.59:1, which is not a contrast problem so much as an invisible
   *  button. That it was the *read-aloud* control which disappeared,
   *  on the page for families after a death, is the part worth
   *  remembering: the accessibility affordance is exactly the one
   *  nobody notices is missing, because the people it fails are the
   *  least able to report it. */
  onDark?: boolean;
}) {
  const id = useId();
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [voices, setVoices] = useState<Record<Lang, boolean>>({
    en: false,
    hi: false,
  });

  useEffect(() => {
    setMounted(true);
    if (!supported()) return;
    let live = true;
    Promise.all([canSpeak("en"), canSpeak("hi")]).then(([e, h]) => {
      if (live) setVoices({ en: e, hi: h });
    });
    const unsubscribe = subscribe(setPlaying);
    return () => {
      live = false;
      unsubscribe();
    };
  }, []);

  // Anything still talking when this leaves the screen should stop.
  useEffect(() => () => stop(), []);

  if (!mounted || !supported()) return null;
  if (!voices.en && !voices.hi) return null;

  const options: Array<{ key: string; lang: Lang; label: string; stopLabel: string }> =
    [];
  if (voices.en) {
    options.push({ key: `${id}-en`, lang: "en", label: "Listen", stopLabel: "Stop" });
  }
  if (hi && voices.hi) {
    options.push({
      key: `${id}-hi`,
      lang: "hi",
      label: "हिंदी में सुनें",
      stopLabel: "रोकें",
    });
  }

  const pad = size === "md" ? "px-3.5 py-2 text-sm" : "px-3 py-1.5 text-xs";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const active = playing === option.key;
        const text = option.lang === "hi" ? (hi as string) : en;
        const passages: Passage[] = [{ text, lang: option.lang }];

        return (
          <button
            key={option.key}
            onClick={() => (active ? stop() : speak(option.key, passages))}
            aria-pressed={active}
            className={`press inline-flex items-center gap-1.5 border rounded-md font-semibold transition-colors ${pad} ${
              active
                ? onDark
                  ? "border-ochre bg-ochre text-night"
                  : "border-noting bg-noting text-paper"
                : onDark
                  ? "border-paper/40 text-paper hover:border-ochre hover:text-ochre"
                  : "border-rule text-ink-soft hover:border-noting hover:text-noting"
            } ${option.lang === "hi" ? "font-deva" : ""}`}
          >
            <Icon speaking={active} />
            {active ? option.stopLabel : option.label}
          </button>
        );
      })}
    </div>
  );
}

/* Drawn rather than borrowed, like the rest of the icon set. Sound
   leaving a source, and a square when it is playing — the universal
   stop, so the button never has to be read to be understood. */
function Icon({ speaking }: { speaking: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {speaking ? (
        <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" />
      ) : (
        <>
          <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4Z" />
          <path d="M16 9.5a4 4 0 0 1 0 5" />
          <path d="M18.8 7a8 8 0 0 1 0 10" />
        </>
      )}
    </svg>
  );
}
