/* An original mark, drawn for this build.
 *
 * Deliberately not the EPFO logo and not the State Emblem: using
 * either would imply an endorsement the brief forbids and this
 * project does not have.
 *
 * The device is a struck coin. A milled rim is the oldest visual
 * shorthand there is for money issued by an authority — it is pure
 * geometry, it belongs to nobody, and it carries the weight of an
 * official seal without borrowing anything. Inside it, three columns
 * rising on a ledger rule: a fund accumulating, held on a line.
 *
 * It replaces a folded sheet, which was conceptually neat and read as
 * a generic file icon; and before that a plain ring of columns, which
 * said "finance" in the way every fintech logo already does. The rim
 * is what makes this one read as an institution rather than an app.
 *
 * Monochrome by default so it inherits whatever colour surrounds it —
 * navy on paper, off-white on the footer band. Pass `accent` where
 * there is room for the rim and the tallest column to carry gold.
 */

/* The milled edge, generated rather than drawn: forty-four teeth is
   the point where the notches read as a texture at 24px and still
   resolve as individual cuts at 160. */
const TEETH = 44;
const milled = (r: number, depth: number) => {
  let d = "";
  for (let i = 0; i < TEETH; i++) {
    const a = (i / TEETH) * Math.PI * 2;
    const x1 = 32 + Math.cos(a) * (r - depth);
    const y1 = 32 + Math.sin(a) * (r - depth);
    const x2 = 32 + Math.cos(a) * r;
    const y2 = 32 + Math.sin(a) * r;
    d += `M${x1.toFixed(2)},${y1.toFixed(2)}L${x2.toFixed(2)},${y2.toFixed(2)}`;
  }
  return d;
};

const RIM = milled(25.6, 3.4);

export function Emblem({
  size = 40,
  className = "",
  accent = false,
}: {
  size?: number;
  className?: string;
  /** Picks out the rim and the tallest column in gold. */
  accent?: boolean;
}) {
  const gold = accent ? "var(--color-ochre)" : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="EPF Member Portal emblem"
      className={className}
      fill="none"
    >
      {/* The rim, milled */}
      <circle cx="32" cy="32" r="22.2" stroke={gold} strokeWidth="2.2" />
      <path d={RIM} stroke={gold} strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />

      {/* The inner rule of a seal */}
      <circle
        cx="32"
        cy="32"
        r="18"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* A fund accumulating, on a ledger line */}
      <rect x="21.5" y="33" width="5.5" height="9" rx="1.9" fill="currentColor" />
      <rect x="29.2" y="27.5" width="5.5" height="14.5" rx="1.9" fill="currentColor" />
      <rect x="37" y="21.5" width="5.5" height="20.5" rx="1.9" fill={gold} />
      <path
        d="M20 45.5h24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
