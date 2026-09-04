import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { WhatItCosts } from "@/components/WhatItCosts";

export const metadata = {
  title: "What chasing a PF claim actually costs you",
  description:
    "Every route out of a stuck provident fund claim, priced in the only currency that matters to the member: a day's wages. The advice given most freely turns out to be the most expensive thing on the list.",
  alternates: { canonical: "/what-it-costs/" },
  openGraph: {
    title: "Nobody prices these in the only currency that matters to you.",
    description:
      "A day off work costs more than every fee in this process put together. Once you count that, an office visit is the dearest option and the one instrument with a deadline behind it costs ten rupees.",
  },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <WhatItCosts />
      </main>
      <SiteFooter />
    </>
  );
}
