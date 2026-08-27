import { notFound } from "next/navigation";
import { CaseWorkspace } from "@/components/CaseWorkspace";
import { MEMBERS, getMember, getClaim } from "@/lib/members";
import { getRejection } from "@/lib/rejections";

export const dynamicParams = false;

/* Every claim gets a page. A settled one shows only its journey —
   which is still the question people ask most often, and the old
   portal answers it for no claim at all. */
export function generateStaticParams() {
  return MEMBERS.flatMap((m) =>
    m.claims.map((c) => ({ uan: m.uan, claimId: c.id }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[uan]/claims/[claimId]">) {
  const { uan, claimId } = await params;
  const member = getMember(uan);
  const claim = getClaim(uan, claimId);
  if (!member || !claim) return { title: "Claim not found" };
  return {
    title: `${member.name} · ${claim.id} · ${claim.form}`,
    description: claim.remark,
  };
}

export default async function ClaimCase({
  params,
}: PageProps<"/portal/[uan]/claims/[claimId]">) {
  const { uan, claimId } = await params;

  const member = getMember(uan);
  if (!member) notFound();

  const claim = getClaim(uan, claimId);
  if (!claim) notFound();

  const rejection = claim.rejectionId
    ? getRejection(claim.rejectionId)
    : undefined;

  return <CaseWorkspace member={member} claim={claim} rejection={rejection} />;
}
