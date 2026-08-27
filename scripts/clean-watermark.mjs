/* Removes the generator's corner glyph from the illustration sources.
 *
 * The image model stamps a small four-pointed mark at a fixed pixel
 * inset from the bottom-right corner — the same offset regardless of
 * output size, which is what makes this reliable rather than a guess.
 *
 * It sits on flat ground in every one of these illustrations, so the
 * patch is filled with the median colour of a ring taken from just
 * outside the patch. Median rather than mean: a mean gets dragged by
 * any stray line clipping the ring, a median ignores it as long as
 * most of the ring agrees.
 *
 * Note that this removes only the visible mark. The invisible SynthID
 * watermark the model embeds is unaffected by resampling and stays in
 * the file, so these remain machine-identifiable as generated — which
 * is correct, and is stated on the About this build page.
 *
 *   node scripts/clean-watermark.mjs
 *
 * Reads assets-src/*.png, writes assets-src/clean/*.png.
 */

import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "assets-src");
const OUT = path.join(SRC, "clean");

/* Measured from the sources: the glyph's centre sits this far in from
   the bottom-right corner, and spans roughly 80px. The patch is a
   little larger than the glyph so its soft outer edge goes too. */
const INSET_X = 242;
const INSET_Y = 247;
const PATCH = 120;

/* Per-file overrides, for the one illustration where a drawn line
   passes close enough that a square patch would clip it. Values are
   pixels trimmed from that side of the patch. */
const TRIM = {
  "help.png": { left: 18 },
};

/* Two of the illustrations put the glyph directly on top of a drawn
   corner, where a flat fill leaves a square notch or a broken line.
   Both of those shapes are rounded rectangles, so their bottom-right
   corner is their own top-right corner turned upside down: copying it
   from there and flipping restores the exact curve rather than
   approximating it.
       axis = the shape's vertical centre line, measured from the
       source by scanning for its top and bottom strokes. */
const MIRROR = {
  "advances.png": { axis: 1232 }, // card outline, strokes at y 924 and 1540
  "forms.png": { axis: 870 }, //    teal panel, edges at y 281 and 1459
};

function medianColour(data, width, height, channels) {
  /* Sample the patch's perimeter only. Anything inside is the glyph
     we are trying to lose. */
  const rs = [];
  const gs = [];
  const bs = [];
  const push = (x, y) => {
    const i = (y * width + x) * channels;
    rs.push(data[i]);
    gs.push(data[i + 1]);
    bs.push(data[i + 2]);
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  const mid = (a) => {
    a.sort((p, q) => p - q);
    return a[Math.floor(a.length / 2)];
  };
  return { r: mid(rs), g: mid(gs), b: mid(bs) };
}

async function clean(name) {
  const from = path.join(SRC, name);
  const meta = await sharp(from).metadata();
  const trim = TRIM[name] ?? {};

  const left = meta.width - INSET_X - PATCH / 2 + (trim.left ?? 0);
  const top = meta.height - INSET_Y - PATCH / 2 + (trim.top ?? 0);
  const width = PATCH - (trim.left ?? 0) - (trim.right ?? 0);
  const height = PATCH - (trim.top ?? 0) - (trim.bottom ?? 0);

  // The ring is one patch-width larger all round, so the colours it
  // reads are outside the glyph but on the same surface.
  const ring = 14;
  const region = {
    left: left - ring,
    top: top - ring,
    width: width + ring * 2,
    height: height + ring * 2,
  };

  const { data, info } = await sharp(from)
    .extract(region)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { r, g, b } = medianColour(data, info.width, info.height, info.channels);

  const mirror = MIRROR[name];
  const fill = mirror
    ? await sharp(from)
        .extract({
          left,
          top: 2 * mirror.axis - (top + height),
          width,
          height,
        })
        .flip()
        .png()
        .toBuffer()
    : await sharp({
        create: { width, height, channels: 3, background: { r, g, b } },
      })
        .png()
        .toBuffer();

  await sharp(from)
    .composite([{ input: fill, left, top }])
    .png()
    .toFile(path.join(OUT, name));

  return (
    `${name.padEnd(16)} patch ${width}×${height} at ${left},${top}  ` +
    (mirror ? `mirrored about y=${mirror.axis}` : `fill rgb(${r},${g},${b})`)
  );
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(SRC)).filter((f) => f.endsWith(".png"));
  for (const f of files) console.log(await clean(f));
  console.log(`\n${files.length} cleaned into assets-src/clean/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
