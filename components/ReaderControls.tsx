"use client";

import { useCallback, useEffect, useState } from "react";

/* The reader panel.

   The original portal carries an accessibility widget bolted on from
   a third party: it floats over the page, styles nothing it does not
   own, and several of its settings visibly fight the site's own CSS.

   This does the same job from inside the design system. Every setting
   is a data attribute on <html> and every surface already reads its
   values from tokens, so turning on larger text or the hyperlegible
   face changes the tables, the tags and the note sheet too — not just
   the paragraphs.

   Preferences are read after mount, never during render: the server
   cannot know them, and guessing produces a hydration mismatch. */

const SCALES = ["normal", "large", "larger", "largest"] as const;
type Scale = (typeof SCALES)[number];

interface Prefs {
  scale: Scale;
  contrast: boolean;
  leading: boolean;
  spacing: boolean;
  links: boolean;
  readable: boolean;
  plain: boolean;
}

const DEFAULTS: Prefs = {
  scale: "normal",
  contrast: false,
  leading: false,
  spacing: false,
  links: false,
  readable: false,
  plain: false,
};

const STORAGE = "rk-reader";

/** Each toggle maps to one attribute on the document element. */
const ATTR: Record<keyof Omit<Prefs, "scale">, [string, string]> = {
  contrast: ["data-contrast", "high"],
  leading: ["data-leading", "loose"],
  spacing: ["data-spacing", "wide"],
  links: ["data-links", "highlight"],
  readable: ["data-readable", "on"],
  plain: ["data-plain", "on"],
};

const TOGGLES: Array<{
  key: keyof Omit<Prefs, "scale">;
  label: string;
  hint: string;
}> = [
  { key: "contrast", label: "High contrast", hint: "Black on white, stronger rules" },
  { key: "readable", label: "Readable typeface", hint: "Atkinson Hyperlegible" },
  { key: "leading", label: "More line spacing", hint: "Looser lines" },
  { key: "spacing", label: "More letter spacing", hint: "Wider letters and words" },
  { key: "links", label: "Highlight links", hint: "Marked, not just coloured" },
  { key: "plain", label: "Plain backgrounds", hint: "No texture behind text" },
];

export function ReaderControls({ onDark = false }: { onDark?: boolean }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      // A corrupt preference is not worth failing the page over.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;

    if (prefs.scale === "normal") root.removeAttribute("data-scale");
    else root.setAttribute("data-scale", prefs.scale);

    for (const key of Object.keys(ATTR) as Array<keyof typeof ATTR>) {
      const [attr, value] = ATTR[key];
      if (prefs[key]) root.setAttribute(attr, value);
      else root.removeAttribute(attr);
    }

    localStorage.setItem(STORAGE, JSON.stringify(prefs));
  }, [prefs, ready]);

  const step = useCallback((direction: 1 | -1) => {
    setPrefs((p) => {
      const next = SCALES.indexOf(p.scale) + direction;
      return {
        ...p,
        scale: SCALES[Math.min(SCALES.length - 1, Math.max(0, next))],
      };
    });
  }, []);

  const changed =
    prefs.scale !== "normal" ||
    (Object.keys(ATTR) as Array<keyof typeof ATTR>).some((k) => prefs[k]);

  const chrome = onDark
    ? "text-paper/65 hover:text-paper border-night-rule hover:border-paper/40"
    : "text-ink-soft hover:text-ink border-rule hover:border-ink";

  return (
    <div className="relative flex items-center gap-2">
      <div className="flex items-center gap-2" role="group" aria-label="Text size">
        <button
          onClick={() => step(-1)}
          disabled={prefs.scale === "normal"}
          aria-label="Decrease text size"
          className={`press border rounded-xs inline-flex items-center justify-center min-w-[30px] min-h-[28px] px-2 text-[13px] leading-none disabled:opacity-30 ${chrome}`}
        >
          A&minus;
        </button>
        <button
          onClick={() => step(1)}
          disabled={prefs.scale === "largest"}
          aria-label="Increase text size"
          className={`press border rounded-xs inline-flex items-center justify-center min-w-[30px] min-h-[28px] px-2 text-[15px] leading-none disabled:opacity-30 ${chrome}`}
        >
          A+
        </button>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`press border rounded-xs inline-flex items-center gap-1.5 min-h-[28px] px-2.5 text-xs font-semibold ${chrome}`}
      >
        Reading options
        {changed && (
          <span
            aria-label="settings changed"
            className="inline-block h-1.5 w-1.5 rounded-full bg-ochre"
          />
        )}
      </button>

      {open && (
        <>
          <button
            aria-label="Close reading options"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
            tabIndex={-1}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-[19rem] max-w-[calc(100vw-2rem)] border border-rule-heavy bg-paper-raised rounded-lg overflow-hidden text-ink">
            <div className="px-4 py-3 border-b border-rule flex items-center justify-between gap-3">
              <p className="eyebrow">Reading options</p>
              <button
                onClick={() => setPrefs(DEFAULTS)}
                disabled={!changed}
                className="text-xs font-semibold text-ink-soft hover:text-ink disabled:opacity-40"
              >
                Reset
              </button>
            </div>

            <ul className="divide-y divide-rule">
              {TOGGLES.map((t) => (
                <li key={t.key}>
                  <label className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-paper">
                    <input
                      type="checkbox"
                      checked={prefs[t.key]}
                      onChange={(e) =>
                        setPrefs((p) => ({ ...p, [t.key]: e.target.checked }))
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-noting)]"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{t.label}</span>
                      <span className="block text-xs text-ink-soft mt-0.5">
                        {t.hint}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <p className="px-4 py-3 text-xs text-ink-faint leading-relaxed border-t border-rule">
              Saved on this device. Applies to every page, including tables and
              forms.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
