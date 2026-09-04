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
export function sentences(text: string): string[] {
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

/* ============================================================
   Reading a whole page, one block at a time.

   The function above queues everything at once and watches only the
   last utterance, which is right for a single passage and wrong for a
   page. Two reasons.

   A page reader has to know which block is being spoken *now*, so the
   sentence on screen can be marked as the voice reaches it. That is
   the entire point of the feature: somebody who reads slowly follows
   the highlight, and somebody who cannot read at all at least knows
   where the voice has got to.

   And a hundred and forty queued utterances is where Chromium starts
   dropping them. Speaking one block, waiting for its end, then
   starting the next keeps the queue at one, makes skip and pause
   behave, and makes stopping instant.
   ============================================================ */

export interface Block {
  /** Text to speak. */
  text: string;
  lang: Lang;
}

export interface Reader {
  /** Stop, and release the voice. Safe to call more than once. */
  cancel(): void;
  /** Jump. Out-of-range indices are clamped rather than throwing. */
  goTo(index: number): void;
  /** Relative moves, which the reader owns rather than the caller.
   *
   *  The caller cannot compute these. A component that passes
   *  `position + 1` reads the position from React state, and state
   *  does not update between two clicks in the same tick — so
   *  somebody tapping Next four times quickly advances one block and
   *  concludes the button is broken. The authoritative index lives
   *  here, so the relative move does too. */
  next(): void;
  previous(): void;
  pause(): void;
  resume(): void;
}

export interface ReaderHandlers {
  /** Fires as each block begins, with its index. */
  onBlock(index: number): void;
  /** Fires once, when the last block ends or something goes wrong. */
  onDone(): void;
}

/** Reads blocks in order from `startAt`, returning a handle.
 *
 *  Cancellation is checked at every await and every event, because
 *  the user pressing stop during the voice-list wait is not an edge
 *  case — it is what happens on a cold first press. */
export async function readAlong(
  blocks: Block[],
  startAt: number,
  handlers: ReaderHandlers,
): Promise<Reader> {
  let index = Math.max(0, Math.min(startAt, blocks.length - 1));
  let live = true;

  const control: Reader = {
    cancel() {
      if (!live) return;
      live = false;
      if (supported()) window.speechSynthesis.cancel();
      announce(null);
      handlers.onDone();
    },
    goTo(to: number) {
      if (!live) return;
      index = Math.max(0, Math.min(to, blocks.length - 1));
      // Cancelling fires no end event we act on, because `live` is
      // still true and the next step is started explicitly below.
      if (supported()) window.speechSynthesis.cancel();
      void step();
    },
    next() {
      control.goTo(index + 1);
    },
    previous() {
      control.goTo(index - 1);
    },
    pause() {
      if (live && supported()) window.speechSynthesis.pause();
    },
    resume() {
      if (live && supported()) window.speechSynthesis.resume();
    },
  };

  if (!supported() || blocks.length === 0) {
    handlers.onDone();
    return control;
  }

  window.speechSynthesis.cancel();
  announce(PAGE_READER_ID);

  const all = await voices();
  if (!live) return control;

  /* One block, split into sentences only because a single very long
     utterance is the other thing Chromium truncates. The highlight
     stays at block granularity: marking individual sentences inside a
     paragraph makes the page flicker without helping anybody. */
  function step(): void {
    if (!live) return;
    if (index >= blocks.length) {
      control.cancel();
      return;
    }

    const block = blocks[index];
    handlers.onBlock(index);

    const voice = pick(all, block.lang);
    const chunks = sentences(block.text);
    if (chunks.length === 0) {
      index += 1;
      step();
      return;
    }

    let spoken = 0;
    const startedAt = index;

    for (const chunk of chunks) {
      const utterance = new SpeechSynthesisUtterance(chunk);
      if (voice) utterance.voice = voice;
      utterance.lang =
        voice?.lang ?? (block.lang === "hi" ? "hi-IN" : "en-IN");
      utterance.rate = 0.92;
      utterance.pitch = 1;

      const advance = () => {
        // A skip changes `index` under us; the stale block's events
        // must not then advance the new one.
        if (!live || index !== startedAt) return;
        spoken += 1;
        if (spoken === chunks.length) {
          index += 1;
          step();
        }
      };

      utterance.addEventListener("end", advance);
      utterance.addEventListener("error", advance);
      window.speechSynthesis.speak(utterance);
    }
  }

  step();
  return control;
}

/** The id the page reader announces under, so the per-passage Listen
 *  buttons stand down while it is running rather than talking over
 *  it. */
export const PAGE_READER_ID = "page-reader";
