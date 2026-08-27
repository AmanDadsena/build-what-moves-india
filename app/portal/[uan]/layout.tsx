import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { getMember } from "@/lib/members";

export const dynamicParams = false;

export default async function PortalLayout({
  children,
  params,
}: LayoutProps<"/portal/[uan]">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  return <PortalShell member={member}>{children}</PortalShell>;
}
