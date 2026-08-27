import { notFound } from "next/navigation";
import { AskPanel } from "@/components/AskPanel";
import { MEMBERS, getMember } from "@/lib/members";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]/ask">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} · Ask`,
    description:
      "Sourced answers about provident fund claims, deadlines and escalation. Retrieved from cited references, never generated.",
  };
}

export default async function Ask({ params }: PageProps<"/portal/[uan]/ask">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  return <AskPanel uan={member.uan} />;
}
