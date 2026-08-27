import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { GrowthProjection } from "@/components/GrowthProjection";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]/growth">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} · If you leave it alone`,
    description:
      "What a provident fund balance becomes if it is left where it is, and what withdrawing at a job change actually costs.",
  };
}

export default async function Growth({
  params,
}: PageProps<"/portal/[uan]/growth">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  return <GrowthProjection member={member} />;
}
