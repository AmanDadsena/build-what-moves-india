"use client";

import { useMemo, useState } from "react";
import type { Claim, Member, RejectionReason } from "@/lib/types";
import { DOCUMENTS } from "@/lib/documents";
import { Tag } from "@/components/Provenance";

export function DocumentsPanel({
  member,
  claim,
  rejection,
}: {
  member: Member;
  claim: Claim;
  rejection: RejectionReason;
}) {
  const pack = useMemo(
    () => DOCUMENTS.filter((d) => rejection.documents.includes(d.id)),
    [rejection.documents]
  );

  const [openId, setOpenId] = useState<string>(pack[0]?.id ?? "");
  const [copied, setCopied] = useState<string | null>(null);

  const active = pack.find((d) => d.id === openId) ?? pack[0];
  const body = active ? active.build(member, claim, rejection) : "";

  async function copy() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(body);
      setCopied(active.id);
      setTimeout(() => setCopied(null), 2200);
    } catch {
      setCopied("failed");
      setTimeout(() => setCopied(null), 2600);
    }
  }

  function download() {
    if (!active) return;
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.id}-${member.uan}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!active) {
    return (
      <p className="text-ink-soft">
        This rejection is cleared by refiling correctly. There is nothing to
        send and nobody to write to.
      </p>
    );
  }

  return (
    <div className="space-y-8 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow">Written for your case</p>
          <Tag kind="statutory" />
        </div>
        <h2 className="display-2 measure mb-4">
          Every letter you are entitled to send, already filled in.
        </h2>
        <p className="lede measure">
          Your claim number, dates, employer and the exact remark are already in
          the text. Anything still in square brackets is something only you can
          supply.
        </p>
      </section>

      {/* Document chooser */}
      <div className="flex flex-wrap gap-2">
        {pack.map((d) => {
          const on = d.id === active.id;
          return (
            <button
              key={d.id}
              onClick={() => setOpenId(d.id)}
              aria-pressed={on}
              className={`press text-sm px-3.5 py-2 border rounded-xs transition-colors ${
                on
                  ? "bg-ink text-paper border-ink"
                  : "border-rule-heavy text-ink-soft hover:border-ink hover:bg-paper-raised"
              }`}
            >
              {d.title}
            </button>
          );
        })}
      </div>

      {/* Active document. data-print isolates this subtree when the
          page is printed; everything else is hidden by the print
          stylesheet. */}
      <section
        data-print
        className="border border-rule-heavy rounded-lg overflow-hidden"
      >
        {/* Paper-only letterhead and provenance line. */}
        <div className="print-head">
          <p style={{ fontWeight: 700, fontSize: "12pt" }}>{active.title}</p>
          <p style={{ fontSize: "9.5pt" }}>
            Prepared for {member.name} · UAN {member.uan} · claim {claim.id}
          </p>
        </div>
        <div className="border-b border-rule bg-paper-inset/60 px-4 py-3.5 sm:px-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h3 className="font-semibold tracking-[-0.01em]">
                {active.title}
              </h3>
              <p className="font-deva text-sm text-ink-soft mt-0.5">
                {active.titleHi}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={copy}
                className="btn btn-primary btn-sm"
              >
                {copied === active.id
                  ? "Copied"
                  : copied === "failed"
                    ? "Select and copy"
                    : "Copy text"}
              </button>
              <button
                onClick={download}
                className="btn btn-secondary btn-sm"
              >
                Download
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
              >
                Print
              </button>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="eyebrow shrink-0 pt-0.5 w-16">Send to</dt>
              <dd className="text-ink-soft">{active.channel}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="eyebrow shrink-0 pt-0.5 w-16">Purpose</dt>
              <dd className="text-ink-soft">{active.purpose}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="eyebrow shrink-0 pt-0.5 w-16">Standing</dt>
              <dd className="text-ink-soft leading-relaxed">
                {active.standing}
              </dd>
            </div>
          </dl>
        </div>

        <pre className="machine text-[12.5px] sm:text-[13.5px] leading-relaxed whitespace-pre-wrap break-words bg-paper-raised px-4 py-5 sm:px-6 sm:py-6 overflow-x-auto">
          {body}
        </pre>

        <div className="print-foot">
          <p>
            Drafted with an independent prototype of a provident fund member
            portal. Not an official EPFO document, and not legal advice. Check
            every square-bracketed field before sending.
          </p>
        </div>
      </section>

      <p className="text-sm text-ink-faint leading-relaxed max-w-2xl">
        These are drafts prepared from public procedure and the text of the
        Right to Information Act 2005. They are not legal advice, and nothing
        here is filed on your behalf — you send them yourself.
      </p>
    </div>
  );
}
