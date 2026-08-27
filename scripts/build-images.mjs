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
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/* Prefer the de-watermarked copies when clean-watermark.mjs has run,
   fall back to the raw sources otherwise. */
const RAW = path.join(root, "assets-src");
const SRC = existsSync(path.join(RAW, "clean")) ? path.join(RAW, "clean") : RAW;
const IMG = path.join(root, "public", "img");
const APP = path.join(root, "app");

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

  // App icon. Next reads app/icon.png and app/apple-icon.png as file
  // conventions and writes the <link> tags itself, so these two paths
  // are load-bearing names, not decoration.
  {
    src: "icon.png",
    out: [
      { to: path.join(APP, "icon.png"), w: 512, h: 512, fit: "cover", png: true },
      { to: path.join(APP, "apple-icon.png"), w: 180, h: 180, fit: "cover", png: true },
      { to: path.join(IMG, "mark.png"), w: 256, h: 256, fit: "cover", png: true },
    ],
  },

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

/* Writes a real .ico wrapping a PNG.
 *
 * Since Vista an ICO entry may hold PNG bytes directly rather than the
 * old bitmap structure, so the whole format is a 6-byte header, one
 * 16-byte directory entry, and the PNG. It is worth the twenty lines:
 * app/favicon.ico takes precedence over app/icon.png in every browser,
 * so leaving the framework's default there would keep the default mark
 * in the tab no matter what else we generate. */
async function writeIco(src, to, size) {
  /* RGBA, not palette. Next decodes app/favicon.ico with Rust's image
     crate to derive the <link> tags, and that decoder rejects an
     indexed PNG inside an ICO container outright — the build fails
     with "The PNG is not in RGBA format!" rather than degrading. */
  const png = await sharp(src)
    .resize(size, size, { fit: "cover" })
    .ensureAlpha()
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // width, 0 means 256
  entry.writeUInt8(size === 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette size, 0 for truecolour
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12); // offset: 6 header + 16 entry

  const ico = Buffer.concat([header, entry, png]);
  await writeFile(to, ico);
  return ico.length;
}

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

  const icoBytes = await writeIco(
    path.join(SRC, "icon.png"),
    path.join(APP, "favicon.ico"),
    48,
  );
  after += icoBytes;
  rows.push(["icon.png", "app/favicon.ico", `48×48  ${kb(icoBytes)}`]);

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
