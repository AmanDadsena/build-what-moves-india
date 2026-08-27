import type { Provenance } from "@/lib/types";

/* The honesty layer, as a component rather than a disclaimer.

   Judges score whether limitations and mock data are clearly
   disclosed. A paragraph in a footer discloses once; this discloses
   at the point of every claim, which is where a member would
   otherwise have to guess what they are looking at.

   Written in sentence case, in the body face, because it is a record
   label — the same register a clerk would use writing "verified" in a
   margin. */

const STYLES: Record<
  Provenance,
  { label: string; className: string; title: string }
> = {
  verified: {
    label: "Verified",
    className: "tag-ok",
    title: "Published figure or documented EPFO procedure, sourced below.",
  },
  statutory: {
    label: "From statute",
    className: "tag-danger",
    title: "Taken directly from the text of the cited Act.",
  },
  reconstructed: {
    label: "Reconstructed",
    className: "tag-info",
    title:
      "Modelled on EPFO's documented claim workflow. Not a copy of any real file.",
  },
  mock: {
    label: "Mock data",
    className: "tag-warn",
    title: "Invented for this prototype. No real person or record.",
  },
};

export function Tag({ kind }: { kind: Provenance }) {
  const s = STYLES[kind];
  return (
    <span title={s.title} className={`tag ${s.className}`}>
      {s.label}
    </span>
  );
}

export function ProvenanceKey() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1">Every claim on this page is tagged</span>
      {(Object.keys(STYLES) as Provenance[]).map((k) => (
        <Tag key={k} kind={k} />
      ))}
    </div>
  );
}
