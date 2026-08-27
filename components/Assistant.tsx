"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Triage } from "@/components/Triage";
import { ask, SUGGESTED } from "@/lib/knowledge";
import { Tag } from "@/components/Provenance";

/* The assistant, available on every page.

   It behaves like a help chat because that is the shape people
   recognise, but it is not one: there is no model behind it and no
   request leaves the browser. It asks a few questions, or searches a
   set of written passages, and every answer it gives names the source
   it came from.

   That is the honest version of this feature. A model improvising
   about a statutory deadline, on a page about somebody's own money,
   would be worse than silence — so this can only hand back text it
   already holds, and says so when it holds nothing. */

const DEFAULT_UAN = "990012345678";

export function Assistant({ uan = DEFAULT_UAN }: { uan?: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"guided" | "search">("guided");
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const answers = query.trim().length > 3 ? ask(query, 3) : [];

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Escape closes, and focus returns to where it came from.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <>
      {/* Launcher */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close help" : "Open help"}
        className="assistant-launcher press fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full bg-noting text-paper pl-4 pr-5 py-3.5 font-semibold text-sm"
      >
        <span aria-hidden>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 15.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 3V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5Z" />
              <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.5.2-.7.6-.7 1.1" />
              <path d="M12 15.5h.01" />
            </svg>
          )}
        </span>
        <span className="hidden sm:inline">{open ? "Close" : "Need help?"}</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Help"
          className="assistant-panel fixed z-50 bottom-24 right-4 left-4 sm:left-auto sm:w-[26rem] max-h-[74vh] flex flex-col border border-rule-heavy bg-paper-raised rounded-xl overflow-hidden card-lift"
        >
          <div className="px-5 py-4 border-b border-rule bg-paper">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="title">Need help?</p>
                <p className="text-sm text-ink-soft">
                  Answers with their sources attached.
                </p>
              </div>
              <Tag kind="verified" />
            </div>

            <div
              role="tablist"
              aria-label="How to get help"
              className="flex gap-1 p-1 bg-paper-inset rounded-md"
            >
              {(["guided", "search"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={`press flex-1 text-sm font-semibold py-2 rounded transition-colors ${
                    mode === m
                      ? "bg-paper-raised text-ink"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {m === "guided" ? "Ask me questions" : "I'll type it"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto p-5 flex-1">
            {mode === "guided" ? (
              <Triage uan={uan} />
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="assistant-q" className="eyebrow block mb-2">
                    Your question
                  </label>
                  <input
                    id="assistant-q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Why was my claim rejected?"
                    autoComplete="off"
                    className="w-full border border-rule-heavy bg-paper rounded-md px-3.5 py-3 text-base outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12 placeholder:text-ink-faint/60"
                  />
                </div>

                {query.trim().length <= 3 && (
                  <ul className="space-y-1.5">
                    {SUGGESTED.slice(0, 4).map((s) => (
                      <li key={s}>
                        <button
                          onClick={() => setQuery(s)}
                          className="press w-full text-left text-sm border border-rule rounded-md px-3 py-2.5 hover:border-noting hover:bg-noting-wash/50"
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {query.trim().length > 3 && answers.length === 0 && (
                  <p
                    role="status"
                    className="text-sm leading-relaxed border border-rule rounded-md px-3.5 py-3 bg-paper"
                  >
                    Nothing here answers that. Rather than write you something
                    that sounds right, try the guided questions instead.
                  </p>
                )}

                <ul className="space-y-3">
                  {answers.map(({ entry }) => (
                    <li
                      key={entry.id}
                      className="border border-rule rounded-md overflow-hidden"
                    >
                      <p className="text-sm font-semibold px-3.5 py-2.5 bg-paper border-b border-rule">
                        {entry.question}
                      </p>
                      <div className="px-3.5 py-3">
                        <p className="text-sm leading-relaxed whitespace-pre-line mb-2.5">
                          {entry.answer}
                        </p>
                        <p className="text-xs text-ink-faint">
                          Source &middot; {entry.citation}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border-t border-rule px-5 py-3 bg-paper flex items-center justify-between gap-3">
            <Link
              href="/help"
              className="text-sm font-semibold text-noting hover:underline underline-offset-4"
            >
              Talk to a person
            </Link>
            <p className="text-xs text-ink-faint">Nothing leaves this device</p>
          </div>
        </div>
      )}
    </>
  );
}
