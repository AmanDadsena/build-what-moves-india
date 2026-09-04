import type { Lang } from "./speech";

/* ============================================================
   Turning a rendered page into something that can be read aloud.

   The per-passage Listen buttons already on this site are given
   their text by the component that owns it — the author decided what
   should be spoken and wrote it out. That is the right shape for a
   summary and the wrong one for a whole page: a member who cannot
   read the page needs the page, not a précis of the parts somebody
   remembered to wire up.

   So this reads the document instead. Which sounds simple and is not,
   because a rendered page contains a great deal that must not be
   spoken.

   ------------------------------------------------------------
   What is skipped, and why each one matters

   Navigation. Every page here opens with a masthead, eight nav items
   and a search box. Read aloud in order, a member waits forty seconds
   before the page begins. Landmarks exist precisely so this can be
   avoided, so only <main> is read.

   Anything already hidden from assistive technology. An aria-hidden
   decoration is hidden because it is noise — an arrow glyph, a
   counter, a rule. Speaking "right arrow" between every list item is
   the fastest way to make somebody turn this off.

   Screen-reader-only text. This is the mirror of the last one and
   people get it backwards. A .sr-only string exists to give a screen
   reader something the sighted user gets from layout. This reader
   serves somebody who is looking at the page and cannot read it
   quickly, so speaking both the visible label and its invisible twin
   says everything twice.

   The reader's own controls, and anything not displayed. A collapsed
   disclosure has not been opened; reading its contents aloud
   describes a page the listener is not looking at.

   ------------------------------------------------------------
   Why blocks rather than sentences

   The unit is one element — a heading, a paragraph, a list item —
   because that is the unit that can be highlighted without the page
   flickering, and because it is the unit a listener uses to say "go
   back one".
   ============================================================ */

/** Elements whose text is worth speaking, in the order they appear. */
const READABLE =
  "h1, h2, h3, h4, h5, h6, p, li, dt, dd, figcaption, blockquote, th, td, summary, pre";

/** Containers whose contents are structure, not prose. */
const SKIP_INSIDE = [
  "nav",
  "[data-page-reader]",
  '[role="tablist"]',
  "[hidden]",
  "[aria-hidden='true']",
  ".sr-only",
];

export interface PageBlock {
  /** Index into the harvested list. */
  index: number;
  el: HTMLElement;
  text: string;
  lang: Lang;
}

/* Devanagari, and the ranges of the other scripts this site renders.
   A block is read in Hindi when it is mostly Devanagari, which is a
   more reliable signal than a lang attribute nobody remembers to set
   on the one paragraph that needed it. */
const DEVANAGARI = /[ऀ-ॿ]/g;

export function detectLang(text: string): Lang {
  const deva = text.match(DEVANAGARI)?.length ?? 0;
  const letters = text.replace(/[^\p{L}]/gu, "").length;
  if (letters === 0) return "en";
  return deva / letters > 0.4 ? "hi" : "en";
}

function skipped(el: Element): boolean {
  for (const selector of SKIP_INSIDE) {
    if (el.closest(selector)) return true;
  }
  return false;
}

function visible(el: HTMLElement): boolean {
  // offsetParent is null for display:none and for anything inside it.
  // Cheaper than getComputedStyle across a few hundred nodes, and the
  // fixed-position case it gets wrong does not arise inside <main>.
  if (el.offsetParent === null) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

/** Text of an element excluding any nested readable block, so a list
 *  item containing a paragraph is not spoken twice. */
function ownText(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(READABLE).forEach((child) => child.remove());
  clone
    .querySelectorAll("[aria-hidden='true'], .sr-only, script, style")
    .forEach((child) => child.remove());
  return clone.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

/** Everything in `root` worth reading, in document order. */
export function harvest(root: ParentNode): PageBlock[] {
  const out: PageBlock[] = [];

  root.querySelectorAll<HTMLElement>(READABLE).forEach((el) => {
    if (skipped(el)) return;
    if (!visible(el)) return;

    const text = ownText(el);
    // Two characters is a bullet or a number, not a sentence.
    if (text.length < 3) return;

    out.push({
      index: out.length,
      el,
      text,
      lang: detectLang(text),
    });
  });

  return out;
}

/** Roughly how long the page takes to hear, in seconds.
 *
 *  At the 0.92 rate this site speaks at, and around 150 words per
 *  minute for Indian-English synthesis, that is about 2.3 words a
 *  second. Approximate on purpose: it is there so somebody can decide
 *  whether they have time, not to be accurate to the second. */
export function estimateSeconds(blocks: { text: string }[]): number {
  const words = blocks.reduce(
    (sum, b) => sum + b.text.split(/\s+/).filter(Boolean).length,
    0,
  );
  return Math.round(words / 2.3);
}

export function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
