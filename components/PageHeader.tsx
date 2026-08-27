import { Tag } from "@/components/Provenance";
import type { Provenance } from "@/lib/types";

/* The masthead every portal screen opens with.

   Before this, each page invented its own heading arrangement and
   they drifted — different sizes, different order, Hindi sometimes
   present and sometimes not. One component means a member learns the
   shape once: what this screen is, what it is called in Hindi, what
   it does, and how far to trust what is on it. */

export function PageHeader({
  eyebrow,
  title,
  titleHi,
  lede,
  provenance,
  actions,
}: {
  eyebrow: string;
  title: string;
  titleHi?: string;
  lede?: string;
  provenance?: Provenance;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-9 sm:mb-11">
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <p className="eyebrow">{eyebrow}</p>
        {provenance && <Tag kind={provenance} />}
      </div>

      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <h2 className="display-2 measure">{title}</h2>
          {titleHi && (
            <p className="font-deva text-base sm:text-lg text-ink-faint mt-2">
              {titleHi}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0 pt-1">{actions}</div>}
      </div>

      {lede && <p className="lede measure mt-5">{lede}</p>}

      {/* A hairline that closes the masthead, rather than whitespace
          left to do a job it does poorly on small screens. */}
      <div className="mt-7 border-b border-rule" />
    </header>
  );
}
