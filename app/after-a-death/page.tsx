import { AfterADeath } from "@/components/AfterADeath";

export const metadata = {
  title: "If the member has died — what a family is owed",
  description:
    "Three separate entitlements follow a member's death: the provident fund balance, a monthly pension, and an insurance payment. Most families claim only the first. The ten-year service rule does not apply to a death in service.",
  alternates: { canonical: "/after-a-death/" },
  openGraph: {
    title: "Three things are owed. Most families claim one.",
    description:
      "The fund balance, a monthly pension and an insurance payment are three separate claims with three separate forms.",
  },
};

/* Split from the component only so this page can carry its own
   metadata: a page that exports "use client" cannot, and this is one
   of the pages that most needs to be findable by somebody searching
   in the week after a death. */

export default function Page() {
  return <AfterADeath />;
}
