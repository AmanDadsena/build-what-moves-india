/* Icons drawn for this product.

   No icon library: the taste guidance rules out the thin-line generic
   sets, and more practically, every one of them would make this look
   like a hundred other dashboards. These are built on one grid —
   24×24, 1.75 stroke, round caps and joins — so they sit together as
   a family, and each takes its shape from the thing it names rather
   than from a stock metaphor. */

type IconProps = {
  size?: number;
  className?: string;
};

function Svg({
  size = 24,
  className = "",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Passbook — a bound book with a rising balance inside. */
export function IconPassbook(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M8 4v16" />
      <path d="M11.5 15v-2.5M14.5 15v-5M17.5 15V8" />
    </Svg>
  );
}

/** Withdraw — money leaving the account. */
export function IconWithdraw(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M12 15V9M12 9l-2.5 2.5M12 9l2.5 2.5" />
    </Svg>
  );
}

/** Rejected — a document with a struck mark. */
export function IconRejected(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 3h7.5L19 8.5V21H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M13.5 3v5.5H19" />
      <path d="M9.5 13.5l5 5M14.5 13.5l-5 5" />
    </Svg>
  );
}

/** Nominee — a person with a mark of designation. */
export function IconNominee(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="10" cy="8.5" r="3.5" />
      <path d="M3.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M17.5 6.5v5M15 9h5" />
    </Svg>
  );
}

/** Transfer — two accounts joining into one. */
export function IconTransfer(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="4" width="7" height="7" rx="1.5" />
      <rect x="3" y="13" width="7" height="7" rx="1.5" />
      <path d="M10 7.5h5a2.5 2.5 0 0 1 2.5 2.5v4" />
      <path d="M10 16.5h4" />
      <path d="M17.5 17l2-2.5-2-2.5" />
    </Svg>
  );
}

/** Pension — a figure with a shelter over it. */
export function IconPension(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.5 10.5 12 4l8.5 6.5" />
      <path d="M6 12v8h12v-8" />
      <circle cx="12" cy="15" r="2" />
    </Svg>
  );
}

/** Records — layered documents being compared. */
export function IconRecords(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="12" height="15" rx="1.5" />
      <path d="M9 21h10.5a1.5 1.5 0 0 0 1.5-1.5V7" />
      <path d="M6.5 7.5h5M6.5 11h5M6.5 14.5h3" />
    </Svg>
  );
}

/** Grievance — a raised voice. */
export function IconGrievance(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 11.5 10 8v9l-6-3.5v-2Z" />
      <path d="M10 9.5h3a4 4 0 0 1 0 8h-3" />
      <path d="M6.5 17.5 8 21" />
    </Svg>
  );
}

/** Ask — a question mark on a record. */
export function IconAsk(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.25-.9.8-.9 1.45v.5" />
      <path d="M12 17h.01" />
    </Svg>
  );
}

/** Exit — leaving an establishment. */
export function IconExit(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h9" />
    </Svg>
  );
}

/** Correction — an amended entry. */
export function IconCorrect(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 6.5l3 3" />
    </Svg>
  );
}

/** Certificate — a sealed proof. */
export function IconCertificate(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 4h14v11H5z" />
      <path d="M8 8h8M8 11h5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M10.5 20.2 10 23l2-1.2 2 1.2-.5-2.8" />
    </Svg>
  );
}

/** File a claim — a form being submitted. */
export function IconFile(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 3h7.5L19 8.5V21H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M13.5 3v5.5H19" />
      <path d="M12 12v6M12 12l-2 2M12 12l2 2" />
    </Svg>
  );
}

/** Overview — the account at a glance. */
export function IconOverview(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </Svg>
  );
}

/** Claims — a stack with a status mark. */
export function IconClaims(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M7 13.5h4M7 16h6" />
      <circle cx="17" cy="14.5" r="2" />
    </Svg>
  );
}

/** Maps a service id to its icon. */
export const SERVICE_ICONS: Record<
  string,
  (p: IconProps) => React.JSX.Element
> = {
  overview: IconOverview,
  passbook: IconPassbook,
  "file-claim": IconFile,
  claims: IconClaims,
  records: IconRecords,
  nomination: IconNominee,
  transfer: IconTransfer,
  leaving: IconExit,
  exit: IconExit,
  correct: IconCorrect,
  grievance: IconGrievance,
  summary: IconRecords,
  growth: IconPassbook,
  paycheck: IconWithdraw,
  ask: IconAsk,
  pension: IconPension,
  "life-certificate": IconCertificate,
};
