"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { search, COMMON, KIND_LABEL, type Result } from "@/lib/search";
import { LANGUAGES, type LangCode } from "@/lib/i18n";
import { useLang } from "@/components/Language";
import { useReader, TOGGLES, SCALE_LABEL } from "@/components/ReaderControls";
import * as speech from "@/lib/speech";

/* ============================================================
   The command palette.

   The masthead search box deliberately has no live dropdown, and its
   reasoning is sound: a panel that repaints on every keystroke is
   punishing on a slow phone, and it lands after the member has
   already looked away. That argument is about touch on a cheap
   device. It says nothing about the keyboard.

   And on the keyboard this site is large — ninety-odd routes, fifteen
   rejection reasons, a glossary, an office directory. Someone who
   works here daily, an NGO caseworker or a union clerk handling other
   people's claims, should not be clicking through a navigation bar to
   reach the transfer page for the eleventh time today.

   So this is a second surface that never appears unless it is asked
   for. Ctrl+K, or / when the caret is not in a field. Nothing opens
   it on scroll, on idle, or on a first visit.

   What makes it worth building rather than a shortcut to /search is
   that it carries commands as well as destinations. Switching to
   Tamil, turning on high contrast, growing the text, hearing the page
   read aloud — every one of those is an accessibility control that
   otherwise lives behind a mouse-driven popover in the utility bar.
   Here they are three letters away, which for a keyboard-only or
   switch-device user is the difference between a feature existing and
   a feature being reachable.

   The settings are not duplicated: this reads and writes the same
   provider the utility-bar panel does, so a tick made in one is
   already true in the other.
   ============================================================ */

/* Opening it from a button rather than a key. A custom event keeps
   the trigger and the dialog from having to share a parent — the
   masthead is server-rendered furniture and the palette hangs off the
   layout root — without standing up a context for one boolean. */
const OPEN_EVENT = "rk-palette";

export function openPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

interface Command {
  id: string;
  /** What the row says. */
  label: string;
  /** The line under it. */
  hint: string;
  /** Grouping heading. */
  group: string;
  /** Extra words this should be findable by, never displayed. */
  keywords: string;
  /** Right-aligned: the state this setting is in now. */
  state?: string;
  /** Written in this language, so a screen reader says it properly. */
  lang?: string;
  run: () => void;
}

/* Destinations and commands in one shape, so the list renderer does
   not care whether a row goes somewhere or does something. */
type Row =
  | { type: "result"; key: string; result: Result }
  | { type: "command"; key: string; command: Command };

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function isApple(): boolean {
  return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
}

/* The visible prose of the page, for reading aloud. Headings, list
   items and paragraphs only: innerText on <main> would also read the
   navigation, every table cell and the footer, which is a great many
   minutes of speech nobody asked for. */
function pageProse(): string {
  const main = document.getElementById("main") ?? document.querySelector("main");
  if (!main) return "";
  const parts: string[] = [];
  for (const node of main.querySelectorAll("h1, h2, h3, p, li")) {
    if (node.closest("nav, footer, [aria-hidden='true']")) continue;
    const text = node.textContent?.replace(/\s+/g, " ").trim();
    if (text && text.length > 1) parts.push(text);
    if (parts.length > 400) break;
  }
  return parts.join(". ");
}

