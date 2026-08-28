import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { FindUan } from "@/components/FindUan";

export const metadata = {
  title: "I don't know my UAN — how to find it",
  description:
    "Seven ways to find your Universal Account Number, and the one question that rules out three of them: whether you still have the mobile number registered on the account.",
  alternates: { canonical: "/find-your-uan/" },
  openGraph: {
    title: "You cannot do any of this without a UAN. Here is how to find yours.",
    description:
      "Every self-service lookup authenticates against the mobile registered when the account was opened. If that number is gone, only four of the seven routes can work — and nobody tells you first.",
  },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <FindUan />
      </main>
      <SiteFooter />
    </>
  );
}
