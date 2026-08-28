/* Rasterises the app mark to every size the platforms ask for.
 *
 * One SVG in, four files out. Before this the tab icon came from a
 * generated PNG in the old indigo palette while the masthead drew its
 * own SVG in navy — two marks for one product, drifting apart with
 * every change. Now the browser tab, the home-screen icon and the
 * social preview all come from assets-src/mark.svg.
 *
 *   node scripts/build-icons.mjs
 */

import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "assets-src", "mark.svg");
const APP = path.join(root, "app");
const IMG = path.join(root, "public", "img");

/* An ICO may hold PNG bytes directly since Vista, so the whole format
   is a 6-byte header, a 16-byte directory entry, and the image. It has
   to be RGBA: Next decodes app/favicon.ico to derive the <link> tags
   and its decoder rejects an indexed PNG outright. */
async function ico(svg, to, size) {
  const png = await sharp(svg, { density: 384 })
    .resize(size, size)
    .ensureAlpha()
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);

  const out = Buffer.concat([header, entry, png]);
  await writeFile(to, out);
  return out.length;
}

async function main() {
  const svg = await readFile(SRC);
  await mkdir(IMG, { recursive: true });

  const jobs = [
    { to: path.join(APP, "icon.png"), size: 512 },
    { to: path.join(APP, "apple-icon.png"), size: 180 },
    { to: path.join(IMG, "mark.png"), size: 256 },
  ];

  for (const job of jobs) {
    // density high enough that the vector is sampled above the target,
    // then resized down — rasterising at 1:1 leaves the curves ragged.
    const info = await sharp(svg, { density: 512 })
      .resize(job.size, job.size)
      .png({ compressionLevel: 9 })
      .toFile(job.to);
    const name = path.relative(root, job.to).split(path.sep).join("/");
    console.log(
      `${name.padEnd(22)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`,
    );
  }

  const size = await ico(svg, path.join(APP, "favicon.ico"), 48);
  console.log(`app/favicon.ico        48×48  ${(size / 1024).toFixed(1)} KB`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
