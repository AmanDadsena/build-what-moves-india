import Link from "next/link";
import { REJECTIONS } from "@/lib/rejections";

/* The scrolling strip, carrying something true.
 *
 * Every government portal has one of these and almost all of them run
 * announcements — a circular nobody asked about, a deadline extension
 * for a scheme most readers are not in. This one runs the actual
 * sentences members are shown when a claim fails, each linking to what
 * it means. Somebody who recognises their own sentence going past has
 * found the page they came for without reading anything else.
 *
 * The duplicate copy is what makes the loop seamless: the track
 * travels exactly half its own width, so the second copy is arriving
 * as the first leaves and there is never a dead gap. It is marked
 * aria-hidden so a screen reader reads the list once, and the
 * animation stops on hover or focus so an item can actually be read.
 */

const SHOWN = REJECTIONS.filter((r) => r.prevalence !== "occasional");

export function Ticker() {
  const items = SHOWN.map((r) => ({ id: r.id, text: r.verbatim[0] }));

  return (
    <section
      aria-label="Rejection remarks members are shown"
      className="band-gradient border-b border-rule bg-night text-paper overflow-hidden"
    >
      <div className="flex items-stretch">
        <p className="shrink-0 self-center pl-5 sm:pl-8 pr-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ochre whitespace-nowrap">
          Seen on screen
        </p>

        <div className="ticker flex-1 py-3">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <span
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
                className="inline-flex items-center gap-12"
              >
                {items.map((item) => (
                  <Link
                    key={`${copy}-${item.id}`}
                    href={`/why/${item.id}/`}
                    tabIndex={copy === 1 ? -1 : undefined}
                    className="machine text-sm text-paper/80 hover:text-ochre focus-visible:text-ochre transition-colors underline decoration-transparent hover:decoration-ochre underline-offset-4"
                  >
                    {item.text}
                  </Link>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
