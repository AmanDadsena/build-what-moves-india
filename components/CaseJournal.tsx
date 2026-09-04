"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Claim } from "@/lib/types";
import {
  CHANNELS,
  COUNTERPARTIES,
  channelInfo,
  counterpartyLabel,
  formatDate,
  newId,
  parse,
  serialise,
  storageKey,
  summarise,
  toSubmission,
  type Channel,
  type Counterparty,
  type Entry,
} from "@/lib/journal";
import { Disclose } from "@/components/Motion";

/* The log of what actually happened.
 *
 * Every escalation route in this product eventually asks the member
 * to establish that they asked first, and nothing in the real portal
 * records that. There is no notes field, no call log, and no place to
 * put the reference number a helpline reads out once. So a member
 * spends four months accumulating precisely the evidence their case
 * needs and keeps none of it.
 *
 * Two things this deliberately does not do.
 *
 * It does not validate. A form that rejects a half-remembered entry
 * gets abandoned by the person who did not catch the officer's name,
 * and a vague entry is worth more than no entry. Only the date and
 * the description are required, and the date defaults to today
 * because the overwhelmingly common case is logging something that
 * just happened.
 *
 * It does not sync. This lives in one browser, like everything else
 * here, and says so — but it rides in the case backup and the
 * handover link, so the member who changes phones or hands the case
 * to a daughter does not lose the evidence half of it.
 */

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function CaseJournal({ claim }: { claim: Claim }) {
  const key = storageKey(claim.id);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Draft fields, held apart from the saved list so an abandoned
  // half-filled form never becomes an entry.
  const [on, setOn] = useState(todayIso);
  const [channel, setChannel] = useState<Channel>("call");
  const [party, setParty] = useState<Counterparty>("epfo");
  const [reference, setReference] = useState("");
  const [what, setWhat] = useState("");
  const [outcome, setOutcome] = useState("");

  /* Read after mount. The server cannot know what is in this
     browser, and rendering a guess produces a hydration mismatch. */
  useEffect(() => {
    try {
      setEntries(parse(localStorage.getItem(key)));
    } catch {
      // Private mode. An empty log is the honest state.
    }
    setReady(true);
  }, [key]);

  const persist = useCallback(
    (next: Entry[]) => {
      setEntries(next);
      try {
        localStorage.setItem(key, serialise(next));
      } catch {
        // Quota or private mode. The list still works for this
        // session; nothing is claimed about it surviving.
      }
    },
    [key],
  );

  const summary = useMemo(() => summarise(entries), [entries]);

  const add = () => {
    if (!what.trim()) return;
    persist([
      ...entries,
      {
        id: newId(),
        on,
        channel,
        with: party,
        reference: reference.trim() || undefined,
        what: what.trim(),
        outcome: outcome.trim() || undefined,
      },
    ]);
    setReference("");
    setWhat("");
    setOutcome("");
    setOn(todayIso());
    setOpen(false);
  };

  const remove = (id: string) =>
    persist(entries.filter((e) => e.id !== id));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toSubmission(entries));
      setCopied(true);
      setTimeout(() => setCopied(false), 2600);
    } catch {
      setCopied(false);
    }
  };

  if (!ready) {
    return (
      <div className="py-10 text-sm text-ink-faint">
        Reading what is saved on this device&hellip;
      </div>
    );
  }

  const hint = channelInfo(channel);

  return (
    <div className="space-y-8">
      <section>
        {/* Deliberately untagged. Every other surface here carries a
            provenance mark, and none of the four fits: this is not
            verified, reconstructed or invented — it is whatever the
            member typed. A wrong tag is worse than none on a page
            whose argument is that provenance should be stated. */}
        <h2 className="eyebrow section-mark mb-3">What you have done</h2>
        <h3 className="display-2 measure mb-3">
          &ldquo;I called them many times&rdquo; loses. Three dates and a
          reference number does not.
        </h3>
        <p className="lede measure">
          Every route out of this eventually asks you to establish that you
          asked first. Nothing in the real portal records that, so this does —
          on this device, and nowhere else.
        </p>
      </section>

      {/* --- What the log is worth so far ------------------------- */}
      {entries.length > 0 && (
        <section
          aria-label="What this record establishes"
          className="grid gap-px bg-rule border border-rule rounded-xl overflow-hidden sm:grid-cols-3"
        >
          <Figure
            label="Entries"
            value={String(summary.entries)}
            note={
              summary.spanDays > 0
                ? `over ${summary.spanDays} days`
                : "recorded today"
            }
          />
          <Figure
            label="With a reference number"
            value={`${summary.withReference} of ${summary.entries}`}
            note={
              summary.withReference === summary.entries
                ? "every one can be traced"
                : "the others rest on your word alone"
            }
            tone={summary.withReference < summary.entries ? "pending" : undefined}
          />
          <Figure
            label="Last chased"
            value={
              summary.sinceLast === 0
                ? "Today"
                : `${summary.sinceLast} ${summary.sinceLast === 1 ? "day" : "days"} ago`
            }
            note={
              summary.sinceLast > 30
                ? "a long silence is itself worth citing"
                : "keep the interval short and documented"
            }
            tone={summary.sinceLast > 30 ? "pending" : undefined}
          />
        </section>
      )}

      {/* --- The log ---------------------------------------------- */}
      <section>
        {entries.length === 0 ? (
          <div className="border border-rule bg-paper-inset/40 rounded-xl px-6 py-8">
            <p className="display-3 mb-3">Nothing recorded yet.</p>
            <p className="text-ink-soft leading-relaxed measure mb-2">
              Start with the last thing that happened, even if it was months
              ago and you only half remember it. A dated entry that says
              &ldquo;called, told to wait&rdquo; is worth more in front of an
              officer than a clear memory with no date on it.
            </p>
            <p className="text-ink-soft leading-relaxed measure">
              The single most valuable thing to capture is the reference or
              docket number. It is offered once, usually spoken, and it is what
              turns your account of a call into a record of one.
            </p>
          </div>
        ) : (
          <ol className="border border-rule-heavy rounded-xl divide-y divide-rule overflow-hidden">
            {entries.map((e) => (
              <li key={e.id} className="bg-paper-raised px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                      <span className="num text-sm font-semibold">
                        {formatDate(e.on)}
                      </span>
                      <span className="tag tag-info">
                        {channelInfo(e.channel).label}
                      </span>
                      <span className="text-xs text-ink-faint">
                        {counterpartyLabel(e.with)}
                      </span>
                    </div>
                    <p className="leading-relaxed">{e.what}</p>
                    {e.outcome && (
                      <p className="text-sm text-ink-soft leading-relaxed mt-1.5">
                        {e.outcome}
                      </p>
                    )}
                    {e.reference ? (
                      <p className="machine text-sm mt-2.5 inline-block border border-rule bg-paper px-2.5 py-1 rounded">
                        {e.reference}
                      </p>
                    ) : (
                      <p className="text-xs text-ink-faint mt-2.5">
                        No reference number. Ask for one next time — it is what
                        makes this provable rather than asserted.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    aria-label={`Delete the entry for ${formatDate(e.on)}`}
                    className="press shrink-0 text-xs text-ink-faint hover:text-stamp underline underline-offset-4"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* --- Adding one ------------------------------------------- */}
      <section>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn btn-primary"
          >
            Record something that happened
          </button>
        ) : (
          <div className="border-2 border-noting bg-paper-raised rounded-xl p-6 space-y-5">
            <h3 className="display-3">Record something that happened</h3>

            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="eyebrow block mb-1.5">On what date</span>
                <input
                  type="date"
                  value={on}
                  max={todayIso()}
                  onChange={(ev) => setOn(ev.target.value)}
                  className="num w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md"
                />
              </label>

              <label className="block">
                <span className="eyebrow block mb-1.5">How</span>
                <select
                  value={channel}
                  onChange={(ev) => setChannel(ev.target.value as Channel)}
                  className="w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md"
                >
                  {CHANNELS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="eyebrow block mb-1.5">With whom</span>
                <select
                  value={party}
                  onChange={(ev) => setParty(ev.target.value as Counterparty)}
                  className="w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md"
                >
                  {COUNTERPARTIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="eyebrow block mb-1.5">
                  Reference or docket number
                </span>
                <input
                  value={reference}
                  onChange={(ev) => setReference(ev.target.value)}
                  placeholder="If you were given one"
                  className="machine w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md placeholder:text-ink-faint/60"
                />
              </label>
            </div>

            {/* The hint changes with the channel, because what is worth
                capturing from a phone call is not what is worth
                capturing from a counter visit. */}
            <p
              role="status"
              className="text-sm text-ink-soft leading-relaxed border-l-4 border-noting bg-noting-wash/40 rounded-r-lg px-4 py-3"
            >
              {hint.capture}
            </p>

            <label className="block">
              <span className="eyebrow block mb-1.5">What happened</span>
              <textarea
                value={what}
                onChange={(ev) => setWhat(ev.target.value)}
                rows={3}
                placeholder="Asked why the claim was returned. Nobody could say."
                className="w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md placeholder:text-ink-faint/60 leading-relaxed"
              />
            </label>

            <label className="block">
              <span className="eyebrow block mb-1.5">
                What it produced <span className="normal-case">(optional)</span>
              </span>
              <input
                value={outcome}
                onChange={(ev) => setOutcome(ev.target.value)}
                placeholder="Told to wait fifteen days."
                className="w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md placeholder:text-ink-faint/60"
              />
            </label>

            <div className="flex gap-2 flex-wrap pt-1">
              <button
                type="button"
                onClick={add}
                disabled={!what.trim()}
                className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save this entry
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* --- What it is for --------------------------------------- */}
      {entries.length > 0 && (
        <section className="border border-rule-heavy bg-paper-inset/40 rounded-xl px-6 py-6">
          <h3 className="eyebrow mb-2">Where this goes</h3>
          <p className="text-ink-soft leading-relaxed measure mb-4">
            A grievance or an RTI that arrives with a dated list of what was
            already tried is a different document from one that arrives
            without. It moves the question from{" "}
            <em>have you tried asking</em> to{" "}
            <em>here is what asking produced</em>. Paste this into the covering
            words of either.
          </p>

          <div className="flex gap-2 flex-wrap mb-4">
            <button type="button" onClick={copy} className="btn btn-primary btn-sm">
              Copy the chronology
            </button>
          </div>

          <p role="status" className="text-sm text-verify h-5" aria-live="polite">
            {copied ? "Copied. Paste it under your grievance or application." : ""}
          </p>

          <Disclose label="See what would be pasted" className="mt-2">
            <pre className="machine text-xs leading-relaxed whitespace-pre-wrap bg-paper border border-rule rounded-lg p-4 mt-3 overflow-x-auto">
              {toSubmission(entries)}
            </pre>
          </Disclose>
        </section>
      )}

      <p className="text-sm text-ink-faint leading-relaxed measure">
        This is stored in this browser and nowhere else. Nothing is sent
        anywhere. Clearing your browsing data will lose it, which is why it
        travels in the case file you can save or hand to somebody helping you.
      </p>
    </div>
  );
}

function Figure({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "pending";
}) {
  return (
    <div className="bg-paper-raised px-5 py-5">
      <p className="eyebrow mb-2">{label}</p>
      <p
        className={`figure text-2xl mb-1 ${tone === "pending" ? "text-pending" : ""}`}
      >
        {value}
      </p>
      <p className="text-xs text-ink-soft leading-relaxed">{note}</p>
    </div>
  );
}
