/* Structural accessibility of the built pages.
 *
 * The fourth of the checks that keep this site's claims honest:
 * audit-links resolves every href, page-weight measures the cold
 * load, contrast measures the rendered text, and this reads the
 * markup for the faults that are invisible from a screenshot.
 *
 * All four exist because the same thing kept happening. A claim went
 * into the submission notes, nothing measured it, and when something
 * finally did it found a real fault: 33 pages sharing one input id,
 * two buttons at 1.59:1, 69 KB of a font nobody rendered. None of
 * those were visible to anybody looking at the site.
 *
 *   npm run build && npm run a11y
 *
 * What it checks, and why each one is here rather than in a generic
 * linter's default set:
 *
 *   - Duplicate ids, because a component with a hard-coded id that
 *     gets rendered twice silently points every <label for> at the
 *     first copy. That is how the mobile search box came to have no
 *     accessible name on 33 pages.
 *   - Controls with no accessible name, counting a wrapping <label>
 *     as well as one with a `for`. An earlier version of this only
 *     understood `for`, reported twenty false positives, and was
 *     therefore ignored — a checker that cries wolf is worse than no
 *     checker.
 *   - Heading structure: exactly one h1, no skipped level. A blind
 *     reader skims by jumping between headings; a page whose section
 *     labels are paragraphs offers nothing to jump between.
 *   - The landmark, the language, the title, and the small things
 *     that are free to get right and quietly costly to get wrong.
 *
 * Exits non-zero on any finding, so it can gate a build.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "out");

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

const findings = new Map();
function note(kind, page, detail) {
  if (!findings.has(kind)) findings.set(kind, []);
  findings.get(kind).push(`${path.relative(OUT, page)} — ${detail}`);
}

/** Is there a <label for="id"> anywhere in the document? Substring
 *  scan rather than a regex, because an id may contain characters a
 *  naive pattern would treat as syntax. */
function hasLabelFor(html, id) {
  let i = 0;
  for (;;) {
    i = html.indexOf("<label", i);
    if (i === -1) return false;
    const end = html.indexOf(">", i);
    if (end === -1) return false;
    if (html.slice(i, end).includes(`for="${id}"`)) return true;
    i = end;
  }
}

/** Is this control inside a <label>? Walks backwards counting label
 *  opens and closes, which is what an implicit association is. */
function insideLabel(html, at) {
  const before = html.lastIndexOf("<label", at);
  if (before === -1) return false;
  const closed = html.indexOf("</label>", before);
  return closed === -1 || closed > at;
}

function named(tag, html, at) {
  if (tag.includes("aria-label=") || tag.includes("aria-labelledby=")) return true;
  if (insideLabel(html, at)) return true;
  const id = tag.match(/\sid="([^"]+)"/);
  return !!(id && hasLabelFor(html, id[1]));
}

let pages = 0;
for await (const file of walk(OUT)) {
  pages += 1;
  const html = await readFile(file, "utf8");

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) note("image with no alt", file, m[0].slice(0, 110));
  }

  for (const m of html.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
    if (/type="(hidden|submit|button|image|reset)"/.test(m[0])) continue;
    if (!named(m[0], html, m.index)) {
      note("control with no accessible name", file, m[0].slice(0, 120));
    }
  }

  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const text = m[2].replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, " ").trim();
    if (!text && !m[1].includes("aria-label")) {
      note("button with no name", file, m[0].slice(0, 130));
    }
  }

  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    if (!m[1].includes("href=")) continue;
    const text = m[2].replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, " ").trim();
    if (!text && !m[1].includes("aria-label")) {
      note("link with no name", file, m[0].slice(0, 130));
    }
  }

  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const h1s = levels.filter((h) => h === 1).length;
  if (h1s === 0) note("no h1", file, "the page has no top-level heading");
  if (h1s > 1) note("more than one h1", file, `${h1s} of them`);
  let previous = 0;
  for (const level of levels) {
    if (previous && level > previous + 1) {
      note("skipped heading level", file, `h${previous} to h${level}`);
      break;
    }
    previous = level;
  }

  if (!/<html[^>]*\slang=/.test(html)) note("no lang on <html>", file, "");
  if (!/<title>[^<]+<\/title>/.test(html)) note("no title", file, "");
  if (!/<main\b/.test(html)) note("no main landmark", file, "");

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const duplicated = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
  if (duplicated.length) {
    note("duplicate id", file, duplicated.join(", ").slice(0, 110));
  }

  for (const m of html.matchAll(/tabindex="([1-9]\d*)"/g)) {
    note("positive tabindex", file, m[0]);
  }

  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(m[0])) {
      note("target=_blank without noopener", file, m[0].slice(0, 110));
    }
  }
}

if (pages === 0) {
  console.log("\n  Nothing to check. Run npm run build first.\n");
  process.exit(1);
}

console.log(`\n  ${pages} pages checked\n`);

const ordered = [...findings.entries()].sort((a, b) => b[1].length - a[1].length);
for (const [kind, list] of ordered) {
  console.log(`  ${kind} — ${list.length}`);
  for (const line of list.slice(0, 6)) console.log(`    ${line}`);
  if (list.length > 6) console.log(`    ...and ${list.length - 6} more`);
  console.log("");
}

if (ordered.length === 0) {
  console.log("  nothing found\n");
} else {
  process.exitCode = 1;
}
