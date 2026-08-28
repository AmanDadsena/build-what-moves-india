import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { CheckPayslip } from "@/components/CheckPayslip";

export const metadata = {
  title: "Check your payslip — is your PF deduction right?",
  description:
    "Enter your monthly wages and the PF deducted. It tells you whether the contribution is computed on your full wages, restricted to the ₹15,000 ceiling, or matches neither — and what the ceiling costs you each month.",
  alternates: { canonical: "/check-your-payslip/" },
  openGraph: {
    title: "Two numbers off your payslip, and you can check the arithmetic yourself.",
    description:
      "Your employer may lawfully restrict contributions to the ceiling, capping your deduction at ₹1,800 however much you earn. Almost nobody knows that is a thing.",
  },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <CheckPayslip />
      </main>
      <SiteFooter />
    </>
  );
}
