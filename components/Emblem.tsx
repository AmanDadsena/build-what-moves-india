/* An original mark, drawn for this build.
 *
 * Deliberately not the EPFO logo and not the State Emblem: using
 * either would imply an endorsement the brief forbids and this
 * project does not have.
 *
 * The motif is a sheet with its corner turned up. That is the whole
 * argument of the product in one shape — a member is handed a
 * sentence, and everything that would explain it is on the page
 * underneath. The single short rule on the sheet is the remark
 * itself: too short to say anything, which is the point.
 *
 * It replaces a ring of ascending columns. That mark was competent
 * and said "finance", which every fintech logo already says; this one
 * says what this build is actually for. It is also three shapes
 * rather than eight, so it survives being drawn at sixteen pixels in
 * a browser tab.
 *
 * Monochrome by default so it inherits whatever colour surrounds it —
 * navy on paper, off-white on the footer band. Pass `accent` where
 * there is room for the fold to carry gold.
 */

export function Emblem({
  size = 40,
  className = "",
  accent = false,
}: {
  size?: number;
  className?: string;
  /** Picks out the turned corner in gold. */
  accent?: boolean;
}) {
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
      {/* The sheet, with the top-right corner cut away for the fold. */}
      <path
        d="M18 8h22l16 16v30a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Z"
        fill="currentColor"
        opacity="0.14"
      />
      <path
        d="M18 8h22l16 16v30a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* The corner, turned up. */}
      <path
        d="M40 8v12a4 4 0 0 0 4 4h12"
        stroke={accent ? "var(--color-ochre)" : "currentColor"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* The remark. One line, and too short to say anything. */}
      <rect
        x="22"
        y="38"
        width="16"
        height="5"
        rx="2.5"
        fill="currentColor"
      />
    </svg>
  );
}
