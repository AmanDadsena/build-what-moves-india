import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { SearchBox } from "@/components/SearchBox";
import { REJECTIONS } from "@/lib/rejections";

export const metadata = {
  title: "Page not found",
  description:
    "That address does not exist here. The pages people arrive looking for are listed below.",
};

/* The page nobody designs, on a site people arrive at sideways.
 *
 * Until now this route fell through to the framework's own 404: a
 * bare sentence on a white page, with no masthead, no search, no
 * language switcher and no way back. That is a poor ending anywhere
 * and a bad one here, because of how people reach this site. They
 * follow a link a caseworker sent months ago, or a URL read aloud
 * over a phone, or they type what they half-remember. A member who
 * has already been told nothing useful by one portal should not be
 * told nothing useful by this one.
 *
 * So this offers the three things a lost arrival can actually use:
 * the search box, the handful of destinations that account for most
 * traffic, and the rejection remarks themselves — because somebody
 * who mistyped an address is quite likely to recognise the sentence
 * that brought them here.
 */

const DESTINATIONS = [
  {
    href: "/why/",
    label: "Why was my claim rejected?",
    note: "Fifteen remarks, decoded. No sign-in.",
  },
  {
    href: "/still-waiting/",
    label: "My claim is still pending",
    note: "What is open to you, and from which day.",
  },
  {
    href: "/find-your-uan/",
    label: "I do not know my UAN",
    note: "Seven routes, and which of them can work for you.",
  },
  {
    href: "/check-your-payslip/",
    label: "Check my payslip",
    note: "Two numbers, and the arithmetic behind them.",
  },
  {
    href: "/services/",
    label: "All services A–Z",
    note: "Everything on this site, in one list.",
  },
  {
    href: "/help/",
    label: "Help & contact",
    note: "Questions people actually ask, answered.",
  },
];

/* The most-searched remarks, not all fifteen: a 404 that lists
   everything is a second thing to read rather than a way out. */
const COMMON = REJECTIONS.filter(
  (r) => r.prevalence === "very-common" || r.prevalence === "common",
).slice(0, 6);

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <div className="shell-reading py-14 sm:py-20">
          <h2 className="eyebrow section-mark mb-4">Page not found</h2>
          <h1 className="display-1 measure mb-4">
            That address does not exist here.
          </h1>
          <p className="lede measure mb-8">
            Nothing has gone wrong with your case. A link was mistyped, or it
            pointed somewhere this site no longer keeps. Everything below still
            works.
          </p>

          <div className="border border-rule-heavy bg-paper-raised rounded-xl p-6 mb-8">
            <h2 className="eyebrow mb-3">Search the whole site</h2>
            <SearchBox />
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              The index is built into the page and works without a connection.
              You can search in any of the eight languages the site speaks.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="eyebrow section-mark mb-4">
              Where people are usually going
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {DESTINATIONS.map((d) => (
                <li key={d.href}>
                  <Link
                    href={d.href}
                    className="press block h-full border border-rule rounded-lg px-4 py-3.5 hover:border-noting hover:bg-noting-wash/40 transition-colors"
                  >
                    <span className="block text-sm font-semibold tracking-[-0.01em] mb-1">
                      {d.label}
                    </span>
                    <span className="block text-xs text-ink-soft leading-relaxed">
                      {d.note}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="eyebrow section-mark mb-3">
              Or the sentence you were shown
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed measure mb-4">
              If you arrived here after a claim failed, the remark you were
              given is more likely to find the right page than an address is.
            </p>
            <ul className="border border-rule rounded-lg divide-y divide-rule overflow-hidden">
              {COMMON.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/why/${r.id}/`}
                    className="block px-4 py-3 bg-paper-raised hover:bg-noting-wash/40 transition-colors"
                  >
                    <span className="machine text-sm">{r.verbatim[0]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
