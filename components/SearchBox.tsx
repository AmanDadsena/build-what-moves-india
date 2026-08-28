"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { openPalette } from "@/components/CommandPalette";

/* The search box in the masthead.
 *
 * A plain form that navigates to /search with the query, rather than
 * anything live. There is no dropdown of suggestions under it and no
 * results appearing as you type: a panel that opens over the page on
 * every keystroke is hostile on a small screen, and worse on a slow
 * one, where it lands after you have already looked away.
 *
 * It is a form element and not a button pretending to be one, so
 * Enter works, browser autofill of past searches works, and a screen
 * reader announces it as the search landmark it is.
 *
 * The key cap on the right opens the command palette, which is the
 * live-results surface this field deliberately is not. It sits here
 * rather than replacing the field because the field needs no
 * JavaScript to work and the palette needs all of it: on a connection
 * where the bundle never arrives, this still searches the site.
 */

export function SearchBox({
  className = "",
  /** Show the Ctrl+K cap. Off where the row is already crowded. */
  shortcut = false,
}: {
  className?: string;
  shortcut?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mac, setMac] = useState(false);

  useEffect(() => {
    if (shortcut) {
      setMac(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent));
    }
  }, [shortcut]);

  return (
    <form
      role="search"
      action="/search/"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/search/?q=${encodeURIComponent(q)}` : "/search/");
      }}
      className={`relative ${className}`}
    >
      <label htmlFor="site-search" className="sr-only">
        Search this site
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        enterKeyHint="search"
        className={`w-full border border-rule-heavy bg-paper rounded-md pl-9 py-2 text-sm outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12 placeholder:text-ink-faint/70 ${
          shortcut ? "pr-[4.5rem]" : "pr-3"
        }`}
      />

      {shortcut && (
        <button
          type="button"
          onClick={openPalette}
          title="Search and commands"
          aria-label="Open the search and command palette"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 leading-none opacity-70 hover:opacity-100 transition-opacity"
        >
          <kbd className="kbd">{mac ? "⌘" : "Ctrl"}</kbd>
          <kbd className="kbd">K</kbd>
        </button>
      )}
      <span
        aria-hidden
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
      >
        <svg
          width="15"
          height="15"
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
    </form>
  );
}
