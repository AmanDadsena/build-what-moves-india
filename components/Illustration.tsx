import Image from "next/image";

/* One frame for every illustration on the site.

   Three decisions are baked in here rather than left to each page.

   The first is alt text. Every one of these pictures restates
   something the paragraph beside it already says, which makes them
   decorative in the technical sense — so the default is alt="" and
   they are skipped by a screen reader rather than described twice.
   A caller can pass alt when a picture genuinely carries information
   the text does not, and then it is announced.

   The second is width and height, always given. Without them the
   layout reflows the instant each file lands, and a member reading on
   a slow connection has the sentence they were on jump out from under
   them. This is the single most common cause of that, and the fix
   costs two attributes.

   The third is that these disappear in high-contrast and plain modes.
   A raster image cannot recolour itself the way the rest of this
   interface does, so in the modes a member turns on because they are
   struggling to read, a picture that cannot meet the contrast they
   asked for is worse than no picture. They also drop out of print, to
   keep documents to a page. */

type Ratio = "wide" | "square";

const SIZES: Record<Ratio, { w: number; h: number }> = {
  wide: { w: 1240, h: 870 },
  square: { w: 900, h: 900 },
};

export function Illustration({
  src,
  alt = "",
  ratio = "wide",
  priority = false,
  tone = "none",
  className = "",
}: {
  /** Path under /img. */
  src: string;
  /** Leave empty when the picture repeats adjacent text. */
  alt?: string;
  ratio?: Ratio;
  /** Set only for an illustration above the fold. */
  priority?: boolean;
  /** A wash behind the frame, tying the picture to its section. */
  tone?: "none" | "noting" | "verify" | "pending" | "stamp";
  className?: string;
}) {
  const { w, h } = SIZES[ratio];
  const decorative = alt === "";

  const wash =
    tone === "none"
      ? "bg-paper"
      : tone === "noting"
        ? "bg-noting-wash"
        : tone === "verify"
          ? "bg-verify-wash"
          : tone === "pending"
            ? "bg-pending-wash"
            : "bg-stamp-wash";

  return (
    <figure
      className={`illus overflow-hidden rounded-lg border border-rule ${wash} ${className}`}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? "presentation" : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="block w-full h-auto mix-blend-multiply"
      />
    </figure>
  );
}
