/* Opening the two overlays, without dragging them in.
 *
 * The command palette and the page reader are both mounted once at
 * the layout root and opened from elsewhere — the masthead's key cap,
 * a palette command, a keyboard shortcut. Each used to export its own
 * opener, which is tidy until you look at what importing it costs.
 *
 * The masthead search box wanted one line: openPalette. Importing it
 * from the palette pulled in the palette, which pulls in the search
 * index, which pulls in the rejection knowledge base, the glossary,
 * the services, the document templates, the office list and the
 * phrase book. So every page on this site shipped the whole corpus in
 * its first bundle in order to render a key cap that says Ctrl K.
 *
 * A module bundler cannot see that only the function was wanted. It
 * can only see one file importing another.
 *
 * So the openers live here, on their own, importing nothing. Both the
 * callers and the overlays depend on this and not on each other,
 * which is also what makes the overlays loadable on demand: nothing
 * in the initial bundle has to name them any more.
 *
 * These are events rather than a context on purpose. The callers are
 * scattered — a masthead rendered on the server, a command inside the
 * other overlay — and standing up a provider threaded through the
 * whole tree to carry two booleans would be a larger thing than the
 * problem.
 */

export const PALETTE_EVENT = "rk-palette";
export const PAGE_READER_EVENT = "rk-page-reader";

/** Opens the command palette, loading it first if it has not been
 *  needed yet. */
export function openPalette() {
  window.dispatchEvent(new Event(PALETTE_EVENT));
}

/** Opens the page reader's player. */
export function openPageReader() {
  window.dispatchEvent(new Event(PAGE_READER_EVENT));
}

/** True where a keystroke is going into something the member is
 *  typing in, so a bare "/" does not eat the slash of a date.
 *
 *  Here rather than in the palette because the mount that decides
 *  whether to load the palette has to answer the same question, and
 *  two copies of this rule would drift. */
export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** Whether this keystroke is one of the two that open the palette:
 *  Ctrl/Cmd+K anywhere, or a bare "/" outside a field. */
export function opensPalette(e: KeyboardEvent): boolean {
  const combo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
  const slash =
    e.key === "/" && !e.ctrlKey && !e.metaKey && !isTypingTarget(e.target);
  return combo || slash;
}
