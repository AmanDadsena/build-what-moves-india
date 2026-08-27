import type { MetadataRoute } from "next";
import { absolute, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/* Crawling is allowed, deliberately.
 *
 * A prototype's instinct is to hide from search engines. This one has
 * the opposite problem to solve: the reason a rejected member cannot
 * find a straight answer is that nobody has published one, and the
 * pages under /why exist precisely to be found by somebody typing the
 * sentence that blocked their money.
 *
 * The disclosure that this is not an official EPFO service is in the
 * masthead, the footer and the page titles, so a search result cannot
 * present it as one.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: absolute("/"),
  };
}
