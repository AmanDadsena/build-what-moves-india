"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Speaking into a field instead of typing into it.
 *
 * The read-aloud buttons already let the site talk. This is the other
 * half, and for this audience it is the more useful one: somebody who
 * reads slowly can still say "naam nahi mil raha" perfectly well, and
 * typing a phrase like "demographic discrepancy" on a phone keypad in
 * a second language is its own barrier before you get to the answer.
 *
 * Three things it does that dictation buttons usually do not.
 *
 * It offers a language. Speech recognition has to be told which
 * language it is hearing before it hears it — there is no detecting
 * afterwards — so the choice is a visible control rather than a
 * silent assumption that everyone speaks English. It is remembered,
 * because somebody who speaks Hindi will speak Hindi next time too.
 *
 * It shows the interim words as they are recognised, so a member can
 * see it is working. A mic that sits silent for four seconds reads as
 * broken, and people stop talking halfway through.
 *
 * And it does not appear at all where it will not work. Firefox has
 * no speech recognition; on a device with no microphone permission it
 * fails on the first press and says so once rather than silently
 * doing nothing every time.
 */

import { LANGUAGES, languageFor, type LangCode } from "@/lib/i18n";

const STORAGE = "rk-voice-lang";

/* The API is prefixed everywhere except very recent Chromium, and it
   is absent entirely in Firefox. Neither the constructor nor the
   event types are in TypeScript's DOM library. */
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal: boolean }
  >;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

function ctor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceInput({
  onResult,
  className = "",
  label = "Speak instead of typing",
}: {
  /** Called with the final transcript. */
  onResult: (text: string) => void;
  className?: string;
  label?: string;
}) {
  const [ready, setReady] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<LangCode>("en");
  const recognition = useRef<Recognition | null>(null);

  useEffect(() => {
    if (!ctor()) return;
    setReady(true);
    try {
      /* Prefer whatever the member chose for the site: somebody
         reading in Kannada is going to speak Kannada. A separate
         choice made here overrides it and is remembered. */
      const saved = localStorage.getItem(STORAGE) as LangCode | null;
      const site = localStorage.getItem("rk-lang") as LangCode | null;
      const pick = saved ?? site;
      if (pick && LANGUAGES.some((l) => l.code === pick)) setLang(pick);
    } catch {
      // Private mode. English is a reasonable default.
    }
    return () => recognition.current?.abort();
  }, []);

  const start = useCallback(() => {
    const Ctor = ctor();
    if (!Ctor) return;

    recognition.current?.abort();
    const r = new Ctor();
    recognition.current = r;
    r.lang = languageFor(lang).tag;
    r.continuous = false;
    r.interimResults = true;
    setError(null);
    setInterim("");

    r.onresult = (event) => {
      let text = "";
      let done = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
        if (event.results[i].isFinal) done = true;
      }
      setInterim(text);
      if (done && text.trim()) onResult(text.trim());
    };

    r.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "The microphone is blocked for this site. Allow it in your browser settings, or type instead."
          : event.error === "no-speech"
            ? "Nothing was heard. Try again, a little closer to the microphone."
            : "Speech recognition is not available right now. Typing still works.",
      );
      setListening(false);
    };

    r.onend = () => {
      setListening(false);
      setInterim("");
    };

    try {
      r.start();
      setListening(true);
    } catch {
      setError("Could not start listening. Typing still works.");
    }
  }, [lang, onResult]);

  const stop = useCallback(() => {
    recognition.current?.stop();
    setListening(false);
  }, []);

  /* Cycles rather than toggles, now that there are eight. A select
     would be tidier and worse: this sits inside a search field, and a
     native dropdown there is a two-tap detour on a phone. */
  const switchLang = useCallback(() => {
    const i = LANGUAGES.findIndex((l) => l.code === lang);
    const next = LANGUAGES[(i + 1) % LANGUAGES.length].code;
    setLang(next);
    try {
      localStorage.setItem(STORAGE, next);
    } catch {
      // Nothing to do; it lasts the visit.
    }
    if (listening) stop();
  }, [lang, listening, stop]);

  if (!ready) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={listening ? stop : start}
          aria-pressed={listening}
          aria-label={listening ? "Stop listening" : label}
          title={label}
          className={`press inline-flex items-center justify-center h-10 w-10 rounded-md border transition-colors ${
            listening
              ? "border-stamp bg-stamp text-paper"
              : "border-rule text-ink-soft hover:border-noting hover:text-noting"
          }`}
        >
          <Mic listening={listening} />
        </button>

        <button
          type="button"
          onClick={switchLang}
          aria-label={`Speaking in ${languageFor(lang).native}. Change language.`}
          lang={languageFor(lang).tag}
          className="press h-10 px-2.5 rounded-md border border-rule text-xs font-bold text-ink-soft hover:border-noting hover:text-noting max-w-24 truncate"
        >
          {languageFor(lang).native}
        </button>
      </div>

      {(listening || interim || error) && (
        <p
          role="status"
          className={`text-xs leading-relaxed mt-2 ${error ? "text-stamp" : "text-ink-faint"}`}
        >
          {error ??
            (interim ? `“${interim}”` : `Listening in ${languageFor(lang).native}…`)}
        </p>
      )}
    </div>
  );
}

function Mic({ listening }: { listening: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={listening ? "animate-pulse" : ""}
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
