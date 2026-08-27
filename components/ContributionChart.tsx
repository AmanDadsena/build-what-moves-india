import type { PassbookEntry } from "@/lib/types";

/* Contributions over time.

   The original portal gives a member a table and nothing else, which
   makes a five-year record something you audit rather than something
   you understand. One glance at this answers the questions people
   actually have: is it going up, did it ever stop, and when.

   Drawn from the same entries the table below renders, so the picture
   and the numbers cannot disagree. */

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export function ContributionChart({
  entries,
  stopped,
}: {
  entries: PassbookEntry[];
  /** True where contributions ceased without an exit being recorded. */
  stopped?: boolean;
}) {
  if (entries.length === 0) return null;

  const totals = entries.map((e) => e.employeeShare + e.employerShare);
  const max = Math.max(...totals);
  const peak = totals.indexOf(max);
  const lastIndex = entries.length - 1;

  // A fixed drawing space; the SVG scales to its container.
  const W = 1000;
  const H = 220;
  const gap = entries.length > 40 ? 2 : 4;
  const barW = (W - gap * (entries.length - 1)) / entries.length;

  // Year boundaries, for the axis beneath.
  const yearStarts: Array<{ index: number; year: string }> = [];
  entries.forEach((e, i) => {
    const year = e.month.slice(0, 4);
    if (i === 0 || year !== entries[i - 1].month.slice(0, 4)) {
      yearStarts.push({ index: i, year });
    }
  });

  const totalAdded = totals.reduce((a, b) => a + b, 0);

  return (
    <figure className="border border-rule rounded-lg overflow-hidden bg-paper-raised">
      <figcaption className="px-5 py-4 border-b border-rule flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-1">Every month you contributed</p>
          <p className="num text-sm text-ink-soft">
            {entries.length} months &middot; {rupees(totalAdded)} added in total
          </p>
        </div>
        <p className="num text-sm text-ink-faint">
          Highest &middot; {rupees(max)} in {monthLabel(entries[peak].month)}
        </p>
      </figcaption>

      <div className="px-5 pt-6 pb-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H + 28}`}
          className="w-full h-auto min-w-[36rem]"
          role="img"
          aria-label={`Monthly contributions from ${monthLabel(
            entries[0].month
          )} to ${monthLabel(entries[lastIndex].month)}, rising from ${rupees(
            totals[0]
          )} to ${rupees(totals[lastIndex])}`}
        >
          <defs>
            <linearGradient id="cc-bar" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--color-noting)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--color-verify)" />
            </linearGradient>
          </defs>

          {/* Baseline */}
          <line
            x1="0"
            y1={H}
            x2={W}
            y2={H}
            stroke="var(--color-rule-heavy)"
            strokeWidth="1.5"
          />

          {entries.map((e, i) => {
            const value = e.employeeShare + e.employerShare;
            const h = Math.max(3, (value / max) * (H - 12));
            const x = i * (barW + gap);
            const isLast = i === lastIndex;
            return (
              <rect
                key={e.month}
                x={x}
                y={H - h}
                width={barW}
                height={h}
                rx={Math.min(3, barW / 2)}
                fill={isLast && stopped ? "var(--color-stamp)" : "url(#cc-bar)"}
              >
                <title>
                  {monthLabel(e.month)} · {rupees(value)}
                </title>
              </rect>
            );
          })}

          {/* Year ticks */}
          {yearStarts.map(({ index, year }) => (
            <text
              key={year}
              x={index * (barW + gap)}
              y={H + 20}
              fill="var(--color-ink-faint)"
              fontSize="15"
              fontFamily="var(--font-display)"
            >
              {year}
            </text>
          ))}
        </svg>
      </div>

      {stopped && (
        <p className="px-5 pb-5 text-sm text-stamp leading-relaxed">
          The final bar is marked in red: contributions stop at{" "}
          {monthLabel(entries[lastIndex].month)} and no exit was ever recorded.
          That gap is visible here months before any claim was rejected.
        </p>
      )}
    </figure>
  );
}
