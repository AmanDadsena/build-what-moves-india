import Link from "next/link";

/* The two card shapes the rest of the site composes from.
 *
 * A tile you tap, and a figure you read. They exist as components
 * rather than as repeated class strings because the hover behaviour —
 * the chip lifting, the arrow leaning out, the card rising — has to
 * be identical everywhere or it stops reading as one system and
 * starts reading as several people's work.
 *
 * Both take their colour from a tone rather than a hex, so a tile can
 * belong to money or to claims or to what-went-wrong and inherit the
 * right accent without any caller knowing which token that is.
 */

export type Tone = "noting" | "verify" | "pending" | "stamp";

/* Every class here is written out in full. Tailwind scans source for
   literal strings, so a class assembled at runtime — `group-hover:${t.text}`
   — is never generated and silently does nothing. */
const TONE: Record<
  Tone,
  { chip: string; hover: string; text: string; ring: string; arrow: string }
> = {
  noting: {
    chip: "bg-noting-wash text-noting",
    hover: "hover:border-noting",
    text: "text-noting",
    ring: "group-hover:bg-noting group-hover:text-paper",
    arrow: "group-hover:text-noting",
  },
  verify: {
    chip: "bg-verify-wash text-verify",
    hover: "hover:border-verify",
    text: "text-verify",
    ring: "group-hover:bg-verify group-hover:text-paper",
    arrow: "group-hover:text-verify",
  },
  pending: {
    chip: "bg-pending-wash text-pending",
    hover: "hover:border-pending",
    text: "text-pending",
    ring: "group-hover:bg-pending group-hover:text-paper",
    arrow: "group-hover:text-pending",
  },
  stamp: {
    chip: "bg-stamp-wash text-stamp",
    hover: "hover:border-stamp",
    text: "text-stamp",
    ring: "group-hover:bg-stamp group-hover:text-paper",
    arrow: "group-hover:text-stamp",
  },
};

export function BentoTile({
  href,
  title,
  titleHi,
  blurb,
  Icon,
  tone = "noting",
  className = "",
}: {
  href: string;
  title: string;
  titleHi?: string;
  blurb?: string;
  Icon: (p: { size?: number; className?: string }) => React.JSX.Element;
  tone?: Tone;
  className?: string;
}) {
  const t = TONE[tone];

  return (
    <Link
      href={href}
      className={`bento lift-hover group flex flex-col justify-between min-h-44 border border-rule bg-paper-raised rounded-xl p-5 sm:p-6 card-lift ${t.hover} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden className={`icon-chip ${t.chip} ${t.ring}`}>
          <Icon size={24} />
        </span>
        <span aria-hidden className={`bento-arrow text-ink-faint ${t.arrow}`}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>

      <div className="mt-6">
        <p className="title leading-snug">{title}</p>
        {titleHi && (
          <p className="font-deva text-sm text-ink-faint mt-0.5">{titleHi}</p>
        )}
        {blurb && (
          <p className="text-sm text-ink-soft leading-relaxed mt-2">{blurb}</p>
        )}
      </div>
    </Link>
  );
}

/* A figure that has to land before the sentence under it does, so the
   number is the largest thing in the card and the label is small and
   quiet beneath. The corner field gives it somewhere to sit without a
   second border. */
export function StatCard({
  value,
  label,
  note,
  tone = "noting",
  glow = true,
}: {
  value: string;
  label: string;
  note?: string;
  tone?: Tone;
  glow?: boolean;
}) {
  const t = TONE[tone];

  return (
    <div
      className={`gold-top ${glow ? "corner-glow" : ""} border border-rule bg-paper-raised rounded-xl p-6 card-lift`}
    >
      <p className="eyebrow mb-3">{label}</p>
      <p className={`figure text-3xl sm:text-4xl mb-1 ${t.text}`}>{value}</p>
      {note && (
        <p className="text-sm text-ink-soft leading-relaxed mt-2">{note}</p>
      )}
    </div>
  );
}
