/* Turns the generated illustrations into web assets.
 *
 * The originals arrive from the image model at around 2800px and five
 * megabytes each. Shipping those would contradict the one thing this
 * build claims about itself — that it opens on a slow connection. Nine
 * of them unprocessed is forty-four megabytes, which on a 3G line is
 * somewhere past three minutes of waiting before the first illustration
 * appears.
 *
 * Flat vector artwork is the best possible case for lossy compression:
 * there is almost no high-frequency detail for the encoder to lose, so
 * WebP at quality 80 lands these two orders of magnitude smaller with
 * nothing visible given up at display size.
 *
 * Sources live in assets-src/ and are not committed. Only the outputs
 * in public/img/ are, so the repository stays small and the build stays
 * reproducible for anyone who regenerates the originals from
 * IMAGE-PROMPTS.md.
 *
 *   node scripts/build-images.mjs
 */

import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/* Prefer the de-watermarked copies when clean-watermark.mjs has run,
   fall back to the raw sources otherwise. */
const RAW = path.join(root, "assets-src");
const SRC = existsSync(path.join(RAW, "clean")) ? path.join(RAW, "clean") : RAW;
const IMG = path.join(root, "public", "img");

/* Each illustration is rendered inside a card no wider than about
   620 CSS pixels, so 1240 covers a 2× display and nothing more. Asking
   for more pixels than a screen can show is the most common way a site
   ends up slow for no benefit anybody can see. */
const CARD_WIDTH = 1240;

const JOBS = [
  // The social preview. Must stay PNG or JPEG — several of the places a
  // submission link gets pasted still do not unfurl WebP.
  {
    src: "og.png",
    out: [{ to: path.join(IMG, "og.png"), w: 1200, h: 630, fit: "cover", png: true }],
  },

  /* The app icons are not built here any more. They come from
     assets-src/mark.svg through scripts/build-icons.mjs, so one vector
     drives the tab icon, the home-screen icon and the masthead — and
     nothing can drift. Leaving the old raster job in would have
     silently overwritten them on the next run. */

  // In-page illustrations. 7:5 originals, kept at their own ratio.
  ...["help", "forms", "compliance", "deduction", "deadlines", "advances"].map(
    (name) => ({
      src: `${name}.png`,
      out: [{ to: path.join(IMG, `${name}.webp`), w: CARD_WIDTH }],
    }),
  ),

  // Square.
  {
    src: "pension.png",
    out: [{ to: path.join(IMG, "pension.webp"), w: 900 }],
  },
];

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

async function main() {
  if (!existsSync(RAW)) {
    console.error(
      `\nNo assets-src/ directory.\n\n` +
        `Generate the illustrations using IMAGE-PROMPTS.md, save them into\n` +
        `assets-src/ under the filenames listed there, then run this again.\n`,
    );
    process.exit(1);
  }

  await mkdir(IMG, { recursive: true });

  const present = new Set(await readdir(SRC));
  let before = 0;
  let after = 0;
  const rows = [];

  for (const job of JOBS) {
    if (!present.has(job.src)) {
      rows.push([job.src, "—", "missing, skipped"]);
      continue;
    }
    const from = path.join(SRC, job.src);
    before += (await stat(from)).size;

    for (const o of job.out) {
      await mkdir(path.dirname(o.to), { recursive: true });

      let pipe = sharp(from).resize({
        width: o.w,
        height: o.h,
        fit: o.fit ?? "inside",
        withoutEnlargement: true,
      });

      // PNG here is flat art with a small palette, so palette
      // quantisation is nearly lossless and roughly halves the file.
      pipe = o.png
        ? pipe.png({ compressionLevel: 9, palette: true, quality: 90 })
        : pipe.webp({ quality: 80, effort: 6 });

      const info = await pipe.toFile(o.to);
      after += info.size;
      rows.push([
        job.src,
        path.relative(root, o.to).replace(/\\/g, "/"),
        `${info.width}×${info.height}  ${kb(info.size)}`,
      ]);
    }
  }


  const w0 = Math.max(...rows.map((r) => r[0].length));
  const w1 = Math.max(...rows.map((r) => r[1].length));
  for (const r of rows) {
    console.log(`${r[0].padEnd(w0)}  →  ${r[1].padEnd(w1)}  ${r[2]}`);
  }
  console.log(
    `\n${kb(before)} of sources → ${kb(after)} shipped ` +
      `(${(before / after).toFixed(0)}× smaller)\n`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
