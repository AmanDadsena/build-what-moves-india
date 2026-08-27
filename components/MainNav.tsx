"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* The main navigation, with the current section marked.

   A portal that does not tell you where you are makes you re-read the
   page to work it out. The active item gets three signals rather than
   one — colour, weight and an underline that grows into place — so it
   survives colour-blindness and high contrast alike, and aria-current
   carries the same fact to a screen reader. */

const NAV = [
  { href: "/why", label: "Why was it rejected?" },
  { href: "/services", label: "All services A–Z" },
  { href: "/help", label: "Help & contact" },
  { href: "/glossary", label: "Plain language" },
  { href: "/safety", label: "Staying safe" },
  { href: "/downloads", label: "Forms & downloads" },
  { href: "/how-real", label: "About this build" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="border-b border-rule bg-paper sticky top-0 z-40"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
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
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
