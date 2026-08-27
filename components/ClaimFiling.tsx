"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Member } from "@/lib/types";
import {
  CLAIM_FORMS,
  preflight,
  verdict,
  type ClaimForm,
  type CheckStatus,
} from "@/lib/preflight";
import { getRejection } from "@/lib/rejections";
import { Tag } from "@/components/Provenance";
import { NetAmount } from "@/components/NetAmount";
import { AdvanceOptions } from "@/components/AdvanceOptions";

/* Filing a claim, with the rejection check moved to the front.

   The office runs these comparisons at submission and reports the
   outcome weeks later as a single sanitised line. There is no reason
   the member cannot see the same result before they commit — so here
   they do, with the fix linked from each failure. */

const MARK: Record<CheckStatus, { glyph: string; className: string }> = {
  pass: { glyph: "✓", className: "text-verify" },
  warn: { glyph: "!", className: "text-pending" },
  fail: { glyph: "×", className: "text-stamp" },
};

interface DraftDoc {
  name: string;
  size: number;
}

export function ClaimFiling({ member }: { member: Member }) {
  const draftKey = `rk-claim-draft-${member.uan}`;

  const [form, setForm] = useState<ClaimForm>("19");
  const [submitted, setSubmitted] = useState(false);
  const [docs, setDocs] = useState<DraftDoc[]>([]);
  const [note, setNote] = useState("");
  const [restored, setRestored] = useState(false);
  const [ready, setReady] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  /* Restore an interrupted draft.

     Civic forms get abandoned mid-way — a dropped connection, a
     phone that dies, a document that has to be fetched from another
     room. Losing everything on return is the single most common
     reason people give up entirely, so the draft is written on every
     change and offered back on the next visit. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as {
          form?: ClaimForm;
          docs?: DraftDoc[];
          note?: string;
        };
        if (d.form && d.form in CLAIM_FORMS) setForm(d.form);
        if (Array.isArray(d.docs)) setDocs(d.docs);
        if (typeof d.note === "string") setNote(d.note);
        if (d.form || d.docs?.length || d.note) setRestored(true);
      }
    } catch {
      // A corrupt draft is not worth failing the page over.
    }
    setReady(true);
  }, [draftKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(draftKey, JSON.stringify({ form, docs, note }));
  }, [form, docs, note, ready, draftKey]);

  /* Only the name and size are kept. The file itself is never read,
     never uploaded and never stored — there is nowhere for it to go,
     and a prototype has no business holding somebody's bank passbook. */
  function addFiles(list: FileList | null) {
    if (!list) return;
    const added = Array.from(list).map((f) => ({ name: f.name, size: f.size }));
    setDocs((current) => [...current, ...added].slice(0, 6));
    if (fileInput.current) fileInput.current.value = "";
  }

  function discardDraft() {
    localStorage.removeItem(draftKey);
    setForm("19");
    setDocs([]);
    setNote("");
    setRestored(false);
    setSubmitted(false);
  }

  const checks = useMemo(() => preflight(member, form), [member, form]);

  /* An indicative amount so the deduction is shown before filing: the
     full balance for a settlement, a typical advance otherwise. */
  const indicative =
    form === "19"
      ? member.balance.employeeShare + member.balance.employerShare
      : Math.round(
          (member.balance.employeeShare + member.balance.employerShare) * 0.4
        );
  const result = verdict(checks);
  const spec = CLAIM_FORMS[form];

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow section-mark">File a claim</p>
          <Tag kind="mock" />
        </div>
        <h2 className="display-2 measure mb-3">
          We check it against every reason claims get rejected — before you
          send it.
        </h2>
        <p className="lede measure">
          The office runs these same checks on arrival and tells you six weeks
          later. You can see the result now.
        </p>
      </section>

      {restored && (
        <section
          role="status"
          className="border border-noting/40 bg-noting-wash rounded-lg px-5 py-4 flex items-start justify-between gap-4 flex-wrap"
        >
          <div className="min-w-0">
            <p className="title mb-1">We kept where you left off</p>
            <p className="text-sm text-ink-soft leading-relaxed">
              Your form choice{docs.length > 0 ? `, ${docs.length} attached document${docs.length === 1 ? "" : "s"}` : ""}
              {note ? " and your note" : ""} were saved on this device.
            </p>
          </div>
          <button onClick={discardDraft} className="btn btn-ghost btn-sm">
            Start fresh
          </button>
        </section>
      )}

      {/* Which claim */}
      <section>
        <p className="eyebrow mb-4">What are you claiming?</p>
        <div className="grid gap-px bg-rule border border-rule rounded-lg overflow-hidden sm:grid-cols-3">
          {(Object.keys(CLAIM_FORMS) as ClaimForm[]).map((key) => {
            const f = CLAIM_FORMS[key];
            const on = key === form;
            return (
              <button
                key={key}
                onClick={() => {
                  setForm(key);
                  setSubmitted(false);
                }}
                aria-pressed={on}
                className={`press text-left p-5 transition-colors ${
                  on
                    ? "bg-paper-raised ring-2 ring-inset ring-noting"
                    : "bg-paper hover:bg-paper-raised/60"
                }`}
              >
                <p className="text-[11px] font-semibold text-ink-faint mb-2 uppercase tracking-[0.08em]">
                  {f.label}
                </p>
                <p className="font-semibold mb-1.5">{f.name}</p>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {f.blurb}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Verdict */}
      <section>
        <div
          className={`border rounded-lg card-lift px-5 py-5 ${
            result.status === "blocked"
              ? "border-stamp/50 bg-stamp-wash/40"
              : result.status === "warn"
                ? "border-pending/50 bg-pending-wash/50"
                : "border-verify/50 bg-verify-wash"
          }`}
        >
          <p className="eyebrow mb-2">Pre-flight result</p>
          <h3 className="display-3 mb-2.5">
            {result.status === "blocked"
              ? `This claim would be rejected. ${result.failed} ${
                  result.failed === 1 ? "check fails" : "checks fail"
                }.`
              : result.status === "warn"
                ? "This claim should go through, with a caution."
                : "Everything checks out. Nothing here would block it."}
          </h3>
          <p className="text-sm leading-relaxed max-w-2xl">
            {result.status === "blocked"
              ? "Filing now would cost you weeks and end in the same place. Fix the failures below, then come back — each one links to where it is fixed."
              : result.status === "warn"
                ? "Nothing here blocks payment, but read the cautions. One of them may cost you money even if the claim succeeds."
                : "Your records agree with each other and with Aadhaar, and your bank account is approved."}
          </p>
        </div>
      </section>

      {/* The checks */}
      <section>
        <p className="eyebrow mb-4">
          {checks.length} checks against your record
        </p>
        <ul className="border border-rule divide-y divide-rule rounded-lg overflow-hidden">
          {checks.map((check) => {
            const mark = MARK[check.status];
            const rejection = check.rejectionId
              ? getRejection(check.rejectionId)
              : undefined;
            return (
              <li key={check.id} className="bg-paper p-5">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className={`text-lg leading-none pt-0.5 shrink-0 font-bold ${mark.className}`}
                  >
                    {mark.glyph}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium mb-1.5">{check.label}</p>
                    <p className="text-sm text-ink-soft leading-relaxed mb-2.5">
                      {check.detail}
                    </p>

                    {rejection && (
                      <p className="text-sm text-stamp leading-relaxed mb-3">
                        Filed as it stands, this comes back as:{" "}
                        <span className="num">
                          &ldquo;{rejection.verbatim[0]}&rdquo;
                        </span>
                      </p>
                    )}

                    {check.fixPath && check.status !== "pass" && (
                      <Link
                        href={`/portal/${member.uan}${check.fixPath}`}
                        className="btn btn-secondary btn-sm"
                      >
                        {check.fixLabel}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {form === "31" && <AdvanceOptions member={member} />}

      <NetAmount member={member} amount={indicative} />

      {/* Supporting documents */}
      <section>
        <p className="eyebrow mb-4">Supporting documents</p>
        <div className="border border-rule-heavy bg-paper-raised rounded-lg overflow-hidden">
          <div className="px-5 py-5">
            <p className="text-ink-soft leading-relaxed measure mb-4">
              A bank passbook or cancelled cheque showing your printed name.
              Photograph it flat, in daylight, with the account number and IFSC
              in the same frame.
            </p>

            <label className="btn btn-secondary btn-sm cursor-pointer">
              Choose files
              <input
                ref={fileInput}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
              />
            </label>

            <p className="text-xs text-stamp leading-relaxed mt-3">
              Nothing is uploaded. Only the file name and size are kept, on this
              device, so your draft still lists what you attached.
            </p>
          </div>

          {docs.length > 0 && (
            <ul className="border-t border-rule divide-y divide-rule">
              {docs.map((d, i) => (
                <li
                  key={`${d.name}-${i}`}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm truncate">{d.name}</p>
                    <p className="text-xs text-ink-faint">
                      {(d.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setDocs((c) => c.filter((_, index) => index !== i))
                    }
                    aria-label={`Remove ${d.name}`}
                    className="btn btn-ghost btn-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Anything the office should know */}
      <section>
        <label htmlFor="claim-note" className="eyebrow block mb-2">
          Anything the office should know (optional)
        </label>
        <textarea
          id="claim-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="My employer has shut down, so nobody can approve my KYC."
          className="w-full border border-rule-heavy bg-paper-raised rounded-md px-4 py-3 text-base outline-none focus:border-noting placeholder:text-ink-faint/60 resize-none"
        />
      </section>

      {/* Submit */}
      <section className="border-t border-rule pt-6">
        {submitted ? (
          <div className="border-2 border-verify/30 bg-verify-wash rounded-lg px-5 py-5">
            <p className="eyebrow mb-2">Simulated</p>
            <p className="leading-relaxed max-w-2xl">
              In a real portal your {spec.label} claim would now be filed and
              given a claim ID. Nothing was submitted anywhere — this prototype
              reaches no government system.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={() => setSubmitted(true)}
              disabled={result.status === "blocked"}
              className="btn btn-primary"
            >
              File {spec.label}
            </button>
            <p className="text-sm text-ink-faint leading-relaxed max-w-md">
              {result.status === "blocked"
                ? "Disabled while a check is failing. The real portal would let you file this and reject it six weeks later."
                : "Filing is simulated. No government system is contacted."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
