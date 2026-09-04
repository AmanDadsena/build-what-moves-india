"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PAGE_READER_ID,
  canSpeak,
  readAlong,
  subscribe,
  supported,
  type Reader,
} from "@/lib/speech";
import { clock, estimateSeconds, harvest, type PageBlock } from "@/lib/readpage";

/* Listen to the whole page.
 *
 * The Listen buttons already here read a passage an author wrote out
 * by hand. That is the right shape for a summary and the wrong one
 * for somebody who cannot read the page at all: they need the page,
 * not the parts somebody remembered to wire up. So this reads the
 * document itself, in order, and marks the block the voice has
 * reached.
 *
 * The highlight is the feature, not the audio. Text-to-speech is
 * everywhere; a phone will read a page aloud without anybody's help.
 * What a phone will not do is show a member which sentence is being
 * spoken while they follow it with their eyes — and following along
 * is how somebody who reads slowly reads at all. It is the same
 * reason a child's reading book has a finger under the line.
 *
 * Three rules, each learned from a way this kind of control goes
 * wrong.
 *
 * It never starts on its own, on any page, ever. Audio that begins
 * unasked is the most hostile thing a page can do to somebody in a
 * shared room, an office queue, or a hospital corridor.
 *
 * It does not appear where it cannot work. Whether a device has an
 * Indian-English voice installed is a client-only fact, so the bar
 * is not drawn until that is known. A control that does nothing when
 * pressed teaches a member the whole site is unreliable, and that
 * lesson is expensive here.
 *
 * It stops when the page changes. A voice that keeps reading the
 * previous page after a link is followed is disorienting for exactly
 * the person least able to work out what happened.
 */

/* Opened from elsewhere by an event, for the same reason the command
   palette is: the callers are the palette and the masthead, both of
   which are far from this component in the tree, and standing up a
   context for one boolean is not worth it. */
const OPEN_EVENT = "rk-page-reader";

