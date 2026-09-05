"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { PALETTE_EVENT, opensPalette } from "@/lib/overlays";

/* Holds the door for the command palette without carrying it.
 *
 * The palette is the most expensive component on this site and the
 * least used. It searches everything, so it imports the search index,
 * which imports the rejection knowledge base, the glossary, the
 * services, the document templates, the office list and the phrase
 * book — about 38 KB compressed. Mounted at the layout root, that
 * arrived in the first bundle of every page on the site, so a member
 * opening one rejection page on a slow connection downloaded the
 * whole corpus in order to be able to press Ctrl+K, which almost none
 * of them ever do.
 *
 * The people this is written for are the ones that costs most. The
 * palette exists for the NGO caseworker and the union clerk handling
 * thirty of these on a desktop — the argument for it is in the
 * submission notes and it is a good one — but they are a small
 * fraction of the traffic, and they were being subsidised by everyone
 * arriving on a phone with one rejected claim.
 *
 * So this stays behind instead: a listener, and nothing else. It
 * knows the two keystrokes that open the palette and the event the
 * masthead's key cap dispatches, and on any of them it fetches the
 * palette and tells it to open. What it deliberately does not know is
 * anything about what the palette does — the shared rule for "is this
 * an opening keystroke" lives in lib/overlays.ts so there is one copy
 * of it rather than two that drift.
 *
 * The cost is a short wait on the very first Ctrl+K, once per visit,
 * paid by the person who asked for it. Everyone else stops paying for
 * it at all.
 */

const CommandPalette = dynamic(
  () => import("@/components/CommandPalette").then((m) => m.CommandPalette),
  /* No server render: it is a dialog that starts closed, so there is
     nothing to put in the HTML, and asking for one would only add the
     module back to the server bundle. */
  { ssr: false },
);

export function PaletteMount() {
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    // Once it is here, it owns its own keyboard handling.
    if (wanted) return;

    const wake = () => setWanted(true);
    const onKey = (e: KeyboardEvent) => {
      if (!opensPalette(e)) return;
      // Ctrl+K is the browser's own shortcut in several browsers, so
      // this has to be claimed here rather than after the chunk
      // arrives — by then the address bar has the focus.
      e.preventDefault();
      wake();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, wake);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, wake);
    };
  }, [wanted]);

  /* autoOpen because the keystroke that asked for it happened before
     the component existed. Without it the palette would arrive
     correctly and sit there closed, and the member would have to
     press the shortcut twice. */
  return wanted ? <CommandPalette autoOpen /> : null;
}
