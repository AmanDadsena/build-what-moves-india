/* An original mark, drawn for this build.

   Deliberately not the EPFO logo and not the State Emblem: using
   either would imply endorsement the brief forbids and this project
   does not have. What it borrows instead is the *grammar* of an
   institutional seal — a ring, a centred motif, strict symmetry —
   which is what actually makes a masthead read as serious.

   The motif is three ascending columns on a base rule: a fund
   accumulating, held on a ledger line. */

export function Emblem({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="EPF Member Portal emblem"
      className={className}
      fill="none"
    >
      {/* Outer ring */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
      {/* Inner ring — the double rule of a seal */}
      <circle
        cx="24"
        cy="24"
        r="18.5"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />

      {/* Accumulating columns */}
      <rect x="14" y="26" width="5" height="8" rx="1.6" fill="currentColor" />
      <rect
        x="21.5"
        y="21"
        width="5"
        height="13"
        rx="1.6"
        fill="currentColor"
        opacity="0.8"
      />
      <rect
        x="29"
        y="15"
        width="5"
        height="19"
        rx="1.6"
        fill="currentColor"
        opacity="0.6"
      />

      {/* Ledger line */}
      <path
        d="M12 36.5h24"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
