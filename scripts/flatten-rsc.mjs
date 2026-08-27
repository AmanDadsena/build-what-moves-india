import { readdir, mkdir, copyFile, stat } from "node:fs/promises";
import { join, dirname, basename } from "node:path";

/* ------------------------------------------------------------------
   Flatten Next's RSC payload paths for bare static hosting.

   `next build` with output: "export" writes each route's React
   payload as a nested directory:

       login/__next.login/__PAGE__.txt
       portal/<uan>/__next.portal/$d$uan/__PAGE__.txt

   but the client requests it as a single dotted filename:

       login/__next.login.__PAGE__.txt
       portal/<uan>/__next.portal.$d$uan.__PAGE__.txt

   On a Next-aware host an adapter rewrites between the two. We serve
   `out/` as a plain directory of files, so nothing does, every
   prefetch 404s, and each navigation silently degrades to a full page
   load instead of a client-side transition.

   This copies each payload to the flat name the client actually asks
   for. Cheap, and it makes navigation instant rather than a reload.
   ------------------------------------------------------------------ */

const ROOT = "out";
const SKIP = new Set([".vercel", "_next"]);

let copied = 0;

/** Everything from the `__next.*` directory down, joined with dots. */
async function flattenPayloads(dir, prefixSegments, destDir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await flattenPayloads(full, [...prefixSegments, entry.name], destDir);
    } else if (entry.isFile()) {
      const flat = [...prefixSegments, entry.name].join(".");
      await copyFile(full, join(destDir, flat));
      copied += 1;
    }
  }
}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (!entry.isDirectory()) continue;

    if (entry.name.startsWith("__next.")) {
      // The flat file sits beside this directory, not inside it.
      await flattenPayloads(full, [entry.name], dirname(full));
    } else {
      await walk(full);
    }
  }
}

try {
  await stat(ROOT);
} catch {
  console.error(`flatten-rsc: no ${ROOT}/ directory — run next build first`);
  process.exit(1);
}

await walk(ROOT);
console.log(`flatten-rsc: wrote ${copied} flat RSC payload files`);
