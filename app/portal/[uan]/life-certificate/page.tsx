import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember } from "@/lib/members";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

/* Jeevan Pramaan is the annual proof of life a pensioner submits to
   keep a pension running. It is submitted once a year, and if it
   lapses the pension simply stops — which is a far harsher
   consequence than the wording anywhere on the original screen
   suggests. None of our members draw a pension yet, so this page
   says so plainly instead of inventing a due date. */

export default async function LifeCertificate({
  params,
}: PageProps<"/portal/[uan]/life-certificate">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  const months = member.passbook.length;
  const drawingPension = false; // none of the mock members are pensioners

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h2 className="eyebrow section-mark">Life certificate &middot; Jeevan Pramaan</h2>
          <Tag kind="verified" />
        </div>
        <h2 className="display-2 measure mb-3">
          {drawingPension
            ? "Your pension continues only while this is current."
            : "This does not apply to you yet — and here is when it will."}
        </h2>
        <p className="lede measure">
          Annual proof that a pensioner is alive. If it lapses the pension stops
          — not reduced, stopped.
        </p>
      </section>

      <section className="border border-rule bg-paper-raised rounded-lg px-5 py-5">
        <p className="eyebrow mb-2">Your status</p>
        <p className="leading-relaxed max-w-2xl">
          You are not drawing a pension, so no life certificate is due. You have{" "}
          <span className="num font-semibold">{Math.floor(months / 12)} years{" "}
          {months % 12} months</span>{" "}
          of qualifying service recorded. A pension begins at 58, and only for
          members with at least ten years of qualifying service — from that
          point this becomes an annual obligation.
        </p>
      </section>

      <section>
        <p className="eyebrow mb-4">How it is submitted</p>
        <ol className="border border-rule divide-y divide-rule rounded-lg overflow-hidden">
          <Row
            n="01"
            title="From home, with face authentication"
            body="A pensioner can now generate the certificate on a phone using facial recognition, without visiting a bank or a common service centre. This replaced a journey that was genuinely hard for the people least able to make it."
          />
          <Row
            n="02"
            title="At a bank, post office or common service centre"
            body="Biometric submission remains available for anyone whose phone cannot run the app or whose face authentication fails."
          />
          <Row
            n="03"
            title="Through a doorstep banking request"
            body="Most public sector banks will send an officer to a pensioner who cannot travel. It is rarely advertised and has to be asked for by name."
          />
        </ol>
      </section>

      <Disclose label="What we changed" className="border-l-4 border-stamp bg-stamp-wash/40 rounded-lg px-5 py-4">
        <p className="text-ink-soft leading-relaxed max-w-2xl mb-3">
          The original screen offers the service without saying what happens if
          you miss it. For a pensioner living on that payment, the consequence
          is the most important fact on the page, so we lead with it — and we
          say plainly when the obligation starts rather than showing an empty
          form to someone it does not yet concern.
        </p>
        <Link
          href={`/portal/${member.uan}/pension`}
          className="btn btn-secondary btn-sm"
        >
          See your pension service
        </Link>
      </Disclose>
    </div>
  );
}

function Row({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="bg-paper p-5">
      <div className="flex items-start gap-4">
        <span className="num text-xs text-ink-faint pt-1 w-6 shrink-0">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold mb-1.5">{title}</p>
          <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
        </div>
      </div>
    </li>
  );
}
