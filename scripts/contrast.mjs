/* The contrast auditor, as a thing that can be re-run.
 *
 * The submission has claimed "every page AA, measured on rendered
 * text" for a while, and until this file existed there was nothing
 * that measured it. When it was finally checked, two buttons on the
 * site were at 1.59:1 — a read-aloud control and a share control,
 * both passed into a page hero, both inheriting the light-background
 * palette and landing on navy. Not hard to read: invisible.
 *
 * That they were both accessibility affordances is the part worth
 * keeping in mind. The controls that vanish are the ones nobody
 * notices are missing, because the people they fail are the least
 * able to report it.
 *
 * This does not run in Node — contrast is a property of rendered
 * pixels, and there are no pixels here. It prints the script to paste
 * into a browser console on any page of the site, so the check is
 * reproducible by anybody, including somebody assessing this build
 * who does not want to take the claim on trust.
 *
 *   npm run contrast          then paste the output into a console
 *
 * What it measures, and what it will not guess at:
 *
 *   - Foreground alpha is composited over the resolved background,
 *     so a colour written as text-paper/65 is judged as painted.
 *   - A gradient is judged at every one of its colour stops, and the
 *     worst one decides. Text that clears the dark end of a gradient
 *     and fails the light end has failed for whoever is looking at
 *     that part of it.
 *   - Anything over a bitmap is counted and reported separately
 *     rather than scored, because a number invented for those would
 *     be worse than saying they need an eye.
 *   - Large text is the WCAG definition — 24px, or 18.66px at 700 —
 *     and is held to 3:1 rather than 4.5:1.
 */

const SCRIPT = String.raw`
(() => {
  const p = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const a = m[1].split(/[,\s\/]+/).filter(Boolean).map(Number);
    return { r: a[0], g: a[1], b: a[2], a: a.length > 3 ? a[3] : 1 }; };
  const over = (f, b) => ({ r: f.r*f.a + b.r*(1-f.a), g: f.g*f.a + b.g*(1-f.a), b: f.b*f.a + b.b*(1-f.a), a: 1 });
  const lum = ({r,g,b}) => { const f = v => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b); };
  const ratio = (x,y) => { const a = lum(x), b = lum(y); return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); };
  const WHITE = { r:255, g:255, b:255, a:1 };

  const backdrops = (el) => {
    const layers = []; let node = el, bitmap = false;
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node);
      const bi = cs.backgroundImage;
      if (bi && bi !== "none") {
        if (/url\(/.test(bi)) bitmap = true;
        const stops = [...bi.matchAll(/rgba?\([^)]+\)/g)].map(m => p(m[0])).filter(Boolean);
        if (stops.length) layers.push(stops);
      }
      const bg = p(cs.backgroundColor);
      if (bg && bg.a > 0) { layers.push([bg]); if (bg.a >= 1) break; }
      node = node.parentElement;
    }
    if (bitmap) return { bitmap: true, list: [] };
    if (!layers.length) return { bitmap: false, list: [WHITE] };
    const base = layers.slice(1).flat().reduceRight((acc, c) => over(c, acc), WHITE);
    return { bitmap: false, list: layers[0].map(s => over(s, base)) };
  };

  const out = { fail: [], bitmap: 0, checked: 0, min: Infinity };
  const seen = new Set();

  document.querySelectorAll("body *").forEach((el) => {
    const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim().length > 1)
      .map(n => n.textContent.trim()).join(" ");
    if (!own) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return;

    const { bitmap, list } = backdrops(el);
    if (bitmap) { out.bitmap += 1; return; }
    const fgRaw = p(cs.color);
    if (!fgRaw) return;

    const size = parseFloat(cs.fontSize);
    const w = Number(cs.fontWeight) || 400;
    const need = (size >= 24 || (size >= 18.66 && w >= 700)) ? 3 : 4.5;

    let worst = Infinity, worstBg = null;
    for (const bg of list) { const cr = ratio(over(fgRaw, bg), bg); if (cr < worst) { worst = cr; worstBg = bg; } }
    out.checked += 1;
    if (worst < out.min) out.min = +worst.toFixed(2);
    if (worst < need) {
      const k = cs.color + "|" + cs.fontSize + "|" + own.slice(0, 20);
      if (seen.has(k)) return;
      seen.add(k);
      out.fail.push({ text: own.slice(0, 44), ratio: +worst.toFixed(2), need, size, weight: w,
        color: cs.color, bg: "rgb(" + Math.round(worstBg.r) + "," + Math.round(worstBg.g) + "," + Math.round(worstBg.b) + ")",
        cls: (el.className||"").toString().slice(0, 44) });
    }
  });
  out.fail.sort((a,b) => a.ratio - b.ratio);
  console.log(location.pathname, "| checked", out.checked, "| min", out.min,
    "| failures", out.fail.length, out.bitmap ? "| " + out.bitmap + " over images, unscored" : "");
  if (out.fail.length) console.table(out.fail);
  return out;
})()
`;

console.log(`
Paste this into a browser console on any page of the site.
It reports the lowest contrast ratio found and tables anything under AA.

Worth running at 1920 wide, in high contrast, and with the readable
typeface on — those change the palette, and the point of measuring is
that a mode meant to help is not quietly making something worse.
`);
console.log(SCRIPT.trim());
