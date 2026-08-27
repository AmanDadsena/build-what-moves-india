/* ============================================================
   Reading a passage out loud.

   The reason this exists is the audience. A large share of the people
   this scheme is for read slowly, or read Devanagari more comfortably
   than Latin, or are reading a screen held at arm's length in bad
   light because their glasses are somewhere else. All three of those
   people can listen.

   This is a supplement and never a substitute. A screen reader is a
   different thing serving a different need, and nothing here competes
   with one: the button is an ordinary button, the text stays real
   text, and turning any of this off loses nothing.

   Two implementation notes that are not obvious.

   First, voices load asynchronously. getVoices() returns an empty
   array on first call in every browser, and the list arrives later on
   a voiceschanged event — so a naive implementation silently reads
   everything in the wrong accent, or refuses to read Hindi at all.

   Second, long utterances stop dead partway through in Chromium after
   roughly fifteen seconds. Splitting the passage into sentences and
   queueing them avoids that entirely, and has the side benefit of
   making the stop button feel instant.
   ============================================================ */

export type Lang = "en" | "hi";

export interface Passage {
  text: string;
  lang: Lang;
}

type Listener = (speakingId: string | null) => void;

const listeners = new Set<Listener>();
let speakingId: string | null = null;

function announce(id: string | null) {
  speakingId = id;
  for (const fn of listeners) fn(id);
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function currentId(): string | null {
  return speakingId;
}

export function supported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function"
  );
}

/** Resolves once the browser has actually produced its voice list. */
function voices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const now = window.speechSynthesis.getVoices();
    if (now.length > 0) {
      resolve(now);
      return;
    }
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    // Some browsers never fire it. Do not hang on them.
    setTimeout(done, 1200);
  });
}

/* Indian English is preferred over British and American for the same
   reason the Hindi face is Noto rather than a substitute: a member
   should hear their own place names and their own rhythm, not have
   "Bengaluru" pronounced at them. */
const PREFERENCE: Record<Lang, string[]> = {
  hi: ["hi-in", "hi"],
  en: ["en-in", "en-gb", "en"],
};

function pick(all: SpeechSynthesisVoice[], lang: Lang) {
  const normalise = (s: string) => s.replace("_", "-").toLowerCase();
  for (const tag of PREFERENCE[lang]) {
    const found = all.find((v) => normalise(v.lang).startsWith(tag));
    if (found) return found;
  }
  return undefined;
}

/** Whether a voice exists at all for this language on this device. */
export async function canSpeak(lang: Lang): Promise<boolean> {
  if (!supported()) return false;
  return pick(await voices(), lang) !== undefined;
}

/* Sentences, in both scripts. The danda — । — ends a sentence in
   Devanagari and is invisible to a splitter that only knows full
   stops, which would hand the synthesiser one enormous run-on. */
function sentences(text: string): string[] {
  const parts = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?।])\s+/)
    .filter(Boolean);

  // Recombine anything very short, and break anything very long.
  const out: string[] = [];
  for (const part of parts) {
    if (part.length > 220) {
      let rest = part;
      while (rest.length > 220) {
        const cut = rest.lastIndexOf(" ", 220);
        out.push(rest.slice(0, cut > 0 ? cut : 220));
        rest = rest.slice(cut > 0 ? cut : 220).trim();
      }
      if (rest) out.push(rest);
    } else if (out.length > 0 && out[out.length - 1].length + part.length < 90) {
      out[out.length - 1] += " " + part;
    } else {
      out.push(part);
    }
  }
  return out;
}

export function stop() {
  if (!supported()) return;
  window.speechSynthesis.cancel();
  announce(null);
}

export async function speak(id: string, passages: Passage[]) {
  if (!supported()) return;

  // Whatever was playing loses. Two voices at once is unusable.
  window.speechSynthesis.cancel();
  announce(id);

  const all = await voices();

  // The cancel above may have raced with a second click on the same
  // button, which should read as "stop".
  if (speakingId !== id) return;

  const queue: SpeechSynthesisUtterance[] = [];
  for (const passage of passages) {
    const voice = pick(all, passage.lang);
    for (const chunk of sentences(passage.text)) {
      const utterance = new SpeechSynthesisUtterance(chunk);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? (passage.lang === "hi" ? "hi-IN" : "en-IN");
      /* Slightly under the default. Every usability study of synthetic
         speech for people who are not habitual users says the same
         thing: the default rate is set for people who already listen
         at 1.5×. */
      utterance.rate = 0.92;
      utterance.pitch = 1;
      queue.push(utterance);
    }
  }

  if (queue.length === 0) {
    announce(null);
    return;
  }

  const last = queue[queue.length - 1];
  last.addEventListener("end", () => {
    if (speakingId === id) announce(null);
  });
  for (const utterance of queue) {
    utterance.addEventListener("error", () => {
      if (speakingId === id) announce(null);
    });
    window.speechSynthesis.speak(utterance);
  }
}
