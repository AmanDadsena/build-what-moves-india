"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  LANGUAGES,
  DEFAULT_LANG,
  languageFor,
  t,
  type LangCode,
} from "@/lib/i18n";

/* The chosen language, and the switch for it.
 *
 * Kept in a context rather than a URL segment because every route
 * here is exported to static HTML: a /bn/ prefix would mean building
 * ninety-six pages eight times over for content that is, honestly,
 * eight translated menus. The choice lives on the device and applies
 * everywhere.
 *
 * It sets lang on <html> when it changes, which is the part that
 * actually matters — a screen reader picks its voice from that
 * attribute, and Bengali read aloud by an English synthesiser is
 * worse than English.
 *
 * The switch is honest about coverage. Six of the eight languages
 * carry the menus and the rejection titles but not the long
 * explanations, and the panel says so in that language rather than
 * letting somebody discover it three pages in.
 */

interface Ctx {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  /** Shorthand for the current language. */
  s: (key: string) => string;
}

const LanguageContext = createContext<Ctx>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  s: (key) => t(key, DEFAULT_LANG),
});

export const useLang = () => useContext(LanguageContext);

const STORAGE = "rk-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE) as LangCode | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
    } catch {
      // Private mode. English is a safe default.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = languageFor(lang).tag;
  }, [lang]);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE, next);
    } catch {
      // Lasts the visit.
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, s: (key) => t(key, lang) }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageSwitcher({ onDark = false }: { onDark?: boolean }) {
  const { lang, setLang, s } = useLang();
  const [open, setOpen] = useState(false);
  const current = languageFor(lang);

  const chrome = onDark
    ? "text-paper/70 hover:text-paper border-night-rule hover:border-paper/40"
    : "text-ink-soft hover:text-ink border-rule hover:border-ink";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${s("language")}: ${current.native}`}
        className={`press border rounded-xs inline-flex items-center gap-1.5 min-h-[28px] px-2.5 text-xs font-semibold ${chrome}`}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
        {current.native}
      </button>

      {open && (
        <>
          <button
            aria-label="Close language menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
            tabIndex={-1}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 border border-rule-heavy bg-paper-raised rounded-lg overflow-hidden text-ink">
            <p className="eyebrow px-4 py-3 border-b border-rule">
              {s("language")}
            </p>
            <ul className="divide-y divide-rule max-h-80 overflow-y-auto">
              {LANGUAGES.map((l) => (
                <li key={l.code}>
                  <button
                    onClick={() => {
                      setLang(l.code);
                      setOpen(false);
                    }}
                    aria-current={l.code === lang ? "true" : undefined}
                    lang={l.tag}
                    className={`press w-full text-left px-4 py-3 hover:bg-paper flex items-center justify-between gap-3 ${
                      l.code === lang ? "bg-noting-wash font-semibold" : ""
                    }`}
                  >
                    <span>{l.native}</span>
                    {!l.full && (
                      <span className="tag tag-neutral shrink-0">Menus</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <p className="px-4 py-3 text-xs text-ink-faint leading-relaxed border-t border-rule">
              {current.full
                ? "Everything on the site is written in this language."
                : s("partial")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
