import { notFound } from "next/navigation";
import { ClaimFiling } from "@/components/ClaimFiling";
import { MEMBERS, getMember } from "@/lib/members";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export default async function FileClaim({
  params,
}: PageProps<"/portal/[uan]/file">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  return <ClaimFiling member={member} />;
}
