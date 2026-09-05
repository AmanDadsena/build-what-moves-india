"use client";

import { useEffect, useState } from "react";
import {
  channelInfo,
  counterpartyLabel,
  formatDate,
  parse,
  storageKey,
  summarise,
  type Entry,
} from "@/lib/journal";

/* The chronology, on the sheet somebody carries.
 *
 * The case summary is written to be printed and handed over — to a
 * son, an NGO caseworker, a clerk at a counter. It already carries
 * the record: who the member is, what was claimed, what the remark
 * said, what should happen next.
 *
 * What it could not carry until now is the half that is hardest to
 * reconstruct and most valuable in front of an officer: what the
 * member has already done, on which dates, and with which reference
 * numbers. That is the difference between "I have been chasing this
 * for months" and a dated list, and it is the thing a person helping
 * would otherwise spend twenty minutes extracting by asking.
 *
 * It is a client component inside an otherwise static page because
 * the log lives in the member's own browser and nowhere else. It
 * renders nothing at all when there is nothing recorded, so the sheet
 * is unchanged for somebody who has not used the log.
 */

export function JournalSummary({ claimIds }: { claimIds: string[] }) {
  const [byClaim, setByClaim] = useState<Array<[string, Entry[]]>>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const found: Array<[string, Entry[]]> = [];
    try {
      for (const id of claimIds) {
        const entries = parse(localStorage.getItem(storageKey(id)));
        if (entries.length > 0) found.push([id, entries]);
      }
    } catch {
      // Private mode. Nothing recorded is the honest state.
    }
    setByClaim(found);
    setReady(true);
  }, [claimIds]);

  // Nothing yet, or nothing readable. The sheet is complete without it.
  if (!ready || byClaim.length === 0) return null;

  return (
    <section>
      <h3 className="display-3 mb-3 pb-2 border-b border-rule">
        What has already been done
      </h3>

      {byClaim.map(([claimId, entries]) => {
        const s = summarise(entries);
        const forwards = [...entries].reverse();

        return (
          <div key={claimId} className="mb-5 last:mb-0">
            {byClaim.length > 1 && (
              <p className="num text-xs text-ink-faint mb-2">{claimId}</p>
            )}

            <ol className="space-y-2.5">
              {forwards.map((e) => (
                <li key={e.id} className="text-sm leading-relaxed flex gap-3">
                  <span className="num shrink-0 whitespace-nowrap">
                    {formatDate(e.on)}
                  </span>
                  <span className="min-w-0">
                    <span className="text-ink-faint">
                      {channelInfo(e.channel).label},{" "}
                      {counterpartyLabel(e.with)}.
                    </span>{" "}
                    {e.what}
                    {e.outcome ? ` ${e.outcome}` : ""}
                    {e.reference && (
                      <>
                        {" "}
                        <span className="machine">Ref {e.reference}</span>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>

            {/* The sentence an officer or a forum actually needs, rather
                than leaving them to count the rows. */}
            <p className="text-sm text-ink-soft leading-relaxed mt-3">
              {s.entries} {s.entries === 1 ? "entry" : "entries"} between{" "}
              {formatDate(s.first!)} and {formatDate(s.last!)}
              {s.employerApproaches >= 2 && (
                <>
                  {" "}
                  &mdash; the establishment was approached{" "}
                  {s.employerApproaches} times without the matter being resolved
                </>
              )}
              .
            </p>
          </div>
        );
      })}
    </section>
  );
}