export function openPageReader() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function PageReader() {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [at, setAt] = useState(0);
  const [total, setTotal] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const blocks = useRef<PageBlock[]>([]);
  const reader = useRef<Reader | null>(null);
  const marked = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setReady(true);
    if (!supported()) return;
    let live = true;
    // English is the floor: every page here has English on it. A
    // device with only Hindi still gets a useful reader, so either
    // voice is enough to offer the control.
    Promise.all([canSpeak("en"), canSpeak("hi")]).then(([en, hi]) => {
      if (live) setAvailable(en || hi);
    });
    return () => {
      live = false;
    };
  }, []);

  const unmark = useCallback(() => {
    if (marked.current) {
      marked.current.removeAttribute("data-reading");
      marked.current = null;
    }
  }, []);

  const halt = useCallback(() => {
    reader.current?.cancel();
    reader.current = null;
    setPlaying(false);
    setPaused(false);
    unmark();
  }, [unmark]);

  /* A passage's own Listen button, or another page reader, taking the
     voice means this one is no longer speaking whatever it thinks it
     is. Following the shared subscription keeps the two controls
     from disagreeing on screen. */
  useEffect(
    () =>
      subscribe((id) => {
        if (id !== PAGE_READER_ID && reader.current) halt();
      }),
    [halt],
  );

  // Leaving the page stops the voice. Without this a client-side
  // navigation leaves it reading a page nobody is looking at.
  useEffect(() => () => halt(), [halt]);

  // Opened from the command palette, which is where a keyboard user
  // reaches everything else on this site.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const mark = useCallback(
    (index: number) => {
      unmark();
      const block = blocks.current[index];
      if (!block) return;
      block.el.setAttribute("data-reading", "true");
      marked.current = block.el;
      setAt(index);

      const rect = block.el.getBoundingClientRect();
      const room = window.innerHeight;
      // Only scroll when it has actually gone out of view, and keep
      // it off the bottom edge where the player sits.
      if (rect.top < 72 || rect.bottom > room - 160) {
        block.el.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "center",
        });
      }
    },
    [unmark],
  );

  const start = useCallback(
    async (from = 0) => {
      const main = document.querySelector("main");
      if (!main) return;

      blocks.current = harvest(main);
      setTotal(blocks.current.length);
      setSeconds(estimateSeconds(blocks.current));
      if (blocks.current.length === 0) return;

      setPlaying(true);
      setPaused(false);
      reader.current = await readAlong(
        blocks.current.map((b) => ({ text: b.text, lang: b.lang })),
        from,
        {
          onBlock: mark,
          onDone: () => {
            setPlaying(false);
            setPaused(false);
            unmark();
          },
        },
      );
    },
    [mark, unmark],
  );

  // Measure once the bar is opened, so the estimate is shown before
  // anybody commits to listening to it.
  useEffect(() => {
    if (!open) return;
    const main = document.querySelector("main");
    if (!main) return;
    const found = harvest(main);
    setTotal(found.length);
    setSeconds(estimateSeconds(found));
  }, [open]);

  /* The player is fixed to the bottom of the viewport, so the last
     few blocks on a page cannot be scrolled clear of it — the
     document has already run out. Flagging the root adds enough
     scrollable room below the content for the highlight to sit above
     the panel however near the end it is. */
  useEffect(() => {
    const root = document.documentElement;
    if (open) root.setAttribute("data-reader-open", "true");
    else root.removeAttribute("data-reader-open");
    return () => root.removeAttribute("data-reader-open");
  }, [open]);

  if (!ready || !supported() || !available) return null;

  const pct = total > 0 ? Math.round(((at + 1) / total) * 100) : 0;

  return (
    /* Bottom-left, because the assistant launcher already owns
       bottom-right and two floating controls in one corner means the
       later one wins and the earlier one is unreachable. The open
       panel is lifted clear of the launcher on narrow screens, where
       there is no room for the two of them side by side. */
    <div
      data-page-reader
      className="fixed inset-x-0 bottom-0 z-50 print:hidden pointer-events-none"
    >
      <div className="shell pb-4 flex justify-start">
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pointer-events-auto press inline-flex items-center gap-2.5 rounded-full border-2 border-noting bg-paper-raised px-4 sm:px-5 py-3 shadow-lg text-sm font-semibold hover:bg-noting-wash transition-colors"
          >
            <SpeakerIcon />
            Listen<span className="hidden sm:inline">&nbsp;to this page</span>
          </button>
        ) : (
          <div
            role="region"
            aria-label="Page reader"
            className="pointer-events-auto w-full sm:max-w-xl mb-16 sm:mb-0 rounded-2xl border-2 border-noting bg-paper-raised shadow-xl overflow-hidden"
          >
            {/* Progress. aria-hidden because the live count below
                already says it in words, and a screen reader does not
                need the bar read as a percentage too. */}
            <div aria-hidden className="h-1.5 bg-rule">
              <div
                className="h-full bg-noting transition-[width] duration-300"
                style={{ width: playing ? `${pct}%` : "0%" }}
              />
            </div>

            <div className="px-4 py-3.5 sm:px-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="eyebrow">
                  {playing
                    ? paused
                      ? "Paused"
                      : "Reading this page"
                    : "Listen to this page"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    halt();
                    setOpen(false);
                  }}
                  aria-label="Close the page reader"
                  className="press text-xs text-ink-faint hover:text-ink underline underline-offset-4"
                >
                  Close
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!playing ? (
                  <button
                    type="button"
                    onClick={() => start(0)}
                    className="press inline-flex items-center gap-2 rounded-lg bg-noting text-paper px-5 py-3 text-base font-semibold hover:opacity-90 transition-opacity"
                  >
                    <PlayIcon />
                    Start
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (paused) {
                          reader.current?.resume();
                          setPaused(false);
                        } else {
                          reader.current?.pause();
                          setPaused(true);
                        }
                      }}
                      className="press inline-flex items-center gap-2 rounded-lg bg-noting text-paper px-5 py-3 text-base font-semibold hover:opacity-90 transition-opacity"
                    >
                      {paused ? <PlayIcon /> : <PauseIcon />}
                      {paused ? "Continue" : "Pause"}
                    </button>
                    <button
                      type="button"
                      onClick={() => reader.current?.previous()}
                      disabled={at === 0}
                      aria-label="Read the previous part again"
                      className="press rounded-lg border-2 border-rule-heavy px-4 py-3 text-sm font-semibold hover:border-noting disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => reader.current?.next()}
                      disabled={at >= total - 1}
                      aria-label="Skip to the next part"
                      className="press rounded-lg border-2 border-rule-heavy px-4 py-3 text-sm font-semibold hover:border-noting disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                      Next &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={halt}
                      className="press rounded-lg border-2 border-rule-heavy px-4 py-3 text-sm font-semibold hover:border-stamp hover:text-stamp"
                    >
                      Stop
                    </button>
                  </>
                )}
              </div>

              <p
                role="status"
                aria-live="polite"
                className="text-xs text-ink-soft mt-3 leading-relaxed"
              >
                {playing
                  ? `Part ${at + 1} of ${total}.`
                  : total > 0
                    ? `${total} parts, about ${clock(seconds)} to listen to. It reads what is on this page, and marks each part as it goes.`
                    : "Nothing on this page to read aloud."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Icons. Drawn rather than imported so they inherit the current
   colour and scale with the reader's text-size setting.
   ------------------------------------------------------------------ */

function SpeakerIcon() {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" />
    </svg>
  );
}
