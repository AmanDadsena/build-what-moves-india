import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { EmployerGone } from "@/components/EmployerGone";

export const metadata = {
  title: "My employer has closed — how do I claim my PF?",
  description:
    "Nine of the fifteen documented rejection reasons need the employer to act. When the establishment has closed, refuses, or cannot be found, these are the routes that remain — including the ones that need nobody's agreement at all.",
  alternates: { canonical: "/employer-gone/" },
  openGraph: {
    title: "Everything your employer would sign, they already filed.",
    description:
      "An attestation confirms a record EPFO is already holding. Which changes the question from how to find a company that no longer exists, to how to get the office to read its own file.",
  },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <EmployerGone />
      </main>
      <SiteFooter />
    </>
  );
}
