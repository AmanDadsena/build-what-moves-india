import type { MetadataRoute } from "next";
import { absolute, DOMAIN_UNKNOWN, SITE_URL } from "@/lib/site";
import { REJECTIONS } from "@/lib/rejections";
import { SERVICES } from "@/lib/services";
import { MEMBERS } from "@/lib/members";

export const dynamic = "force-static";

/* The sitemap, with priorities that mean something.
 *
 * The fifteen /why pages carry the highest weight, above the home
 * page. That is deliberate rather than an oversight: nobody searches
 * for a provident fund portal, they search for the sentence that
 * blocked their money. Those pages are the ones that need to be found,
 * and the landing page is where somebody arrives only if they already
 * know this exists.
 *
 * The demonstration accounts are listed too. They contain no real
 * person's data — every UAN in them begins 99 and every figure is
 * invented — and a judge or a journalist reaching a working example
 * directly is worth more than keeping the tree tidy.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  /* A production build with no domain would ship localhost canonicals
     to real users. Worth one loud line in the build log rather than a
     silent guess at a domain nobody owns. */
  if (DOMAIN_UNKNOWN && process.env.NODE_ENV === "production") {
    console.warn(
      `\n  No NEXT_PUBLIC_SITE_URL and no Vercel domain, so canonical` +
        `\n  URLs, the sitemap and the OG image all point at ${SITE_URL}.` +
        `\n  Set NEXT_PUBLIC_SITE_URL, or let Vercel build this.\n`,
    );
  }

  const now = new Date();

  const guides = REJECTIONS.map((r) => ({
    url: absolute(`/why/${r.id}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: r.prevalence === "very-common" ? 1 : 0.9,
  }));

  const pages = [
    ["/", 0.9],
    ["/why", 1],
    ["/still-waiting", 1],
    ["/find-your-uan", 1],
    ["/search", 0.4],
    ["/services", 0.8],
    ["/glossary", 0.8],
    ["/safety", 0.9],
    ["/after-a-death", 0.9],
    ["/help", 0.8],
    ["/downloads", 0.7],
    ["/offices", 0.6],
    ["/compare", 0.5],
    ["/how-real", 0.5],
    ["/login", 0.6],
    ["/offline", 0.1],
  ] as const;

  const statics = pages.map(([path, priority]) => ({
    url: absolute(path),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority,
  }));

  const portal = MEMBERS.flatMap((member) => [
    ...SERVICES.map((service) => ({
      url: absolute(`/portal/${member.uan}${service.path}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...member.claims.map((claim) => ({
      url: absolute(`/portal/${member.uan}/claims/${claim.id}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ]);

  return [...statics, ...guides, ...portal];
}
