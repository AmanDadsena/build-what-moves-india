import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { SearchPage } from "@/components/SearchPage";

export const metadata = {
  title: "Search",
  description:
    "Search every rejection reason, plain-language term, service, letter and office in one place. Nothing you type leaves your device.",
  alternates: { canonical: "/search/" },
};

/* No Suspense boundary here, deliberately.
 *
 * The obvious way to write this page is useSearchParams inside a
 * Suspense boundary, and it is wrong for a statically exported one.
 * The query string is a client-side fact either way, so the hook buys
 * nothing — but it does put the page behind a boundary, and React then
 * renders the real content into a hidden container at the end of the
 * document for an inline script to move into place. If that never
 * completes the visitor is left looking at the fallback, with a
 * working search box sitting invisibly at the bottom of the page.
 *
 * The component reads location itself instead. */

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <SearchPage />
      </main>
      <SiteFooter />
    </>
  );
}
