"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import type { Claim, Member, RejectionReason } from "@/lib/types";
import { ProvenanceKey } from "@/components/Provenance";
import { DecodePanel } from "@/components/panels/DecodePanel";
import { RecordsPanel } from "@/components/panels/RecordsPanel";
import { NoteSheetPanel } from "@/components/panels/NoteSheetPanel";
import { ClocksPanel } from "@/components/panels/ClocksPanel";
import { DocumentsPanel } from "@/components/panels/DocumentsPanel";
import { ClaimTimeline } from "@/components/ClaimTimeline";
import { CasePlan } from "@/components/CasePlan";

/* The case file, opened from inside the portal.

   Laid out as a file rather than a dashboard: the tabs are the parts
   of a physical case file, in the order a member needs them — what
   you were told, what your records say, what the office wrote down,
   how long you have, and what to send. */

const ALL_TABS = [
  { id: "status", label: "Where it stands" },
  { id: "decode", label: "The remark" },
  { id: "records", label: "Your records" },
  { id: "notesheet", label: "The note sheet" },
  { id: "clocks", label: "The clocks" },
  { id: "plan", label: "Your plan" },
  { id: "documents", label: "Documents" },
] as const;

type TabId = (typeof ALL_TABS)[number]["id"];

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

export function CaseWorkspace({
  member,
  claim,
  rejection,
}: {
  member: Member;
  claim: Claim;
  /* Absent for a settled claim: there is no remark to decode and no
     document to send, so the timeline is the whole page. */
  rejection?: RejectionReason;
}) {
  const TABS = rejection
    ? ALL_TABS
    : ALL_TABS.filter((t) => t.id === "status");

  const [tab, setTab] = useState<TabId>("status");

  // Elapsed time is genuinely "now", so it is computed after mount.
  // Rendering it on the server would bake the build date into a
  // static page and quietly show a wrong number.
  const [elapsed, setElapsed] = useState<number | null>(null);
  useEffect(() => {
    const filed = new Date(claim.filedOn).getTime();
    const timer = window.setTimeout(() => {
      setElapsed(Math.floor((Date.now() - filed) / 86_400_000));
    });

    return () => window.clearTimeout(timer);
  }, [claim.filedOn]);

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectTab = (index: number) => {
    const next = TABS[index];
    setTab(next.id);
    tabRefs.current[index]?.focus();
  };
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = TABS.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      selectTab(nextIndex);
    }
  };

  const noteSheet = claim.noteSheet ?? [];
  const rejectedOnDay =
    noteSheet.find((n) => n.action === "rejected")?.dayOffset ?? 0;

  return (
    <div className="space-y-6 stagger">
      <Link
        href={`/portal/${member.uan}/claims`}
        className="press inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        <span aria-hidden>&larr;</span> All claims
      </Link>

      {/* Case header */}
      <div className="border border-rule-heavy bg-paper-inset/50 px-5 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="eyebrow mb-2">
              {claim.form} &middot; {claim.type}
            </p>
            <h1 className="text-lg sm:text-xl font-semibold tracking-[-0.015em]">
              {claim.id}
            </h1>
            <p className="num text-sm text-ink-soft mt-1">
              Filed {fmt(claim.filedOn)}
            </p>
          </div>
          <div className="text-right shrink-0">
            {claim.status === "rejected" ? (
              <span className="stamp text-[10px] -rotate-2 inline-block mb-2.5">
                Rejected
              </span>
            ) : (
              <span className="tag tag-ok mb-2.5">Settled</span>
            )}
            <p className="figure text-xl" data-numeric>
              {rupees(claim.amount)}
            </p>
            <p className="text-xs text-ink-faint mt-0.5">
              {claim.status === "settled" ? "paid" : "unpaid"}
            </p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-px bg-rule border border-rule rounded-lg overflow-hidden">
          {claim.status === "settled" ? (
            <>
              <Fact label="Filed" value={fmt(claim.filedOn)} />
              <Fact
                label="Paid"
                value={claim.settledOn ? fmt(claim.settledOn) : "—"}
              />
              <Fact
                label="Days to payment"
                value={
                  claim.settledOn
                    ? String(
                        Math.round(
                          (+new Date(claim.settledOn) -
                            +new Date(claim.filedOn)) /
                            86_400_000
                        )
                      )
                    : "—"
                }
              />
            </>
          ) : (
            <>
              <Fact label="Entries on file" value={String(noteSheet.length)} />
              <Fact label="Days to rejection" value={String(rejectedOnDay)} />
              <Fact
                label="Days since filing"
                value={elapsed === null ? "—" : String(elapsed)}
                emphasis
              />
            </>
          )}
        </dl>
      </div>

      {/* File tabs. A settled claim has one, so the strip is hidden
          rather than shown with a single lonely item. */}
      <div className={`border-b border-rule-heavy ${TABS.length === 1 ? "hidden" : ""}`}>
        <div
          role="tablist"
          aria-label="Parts of this case file"
          className="flex gap-1 overflow-x-auto -mb-px"
        >
          {TABS.map((t, index) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`case-tab-${t.id}`}
                role="tab"
                aria-selected={active}
                aria-controls={`case-panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`press shrink-0 px-3.5 sm:px-4 py-2.5 text-sm border border-b-0 rounded-t-[3px] transition-colors ${
                  active
                    ? "bg-paper-raised border-rule-heavy text-ink font-medium"
                    : "border-transparent text-ink-faint hover:text-ink-soft hover:bg-paper-raised/50"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div
        id={`case-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`case-tab-${tab}`}
        tabIndex={0}
        className="pt-2 pb-4"
      >
        {tab === "status" && <ClaimTimeline claim={claim} />}
        {tab === "decode" && rejection && (
          <DecodePanel claim={claim} rejection={rejection} />
        )}
        {tab === "records" && rejection && (
          <RecordsPanel member={member} rejection={rejection} />
        )}
        {tab === "notesheet" && (
          <NoteSheetPanel member={member} claim={claim} />
        )}
        {tab === "clocks" && rejection && (
          <ClocksPanel claim={claim} rejection={rejection} elapsed={elapsed} />
        )}
        {tab === "plan" && rejection && (
          <CasePlan member={member} claim={claim} rejection={rejection} />
        )}
        {tab === "documents" && rejection && (
          <DocumentsPanel member={member} claim={claim} rejection={rejection} />
        )}
      </div>

      {/* Honesty key */}
      <div className="border-t border-rule pt-5 space-y-3">
        <ProvenanceKey />
        <p className="text-sm text-ink-faint max-w-3xl leading-relaxed">
          This member, their employer, their records and the noting on this file
          are invented for the prototype. The rejection remarks, the desk
          sequence, the escalation routes and the statutory periods are real.{" "}
          <Link href="/how-real" className="underline hover:text-ink">
            What is real and what is mocked
          </Link>
        </p>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="bg-paper px-3.5 py-3">
      <dt className="eyebrow mb-1.5">{label}</dt>
      <dd
        data-numeric
        className={`figure-sm text-base ${emphasis ? "text-stamp" : "text-ink"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
