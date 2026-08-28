"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavProgress } from "@/components/NavProgress";
import { useLang } from "@/components/Language";

/* The main navigation, with the current section marked.

   A portal that does not tell you where you are makes you re-read the
   page to work it out. The active item gets three signals rather than
   one — colour, weight and an underline that grows into place — so it
   survives colour-blindness and high contrast alike, and aria-current
   carries the same fact to a screen reader. */

/* Labels come from the language table rather than being written here,
   so the nav follows the switch. The keys are stable; only the text
   changes. */
const NAV = [
  { href: "/why", key: "why" },
  { href: "/still-waiting", key: "waiting" },
  { href: "/services", key: "services" },
  { href: "/help", key: "help" },
  { href: "/glossary", key: "plain" },
  { href: "/safety", key: "safety" },
  { href: "/downloads", key: "forms" },
  { href: "/how-real", key: "about" },
];

export function MainNav() {
  const pathname = usePathname();
  const { s } = useLang();

  return (
    <nav
      aria-label="Main"
      className="border-b border-rule bg-paper sticky top-0 z-40"
    >
      <div className="shell">
        <ul className="flex gap-1 overflow-x-auto">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-item press relative block px-4 py-3.5 text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "text-noting font-bold"
                      : "text-ink-soft font-medium hover:text-ink"
                  }`}
                  data-active={active ? "true" : "false"}
                >
                  {s(item.key)}
                  <NavProgress />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
