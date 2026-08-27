import Link from "next/link";
import { servicesByCategory } from "@/lib/services";
import { ReaderControls } from "@/components/ReaderControls";
import { Emblem } from "@/components/Emblem";
import { MainNav } from "@/components/MainNav";
import { SearchBox } from "@/components/SearchBox";

const DEMO_UAN = "990012345678";
const HELPLINE = "1800 000 000";

/* The masthead.

   Public-service portals share a structure — a skip link, a thin
   utility strip, an emblem and name, then a service nav — and it is
   worth following, because it is what makes a site read as an
   institution rather than a product. What we do not borrow is
   anybody's emblem or any claim of authority: the mark is our own and
   the disclosure sits in the utility strip, stated plainly rather
   than shouted. */

export function UtilityBar() {
  return (
    <div className="band-night">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-1.5 flex items-center justify-between gap-4">
        <p className="text-[11px] sm:text-xs text-paper/65 leading-snug">
          An independent prototype. Not an official EPFO service.
        </p>
        <ReaderControls onDark />
      </div>
    </div>
  );
}

export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 min-w-0 shrink-0 group"
      aria-label="EPF Member Portal, home"
    >
      <Emblem
        size={small ? 34 : 42}
        className="text-noting shrink-0 transition-colors group-hover:text-ink"
      />
      <span className="min-w-0">
        <span
          className={`block font-semibold tracking-[-0.02em] leading-tight ${
            small ? "text-[15px]" : "text-[17px]"
          }`}
        >
          EPF Member Portal
        </span>
        <span className="block font-deva text-[11px] sm:text-xs text-ink-faint leading-tight mt-0.5">
          कर्मचारी भविष्य निधि — सदस्य पोर्टल
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      {/* Real portals lead with this; it is the cheapest accessibility
          win there is and almost nobody ships it. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to main content
      </a>

      <UtilityBar />

      <header className="border-b border-rule bg-paper-raised">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-3.5 flex items-center justify-between gap-6">
          <Wordmark />

          <div className="flex items-center gap-4 sm:gap-5 shrink-0">
            <SearchBox className="hidden md:block w-52 lg:w-64" />
            <div className="hidden xl:block text-right">
              <p className="eyebrow mb-0.5">Helpline</p>
              <p className="num text-sm">{HELPLINE}</p>
            </div>
            <Link href="/login" className="btn btn-primary btn-sm">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Below the fold of the masthead on small screens, because a
          52px input cannot share a row with a wordmark and a button
          without one of the three becoming unusable. */}
      <div className="md:hidden border-b border-rule bg-paper-raised px-5 pb-3.5">
        <SearchBox />
      </div>

      <MainNav />
    </>
  );
}

export function SiteFooter() {
  const groups = servicesByCategory();

  return (
    <footer className="band-night band-gradient mt-auto">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Emblem size={38} className="text-paper/80" />
              <div>
                <p className="font-semibold tracking-[-0.02em]">
                  EPF Member Portal
                </p>
                <p className="font-deva text-xs text-paper/65 mt-0.5">
                  सदस्य पोर्टल
                </p>
              </div>
            </div>
            <p className="text-sm text-paper/60 leading-relaxed max-w-sm mb-5">
              A redesign concept for the provident fund member portal, built
              around the question people actually arrive with: why has my money
              not come, and what do I do about it.
            </p>
            <dl className="text-sm space-y-1.5">
              <div className="flex gap-2">
                <dt className="text-paper/65">Helpline</dt>
                <dd className="num text-paper/80">{HELPLINE}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-paper/65">Hours</dt>
                <dd className="text-paper/80">Mon–Fri, 9:30–18:00 IST</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map(([category, services]) => (
              <div key={category}>
                <p className="eyebrow mb-3">{category}</p>
                <ul className="space-y-2">
                  {services.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/portal/${DEMO_UAN}${s.path}`}
                        className="text-sm text-paper/65 hover:text-paper transition-colors"
                      >
                        {s.nav}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-night-rule mt-12 pt-8 grid gap-6 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <p className="eyebrow mb-3">Where the facts come from</p>
            <ul className="text-sm text-paper/65 space-y-1.5 leading-relaxed">
              <li>EPFO annual report 2024&ndash;25, via Business Today</li>
              <li>Right to Information Act 2005, sections 6, 7, 19 and 20</li>
              <li>EPFO documented claim and correction procedure</li>
            </ul>
          </div>

          <p className="text-sm text-paper/65 leading-relaxed max-w-3xl">
            This is an independent hackathon prototype and a redesign concept.
            It is not an EPFO product, is not affiliated with or endorsed by the
            Employees&rsquo; Provident Fund Organisation or any government body,
            uses no government logo or emblem, and connects to no live
            government system. Every member, record, balance and file noting
            shown is invented, and the helpline number above is not a working
            line. Never enter a real UAN, password or Aadhaar number here.{" "}
            <Link
              href="/how-real"
              className="text-paper/80 underline underline-offset-4 hover:text-ochre"
            >
              What is real and what is mocked
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
