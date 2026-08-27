/* Qualifying service, drawn as a ring.

   Ten years is the line between a pension for life and a one-time
   withdrawal — the most consequential number in the scheme, and one
   the original portal never states at all. A bar buried in a page of
   text does not carry that weight; a ring with the figure inside it
   is the first thing the eye lands on.

   The gap between the arc and the full circle is the point: what is
   missing is as legible as what has been earned. */

export function ProgressRing({
  months,
  target,
  size = 200,
}: {
  months: number;
  target: number;
  size?: number;
}) {
  const qualified = months >= target;
  const fraction = Math.min(1, months / target);

  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * fraction;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const shortBy = Math.max(0, target - months);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${years} years ${remainder} months of ${
          target / 12
        } years qualifying service`}
        className="shrink-0"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-paper-inset)"
          strokeWidth={stroke}
        />

        {/* Earned. Rotated so it starts at twelve o'clock. */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={qualified ? "var(--color-verify)" : "var(--color-noting)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          fill="var(--color-ink)"
          fontSize={size * 0.19}
          fontWeight="600"
          fontFamily="var(--font-display)"
          letterSpacing="-1"
        >
          {years}y {remainder}m
        </text>
        <text
          x="50%"
          y="61%"
          textAnchor="middle"
          fill="var(--color-ink-faint)"
          fontSize={size * 0.075}
          fontFamily="var(--font-sans)"
        >
          of {target / 12} years
        </text>
      </svg>

      <div className="min-w-0">
        {qualified ? (
          <>
            <p className="display-3 text-verify mb-2">
              You have crossed the line.
            </p>
            <p className="text-ink-soft leading-relaxed measure-tight">
              A monthly pension for life from retirement age. Further service
              increases the amount but no longer changes your entitlement.
            </p>
          </>
        ) : (
          <>
            <p className="display-3 mb-2">
              {shortBy} {shortBy === 1 ? "month" : "months"} short
            </p>
            <p className="text-ink-soft leading-relaxed measure-tight mb-3">
              Service with any EPF-covered employer counts, and it need not be
              continuous — which is why a stray second UAN can quietly cost you
              this.
            </p>
            <p className="text-sm text-ink-faint">
              {months} of {target} months completed
            </p>
          </>
        )}
      </div>
    </div>
  );
}
