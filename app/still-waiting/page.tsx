import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { StillWaiting } from "@/components/StillWaiting";

export const metadata = {
  title: "Claim pending — how long is normal, and what to do",
  description:
    "Enter the date you filed. See how far past the twenty-day settlement commitment you are, how many times the count could have restarted without you being told, and which routes are open today.",
  alternates: { canonical: "/still-waiting/" },
  openGraph: {
    title: "Your claim has not been rejected. It has just not moved.",
    description:
      "The twenty-day commitment restarts every time a desk returns the file. Only one route carries a deadline anybody has to keep — and it is available on day one.",
  },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <StillWaiting />
      </main>
      <SiteFooter />
    </>
  );
}
