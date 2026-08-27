"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Member } from "@/lib/types";
import { corpus } from "@/lib/members";
import { SERVICES, servicesByCategory } from "@/lib/services";
import { UtilityBar, Wordmark } from "@/components/Chrome";
import { SERVICE_ICONS } from "@/components/Icons";

/* The portal chrome.

   Deliberately not dressed as EPFO: no government logo, no official
   styling, and the prototype badge stays visible. The brief forbids
   presenting a build as an official product, and a faithful redesign
   makes that easy to do by accident.

   Twelve services is too many for a tab strip, so navigation is a
   grouped rail on desktop and a single scrollable row on mobile —
   the grouping carries information about what each service is for. */

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

export function PortalShell({
  member,
  children,
}: {
  member: Member;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/portal/${member.uan}`;
  const groups = servicesByCategory();

  const isActive = (path: string) => {
    const href = `${base}${path}`;
    if (path === "") return pathname === base || pathname === `${base}/`;
    return pathname.startsWith(href);
  };

  const blocked = member.claims.filter((c) => c.status === "rejected").length;

  return (
    <>
      <UtilityBar />

      {/* Identity bar */}
      <header className="border-b border-rule bg-paper sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <Wordmark small />
          <Link
            href="/login"
            className="press text-sm text-ink-soft hover:text-ink underline decoration-rule-heavy underline-offset-4 shrink-0"
          >
            Sign out
          </Link>
        </div>
      </header>

      {/* Member summary */}
      <div className="border-b border-rule bg-paper-raised">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="eyebrow mb-1.5">
                {member.employer} &middot; {member.establishmentCode}
              </p>
              <h1 className="display-sm text-lg sm:text-2xl">{member.name}</h1>
              <p className="num text-sm text-ink-soft mt-1">
                UAN {member.uan}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="eyebrow mb-1">Provident fund balance</p>
              <p className="figure text-xl sm:text-2xl" data-numeric>
                {rupees(corpus(member))}
              </p>
              {blocked > 0 && (
                <p className="text-xs font-bold text-stamp mt-1">
                  {blocked} claim{blocked > 1 ? "s" : ""} blocked
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile service strip */}
      <nav
        aria-label="Services"
        className="lg:hidden border-b border-rule-heavy bg-paper sticky top-14 z-30"
      >
        <ul className="flex gap-1 overflow-x-auto px-5 sm:px-8 -mb-px">
          {SERVICES.filter((s) => s.inNav).map((s) => {
            const active = isActive(s.path);
            const Icon = SERVICE_ICONS[s.id];
            return (
              <li key={s.id} className="shrink-0">
                <Link
                  href={`${base}${s.path}`}
                  aria-current={active ? "page" : undefined}
                  className={`press flex items-center gap-2 px-3.5 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "border-noting text-noting font-semibold"
                      : "border-transparent text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {s.nav}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8 w-full flex-1">
        <div className="lg:grid lg:grid-cols-[13.5rem_1fr] lg:gap-10">
          {/* Desktop rail */}
          <nav
            aria-label="Services"
            className="hidden lg:block py-8 sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto"
          >
            {groups.map(([category, services]) => (
              <div key={category} className="mb-7 last:mb-0">
                <p className="eyebrow mb-2.5">{category}</p>
                <ul className="space-y-0.5">
                  {services.map((s) => {
                    const active = isActive(s.path);
                    const Icon = SERVICE_ICONS[s.id];
                    return (
                      <li key={s.id}>
                        <Link
                          href={`${base}${s.path}`}
                          aria-current={active ? "page" : undefined}
                          className={`press flex items-center gap-2.5 text-sm px-3 py-2 rounded-md transition-colors ${
                            active
                              ? "bg-noting-wash text-noting font-semibold"
                              : "text-ink-soft hover:text-ink hover:bg-paper-raised"
                          }`}
                        >
                          {Icon && (
                            <span
                              className={
                                active ? "text-noting" : "text-ink-faint"
                              }
                            >
                              <Icon size={18} />
                            </span>
                          )}
                          {s.nav}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <main className="py-8 sm:py-10 min-w-0">{children}</main>
        </div>
      </div>

      <footer className="border-t border-rule bg-paper-inset/40">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-6 text-sm text-ink-faint leading-relaxed">
          <p className="max-w-3xl">
            An independent hackathon prototype, not affiliated with or endorsed
            by the Employees&rsquo; Provident Fund Organisation. No live
            government system is contacted and every record shown is invented.{" "}
            <Link href="/how-real" className="underline hover:text-ink">
              What is real and what is mocked
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
