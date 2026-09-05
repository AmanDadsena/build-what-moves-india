"use client";

import { useLang } from "@/components/Language";
import { languageFor, REJECTION_TITLES } from "@/lib/i18n";

/* The rejection's name, in the language somebody chose.
 *
 * The knowledge base has carried these in all eight languages for a
 * while, and until now they were fed to the search index and nowhere
 * else. So a member who switched the site to Tamil got a Tamil
 * navigation and then fifteen cards in English — which is close to
 * the worst version of a language switch, because it looks like it
 * worked right up until the point where it matters.
 *
 * What is translated here and what is not is a deliberate line.
 *
 * The title is ours. It is the plain-language name this product gives
 * the problem — "your name is spelled differently in two places" —
 * and translating it is the entire point: it is the sentence somebody
 * has to recognise as their own before anything else on the site can
 * help them.
 *
 * The verbatim remark is not ours and is never translated. It is the
 * literal string EPFO put on the member's screen, in the English it
 * was written in, and a member matching what they were shown against
 * what is on this page needs those to be the same characters. A
 * translated remark would look more helpful and be useless.
 *
 * Long explanations stay in English and Hindi, as they were, for the
 * reason /how-real gives: a wrong sentence about a statutory period,
 * in a language nobody in the loop can check, dressed in an interface
 * that looks official, is the exact harm this product exists to
 * prevent. A title carries no such claim.
 */

export function RejectionTitle({
  id,
  /* The Hindi title, which the cards have always shown under the
     English one. It stays the default second line, because the
     bilingual pairing is part of the design rather than a fallback. */
  hi,
  className = "",
}: {
  id: string;
  hi: string;
  className?: string;
}) {
  const { lang } = useLang();

  const translated = lang === "hi" ? hi : REJECTION_TITLES[id]?.[lang];
  const text = translated ?? hi;
  const tag = languageFor(translated ? lang : "hi").tag;

  /* Devanagari has a face loaded; the other scripts fall to the
     system's, which every Android and iOS device ships. Setting lang
     is what makes that choice correctly — and it is also what makes a
     screen reader switch voice rather than reading Tamil in English
     phonemes. */
  const deva = tag.startsWith("hi") || tag.startsWith("mr");

  return (
    <p
      lang={tag}
      className={`${deva ? "font-deva " : ""}text-sm text-ink-faint ${className}`}
    >
      {text}
    </p>
  );
}

/* The same title, but shown only where it adds something.
 *
 * The rejection page already carries the Hindi *explanation* under
 * the English one, and that pairing stays — long prose is English and
 * Hindi by policy, for the reason /how-real gives. So this renders
 * nothing at all for English and Hindi, and only appears when one of
 * the other six languages is chosen, where otherwise the whole page
 * would be in a language the member did not pick.
 *
 * It is placed under the heading rather than replacing it, because
 * the English title is what the rest of the site, the search results
 * and any link somebody was sent all use — a member comparing the two
 * should be able to see they are the same page. */
export function TranslatedTitle({ id }: { id: string }) {
  const { lang } = useLang();

  if (lang === "en" || lang === "hi") return null;
  const text = REJECTION_TITLES[id]?.[lang];
  if (!text) return null;

  const tag = languageFor(lang).tag;
  return (
    <p
      lang={tag}
      className={`${tag.startsWith("mr") ? "font-deva " : ""}lede measure text-ink-faint mb-4`}
    >
      {text}
    </p>
  );
}