export function CommandPalette() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const { prefs, toggle, step, reset, changed, canGrow, canShrink } =
    useReader();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [mac, setMac] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const openRef = useRef(false);
  const listId = useId();

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /* Feature detection after mount. The server has no idea whether
     this device has a speech synthesiser or a Command key, and a
     guess either hides a working control or offers a dead one. */
  useEffect(() => {
    setCanSpeak(speech.supported());
    setMac(isApple());
    return speech.subscribe((id) => setSpeaking(id === "palette-page"));
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const show = useCallback(() => setOpen(true), []);

  /* Focus goes back where it came from. Dropping it on <body> sends a
     screen-reader user to the top of the document and loses their
     place, which is the commonest way a dialog gets this wrong.
     Capturing on open and restoring in the cleanup covers every way
     out — Escape, the backdrop, a command, a navigation — without any
     of those having to remember to do it. */
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    return () => previous?.focus();
  }, [open]);

  /* The three ways in: Ctrl/Cmd+K anywhere, a bare / when the caret
     is not already in a field — otherwise it would eat the slash of
     somebody typing a date — and the button in the masthead. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const combo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const slash =
        e.key === "/" && !e.ctrlKey && !e.metaKey && !isTypingTarget(e.target);
      if (!combo && !slash) return;
      e.preventDefault();
      if (openRef.current) close();
      else show();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [close, show]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /* Nothing behind the dialog should scroll under it. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  const commands = useMemo<Command[]>(() => {
    const out: Command[] = [];

    if (canSpeak) {
      out.push({
        id: "read",
        label: speaking ? "Stop reading" : "Read this page aloud",
        hint: speaking
          ? "Silence the synthesiser"
          : "Headings and paragraphs, in order, at a slower rate",
        group: "On this page",
        keywords: "listen speech voice audio hear speak read aloud",
        run: () => {
          if (speaking) {
            speech.stop();
            close();
            return;
          }
          const text = pageProse();
          close();
          if (text) speech.speak("palette-page", [{ text, lang: "en" }]);
        },
      });
    }

    out.push(
      {
        id: "print",
        label: "Print this page",
        hint: "Uses the print stylesheet — navigation and buttons drop out",
        group: "On this page",
        keywords: "paper pdf save printer",
        run: () => {
          close();
          /* After the dialog has actually gone, or the browser
             screenshots the print layout with a modal over it. */
          setTimeout(() => window.print(), 150);
        },
      },
      {
        id: "copy",
        label: "Copy the link to this page",
        hint: "To send to whoever is helping you",
        group: "On this page",
        keywords: "share url whatsapp send address",
        run: () => {
          navigator.clipboard?.writeText(window.location.href).catch(() => {
            // Denied, or an insecure origin. Not worth an alert.
          });
          close();
        },
      },
      {
        id: "text-bigger",
        label: "Make the text bigger",
        hint: canGrow
          ? "Everything, including tables and forms"
          : "Already at the largest size",
        group: "Reading",
        keywords: "larger zoom font size increase bigger",
        state: SCALE_LABEL[prefs.scale],
        run: () => step(1),
      },
      {
        id: "text-smaller",
        label: "Make the text smaller",
        hint: canShrink ? "Back towards the default" : "Already at the default",
        group: "Reading",
        keywords: "smaller zoom out font size decrease",
        state: SCALE_LABEL[prefs.scale],
        run: () => step(-1),
      },
    );

    for (const t of TOGGLES) {
      out.push({
        id: `toggle-${t.key}`,
        label: `${prefs[t.key] ? "Turn off" : "Turn on"} ${t.label.toLowerCase()}`,
        hint: t.hint,
        group: "Reading",
        keywords: `${t.label} ${t.hint} accessibility`,
        state: prefs[t.key] ? "On" : "Off",
        run: () => toggle(t.key),
      });
    }

    if (changed) {
      out.push({
        id: "reader-reset",
        label: "Reset the reading options",
        hint: "Back to the default size, face and contrast",
        group: "Reading",
        keywords: "default clear undo reset",
        run: () => reset(),
      });
    }

    for (const l of LANGUAGES) {
      if (l.code === lang) continue;
      out.push({
        id: `lang-${l.code}`,
        label: l.native,
        hint: l.full
          ? `${l.english} — everything on the site is written in it`
          : `${l.english} — menus and rejection titles; the long explanations stay in English`,
        group: "Language",
        keywords: `language ${l.code} ${l.english} ${l.native}`,
        state: l.full ? undefined : "Menus",
        lang: l.tag,
        run: () => {
          setLang(l.code as LangCode);
          close();
        },
      });
    }

    return out;
  }, [
    canSpeak,
    speaking,
    prefs,
    canGrow,
    canShrink,
    changed,
    lang,
    step,
    toggle,
    reset,
    setLang,
    close,
  ]);

  const rows = useMemo<Row[]>(() => {
    const q = query.trim();

    /* Before anything is typed: the commands only. Dumping a hundred
       and forty-five pages into an empty box is a menu, and the
       navigation bar is already a menu. */
    if (q.length < 2) {
      return commands
        .slice(0, 9)
        .map((command) => ({ type: "command" as const, key: command.id, command }));
    }

    const needle = q.toLowerCase();
    const matched = commands.filter((c) =>
      `${c.label} ${c.hint} ${c.keywords} ${c.group}`
        .toLowerCase()
        .includes(needle),
    );

    return [
      ...matched
        .slice(0, 5)
        .map((command) => ({ type: "command" as const, key: command.id, command })),
      ...search(q, 10).map((result) => ({
        type: "result" as const,
        key: result.id,
        result,
      })),
    ];
  }, [query, commands]);

  /* A shrinking list must never leave the highlight past its end. */
  useEffect(() => {
    setActive((a) => (a >= rows.length ? 0 : a));
  }, [rows.length]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const runRow = useCallback(
    (row: Row) => {
      if (row.type === "command") row.command.run();
      else go(row.result.href);
    },
    [go],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    const move = (delta: number) => {
      e.preventDefault();
      setActive((a) =>
        rows.length === 0 ? 0 : (a + delta + rows.length) % rows.length,
      );
    };

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        close();
        return;
      case "ArrowDown":
        return move(1);
      case "ArrowUp":
        return move(-1);
      case "Home":
        e.preventDefault();
        setActive(0);
        return;
      case "End":
        e.preventDefault();
        setActive(Math.max(0, rows.length - 1));
        return;
      case "Tab":
        /* Tab must not escape the dialog. There are only two focusable
           things in it, so holding the caret in the field is both the
           simplest correct trap and the one that leaves the arrow keys
           doing the work. */
        e.preventDefault();
        return;
      case "Enter": {
        e.preventDefault();
        const row = rows[active];
        if (row) runRow(row);
        else if (query.trim().length >= 2) {
          /* Nothing matched, but the member typed a real question.
             The search page is a better place to be told that than a
             popup is, and it keeps their words. */
          go(`/search/?q=${encodeURIComponent(query.trim())}`);
        }
        return;
      }
      default:
        /* Emacs-style movement, which is what a long-time terminal
           user reaches for and costs nothing to honour. */
        if (e.ctrlKey && e.key === "n") return move(1);
        if (e.ctrlKey && e.key === "p") return move(-1);
    }
  };

  if (!open) return null;

  const groupOf = (row: Row) =>
    row.type === "command" ? row.command.group : KIND_LABEL[row.result.kind];

  return (
    <div
      className="palette-backdrop fixed inset-0 z-[100]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search and commands"
        className="palette-panel absolute left-1/2 -translate-x-1/2 top-[7vh] w-[min(40rem,calc(100vw-1.5rem))] max-h-[82vh] flex flex-col border border-rule-heavy bg-paper-raised rounded-xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 border-b border-rule shrink-0">
          <span aria-hidden className="text-ink-faint shrink-0">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5L21 21" />
            </svg>
          </span>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              rows[active] ? `${listId}-${rows[active].key}` : undefined
            }
            aria-label="Search the site, or type a command"
            placeholder="Search, or type a command…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent py-4 text-base outline-none placeholder:text-ink-faint/70"
          />

          <button
            onClick={close}
            aria-label="Close"
            className="shrink-0 text-ink-faint hover:text-ink"
          >
            <kbd className="kbd">Esc</kbd>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <ul ref={listRef} id={listId} role="listbox" className="py-1.5">
            {rows.map((row, i) => {
              const group = groupOf(row);
              const heading = i === 0 || groupOf(rows[i - 1]) !== group;

              const isActive = i === active;
              const title =
                row.type === "command" ? row.command.label : row.result.title;
              const hint =
                row.type === "command" ? row.command.hint : row.result.snippet;
              const state = row.type === "command" ? row.command.state : undefined;

              return (
                <Fragment key={row.key}>
                  {heading && (
                    <li
                      role="presentation"
                      className="eyebrow px-4 pt-3 pb-1.5 text-ink-faint"
                    >
                      {group}
                    </li>
                  )}
                  <li
                    id={`${listId}-${row.key}`}
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive}
                    onMouseMove={() => setActive(i)}
                    onClick={() => runRow(row)}
                    lang={row.type === "command" ? row.command.lang : undefined}
                    className={`mx-1.5 px-2.5 py-2.5 rounded-md cursor-pointer flex items-baseline gap-3 ${
                      isActive ? "bg-noting text-paper" : "hover:bg-paper"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">
                        {title}
                      </span>
                      <span
                        className={`block text-xs mt-0.5 truncate ${
                          isActive ? "text-paper/75" : "text-ink-soft"
                        }`}
                      >
                        {hint}
                      </span>
                    </span>
                    {state && (
                      <span
                        className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide ${
                          isActive ? "text-paper/75" : "text-ink-faint"
                        }`}
                      >
                        {state}
                      </span>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ul>

          {rows.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-ink-soft">
                Nothing here matches “{query.trim()}”.
              </p>
              <p className="text-xs text-ink-faint mt-1.5">
                Press <kbd className="kbd">Enter</kbd> to search the whole site
                for it.
              </p>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="px-4 pt-3 pb-4 border-t border-rule mt-2">
              <p className="eyebrow text-ink-faint mb-2">
                What people usually arrive with
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setQuery(c);
                      setActive(0);
                      inputRef.current?.focus();
                    }}
                    className="press border border-rule rounded-full px-3 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p aria-live="polite" className="sr-only">
          {`${rows.length} ${rows.length === 1 ? "result" : "results"}`}
        </p>

        <div className="shrink-0 border-t border-rule px-4 py-2.5 flex items-center justify-between gap-3 text-[11px] text-ink-faint">
          <span className="flex items-center gap-3">
            <span>
              <kbd className="kbd">↑</kbd>
              <kbd className="kbd">↓</kbd> move
            </span>
            <span>
              <kbd className="kbd">↵</kbd> open
            </span>
          </span>
          <span>
            <kbd className="kbd">{mac ? "⌘" : "Ctrl"}</kbd>
            <kbd className="kbd">K</kbd> anywhere
          </span>
        </div>
      </div>
    </div>
  );
}

/** The visible way in, for anybody who does not know the shortcut. */
export function PaletteButton({ className = "" }: { className?: string }) {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(isApple()), []);

  return (
    <button
      onClick={openPalette}
      aria-label="Search the site, or type a command"
      className={`press border border-rule-heavy bg-paper rounded-md inline-flex items-center gap-2 pl-2.5 pr-2 py-2 text-sm text-ink-faint hover:border-ink hover:text-ink transition-colors ${className}`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden
        className="shrink-0"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.5 15.5L21 21" />
      </svg>
      <span className="flex-1 text-left">Search</span>
      <span aria-hidden className="shrink-0">
        <kbd className="kbd">{mac ? "⌘" : "Ctrl"}</kbd>
        <kbd className="kbd">K</kbd>
      </span>
    </button>
  );
}
