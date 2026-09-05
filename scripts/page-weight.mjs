/* What a page actually costs somebody on a cold load.
 *
 * This site's argument for being a static export is that its readers
 * are on slow and intermittent connections. That is a claim about
 * bytes, and it was never measured — which is how the Devanagari face
 * came to ship three weights and two scripts, 118 KB of which two
 * weights rendered nowhere.
 *
 * Measuring it in a browser does not work. Resource timing reports
 * zero for anything already cached, and a second visit to your own
 * site is always cached, so the number quietly halves every time you
 * look at it. Every reading taken that way during this build
 * disagreed with the last one.
 *
 * So this reads the build instead. Vercel serves static text with
 * brotli and ships woff2 as it is, because woff2 already carries its
 * own compression — so text assets are compressed here and fonts are
 * counted at their real size. Deterministic, reproducible, and it
 * runs without a network.
 *
 *   npm run weigh                 (after npm run build)
 *   npm run weigh -- why/index.html
 *
 * The figure is an estimate in one direction only: a CDN
 * pre-compresses static files at high quality, which is what is used
 * here, and anything less produces a slightly larger transfer. The
 * gzip column is the worst case — a client too old to accept brotli.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "out");

const PAGES = process.argv.slice(2);
const DEFAULT = [
  "index.html",
  "why/index.html",
  "employer-gone/index.html",
  "search/index.html",
];

function brotli(buf) {
  return brotliCompressSync(buf, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: 11,
      [constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
    },
  }).length;
}

const isFont = (ref) => /\.woff2?$/.test(ref);
const kind = (ref) =>
  isFont(ref) ? "font" : ref.endsWith(".css") ? "css" : "js";

async function weigh(page) {
  let html;
  try {
    html = await readFile(path.join(OUT, page));
  } catch {
    return null;
  }

  const refs = new Set();
  for (const m of html.toString().matchAll(/(?:src|href)="(\/_next\/[^"]+)"/g)) {
    refs.add(m[1].split("?")[0]);
  }

  const totals = { html: 0, css: 0, js: 0, font: 0 };
  let wire = brotli(html);
  let worst = gzipSync(html, { level: 9 }).length;
  let raw = html.length;
  totals.html = wire;
  let requests = 1;

  for (const ref of refs) {
    let buf;
    try {
      buf = await readFile(path.join(OUT, ref.replace(/^\//, "")));
    } catch {
      // Referenced but not written. audit-links.mjs is what reports
      // that; this only weighs what is there.
      continue;
    }
    const k = kind(ref);
    const size = isFont(ref) ? buf.length : brotli(buf);
    totals[k] += size;
    wire += size;
    worst += isFont(ref) ? buf.length : gzipSync(buf, { level: 9 }).length;
    raw += buf.length;
    requests += 1;
  }

  return { page, wire, worst, raw, requests, totals };
}

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + " KB";

const results = [];
for (const page of PAGES.length > 0 ? PAGES : DEFAULT) {
  const r = await weigh(page);
  if (r) results.push(r);
  else console.log(`\n  ${page} — not in the build`);
}

if (results.length === 0) {
  console.log("\n  Nothing to weigh. Run npm run build first.\n");
  process.exit(1);
}

console.log("");
for (const r of results) {
  const label = "/" + r.page.replace(/index\.html$/, "");
  console.log(`  ${label}`);
  console.log(
    `  ${kb(r.wire)}  over the wire, ${r.requests} requests` +
      `   (js ${(r.totals.js / 1024).toFixed(0)}, font ${(r.totals.font / 1024).toFixed(0)}, ` +
      `html ${(r.totals.html / 1024).toFixed(0)}, css ${(r.totals.css / 1024).toFixed(0)})`,
  );
  console.log(
    `  ${kb(r.worst)}  without brotli, and ${kb(r.raw)} uncompressed\n`,
  );
}

/* A budget rather than a target. Somewhere past this the argument for
   a static export starts undermining itself, and it is better to be
   told at build time than to find out from a judge. */
const BUDGET = 450 * 1024;
const over = results.filter((r) => r.wire > BUDGET);
if (over.length > 0) {
  console.log(`  Over the ${BUDGET / 1024} KB budget:`);
  for (const r of over) console.log(`    /${r.page} at ${kb(r.wire).trim()}`);
  console.log("");
  process.exitCode = 1;
}
