/* Checks every link and asset in the built site actually resolves.
 *
 * A static export fails quietly. Nothing errors when a page links to a
 * route that no longer exists — the file is simply written with a dead
 * href, and it stays dead until somebody clicks it. Renaming a route,
 * deleting an unused file that turned out to be used, or building a
 * URL from the wrong kind of path all produce exactly the same
 * silence.
 *
 * So this walks out/, reads every href and src, and resolves each one
 * against what the build actually wrote.
 *
 *   npm run audit          (after npm run build)
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "out");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const toUrl = (file) => "/" + path.relative(OUT, file).split(path.sep).join("/");

async function main() {
  const files = await walk(OUT);
  const present = new Set(files.map(toUrl));
  const pages = files.filter((f) => f.endsWith(".html"));

  const deadLinks = new Map();
  const deadAssets = new Map();

  const note = (map, url, page) => {
    if (!map.has(url)) map.set(url, new Set());
    map.get(url).add(toUrl(page));
  };

  for (const page of pages) {
    const html = await readFile(page, "utf8");

    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      // Anything with an extension is a file, not a route.
      if (/\.[a-z0-9]+$/i.test(href)) {
        if (!present.has(href)) note(deadAssets, href, page);
        continue;
      }
      const asDir = href.endsWith("/") ? `${href}index.html` : `${href}/index.html`;
      if (!present.has(asDir) && !present.has(href)) note(deadLinks, href, page);
    }

    for (const [, src] of html.matchAll(/src="(\/[^"?]*)"/g)) {
      if (!present.has(src)) note(deadAssets, src, page);
    }
  }

  const report = (label, map) => {
    if (map.size === 0) {
      console.log(`  ${label}: none`);
      return;
    }
    console.log(`  ${label}: ${map.size}`);
    for (const [url, on] of map) {
      const where = [...on].slice(0, 3).join(", ");
      const more = on.size > 3 ? ` and ${on.size - 3} more` : "";
      console.log(`    ${url}\n      on ${where}${more}`);
    }
  };

  console.log(`\n  pages: ${pages.length}`);
  report("dead links", deadLinks);
  report("missing assets", deadAssets);
  console.log("");

  if (deadLinks.size > 0 || deadAssets.size > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
