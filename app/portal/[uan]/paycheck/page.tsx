import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { Paycheck } from "@/components/Paycheck";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]/paycheck">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} · Where the money went`,
    description:
      "One month of provident fund contributions, recomputed from the rules — including the part of your employer's share that goes to pension on a ceiling wage rather than on your salary.",
  };
}

export default async function PaycheckPage({
  params,
}: PageProps<"/portal/[uan]/paycheck">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  return <Paycheck member={member} />;
}
