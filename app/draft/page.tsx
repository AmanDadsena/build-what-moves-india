import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { DraftDocuments } from "@/components/DraftDocuments";

export const metadata = {
  title: "Draft your RTI, grievance and employer letter — free, no sign-in",
  description:
    "The six letters this site can draft, filled with your own claim rather than a demonstration one. Eight fields, no account, and nothing sent anywhere — including the RTI application that must be answered in thirty days.",
  alternates: { canonical: "/draft/" },
  openGraph: {
    title: "The letters, with your name on them rather than somebody else's.",
    description:
      "An RTI application about your own file costs ₹10 and must be answered in thirty days. This drafts it from eight things on the message that rejected you, without an account.",
  },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <DraftDocuments />
      </main>
      <SiteFooter />
    </>
  );
}
