import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Chrome";

export const metadata = {
  title: "Offline",
  description:
    "You are offline. Pages you have already opened are still readable.",
};

/* Shown only when a page is asked for that has never been loaded and
   the network is gone.

   Almost every offline page apologises and offers a reload button,
   which is the one thing that cannot help. This one does the useful
   thing instead: says plainly what is still available, and tells the
   member the two facts about their case that do not need a
   connection — the RTI deadline, and that a reference number is the
   only thing worth getting out of a phone call. */

const AVAILABLE = [
  { href: "/", label: "Home" },
  { href: "/services/", label: "All services A–Z" },
  { href: "/glossary/", label: "Plain language" },
  { href: "/help/", label: "Help & contact" },
];

export default function Offline() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <div className="shell-reading py-14 sm:py-20">
          <h2 className="eyebrow section-mark mb-4">No connection</h2>
          <h1 className="display-1 measure mb-4">
            You are offline, and this page was never loaded.
          </h1>
          <p className="lede measure mb-8">
            Anything you opened before the signal went is still readable.
            Everything else waits.
          </p>

          <div className="border border-rule bg-paper-raised rounded-lg p-6 mb-8">
            <p className="eyebrow mb-3">Try one of these</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {AVAILABLE.map((a) => (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="press block border border-rule rounded-md px-4 py-3 text-sm font-semibold hover:border-noting hover:bg-noting-wash/50"
                  >
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l-4 border-pending bg-pending-wash/50 rounded-lg px-5 py-4">
            <p className="eyebrow mb-2">Two things that do not need a signal</p>
            <p className="text-sm leading-relaxed mb-2">
              An RTI application about your own file must be answered within
              thirty days. Nothing else you are told carries a deadline anybody
              can enforce.
            </p>
            <p className="text-sm leading-relaxed">
              On any call, the only thing worth getting is a dated reference
              number. An assurance without one leaves no record that the call
              happened.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
