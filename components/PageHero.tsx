import { Tag } from "@/components/Provenance";
import type { Provenance } from "@/lib/types";

/* The opening of every top-level page.
 *
 * Before this each page invented its own arrangement — some opened on
 * a raised band, some on plain paper, the eyebrow and the provenance
 * tag in a different order each time. None of it was wrong and all of
 * it was slightly different, which is the specific way a site stops
 * feeling like one thing.
 *
 * One component, two tones. The gradient card is for pages a member
 * arrives at cold and needs orienting on; the plain one is for pages
 * they have navigated into, where a second navy block in a row would
 * be noise. Both put the provenance tag in the same place, because
 * knowing how far to trust a page is not decoration.
 */

export function PageHero({
  eyebrow,
  title,
  titleHi,
  lede,
  provenance,
  actions,
  aside,
  tone = "gradient",
}: {
  eyebrow: string;
  title: string;
  titleHi?: string;
  lede?: string;
  provenance?: Provenance;
  /** Buttons. Rendered under the lede. */
  actions?: React.ReactNode;
  /** Optional panel to the right, on wide screens only. */
  aside?: React.ReactNode;
  tone?: "gradient" | "plain";
}) {
  if (tone === "plain") {
    return (
      <section className="border-b border-rule bg-paper-raised">
        <div className="shell py-10 sm:py-14">
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <p className="eyebrow section-mark mb-0">{eyebrow}</p>
            {provenance && <Tag kind={provenance} />}
          </div>
          <h1 className="display-1 measure mb-4">{title}</h1>
          {titleHi && (
            <p className="font-deva text-base sm:text-lg text-ink-faint mb-4">
              {titleHi}
            </p>
          )}
          {lede && <p className="lede measure">{lede}</p>}
          {actions && <div className="flex gap-2 flex-wrap mt-7">{actions}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-rule bg-paper">
      <div className="shell py-8 sm:py-10">
        <div className="band-night band-gradient rounded-xl overflow-hidden card-lift">
          <div
            className={`p-7 sm:p-10 ${aside ? "grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-12 lg:items-center" : ""}`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-5 flex-wrap">
                <p className="inline-block rounded-full bg-paper/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-night-faint">
                  {eyebrow}
                </p>
                {provenance && <Tag kind={provenance} />}
              </div>

              <h1 className="display-1 measure text-paper">{title}</h1>

              {titleHi && (
                <p className="font-deva text-base sm:text-lg text-night-faint mt-3">
                  {titleHi}
                </p>
              )}

              {lede && (
                <p className="lede measure text-night-faint mt-4">{lede}</p>
              )}

              {actions && (
                <div className="flex gap-2.5 flex-wrap mt-7">{actions}</div>
              )}
            </div>

            {aside && <div className="hidden lg:block">{aside}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
