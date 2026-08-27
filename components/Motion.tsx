"use client";

import { useEffect, useId, useRef, useState } from "react";

/* Two motion primitives, deliberately the only two.

   Reveal handles entrance — on load for what is already in view, on
   scroll for what is not. Disclose handles depth: the short statement
   stays on screen and the long explanation is one click away, which
   is how a dense subject stays readable without losing anything.

   Both degrade to plain visible content. If the observer never fires,
   or JavaScript fails entirely, the text is still there — motion is
   never allowed to become a gate on reading. */

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  /** Stagger, in milliseconds. */
  delay?: number;
  as?: "div" | "section" | "li" | "header";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Without observer support, show immediately rather than hide.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    observer.observe(el);

    /* Safety net. An entrance animation must never be able to leave
       content unreadable — if anything prevents the observer firing
       (a stalled scroll container, a hidden ancestor, an unsupported
       edge case), the text appears anyway a moment later. Reading the
       page always wins over animating it. */
    const failsafe = window.setTimeout(() => setShown(true), 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-shown={shown ? "true" : "false"}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Disclose({
  label,
  children,
  className = "",
}: {
  /** What the reader gets by opening it. Never "read more". */
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={className}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="press group inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        <span
          aria-hidden
          data-open={open ? "true" : "false"}
          className="disclose-caret machine text-xs text-ink-faint group-hover:text-noting"
        >
          &rsaquo;
        </span>
        <span className="underline decoration-rule-heavy underline-offset-4 group-hover:decoration-noting">
          {label}
        </span>
      </button>

      <div id={id} data-open={open ? "true" : "false"} className="disclose-body">
        <div>
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
