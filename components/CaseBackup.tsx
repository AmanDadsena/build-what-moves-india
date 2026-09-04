"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShareLink } from "@/components/ShareLink";
import {
  collect,
  restore,
  encode,
  isBackup,
  wrap,
  describe,
  plural,
  type Backup,
} from "@/lib/casefile";

/* Taking your case with you, and handing it to somebody else.
 *
 * The reasoning for both is in lib/casefile.ts, which owns the one
 * definition of what a case contains — this file used to keep a
 * second copy of that list, and two lists that must agree and are
 * edited separately do not stay agreed.
 *
 * Three ways out, in the order people need them:
 *
 *   A file, for the member's own next device.
 *   A link, for the daughter or the caseworker doing the typing.
 *   Reading it back in, from either.
 */

export function CaseBackup({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState({
    plans: 0,
    journals: 0,
    checklists: 0,
    settings: 0,
  });
  const [link, setLink] = useState<string | null>(null);
  const [tooBig, setTooBig] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(() => {
    const data = collect(localStorage);
    setCount(Object.keys(data).length);
    setSummary(describe(data));

    if (Object.keys(data).length === 0) {
      setLink(null);
      setTooBig(false);
      return;
    }
    const token = encode(data);
    setTooBig(token === null);
    setLink(
      token
        ? `${window.location.origin}${window.location.pathname}#case=${token}`
        : null,
    );
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  const save = useCallback(() => {
    const backup: Backup = wrap(collect(localStorage));
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `provident-fund-case-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setNote(
      `Saved ${plural(Object.keys(backup.data).length, "item", "items")} to a file.`,
    );
    setError(null);
  }, []);

  const readFile = useCallback(
    async (file: File) => {
      setNote(null);
      setError(null);
      try {
        const parsed: unknown = JSON.parse(await file.text());

        /* Checked before anything is written. A file from somewhere
           else would otherwise overwrite a member's real progress
           with whatever it happened to contain. */
        if (!isBackup(parsed)) {
          setError(
            "That file was not saved by this site. Nothing has been changed.",
          );
          return;
        }

        const written = restore(localStorage, parsed.data);
        refresh();
        setNote(
          `Restored ${plural(written, "item", "items")}. Reload the page to see them applied.`,
        );
      } catch {
        setError("That file could not be read. Nothing has been changed.");
      }
    },
    [refresh],
  );

  if (!mounted) return null;

  return (
    <div className={className}>
      <p className="eyebrow mb-2">Keep your progress</p>
      <p className="text-sm text-ink-soft leading-relaxed measure mb-4">
        Everything you have ticked off is stored in this browser and nowhere
        else — there is no account here and nothing is sent anywhere. A claim
        runs for months, and a cleared phone or a wiped café machine takes it
        with it. Save it to a file and it is yours.
      </p>

      <div className="flex gap-2 flex-wrap items-center">
        <button
          onClick={save}
          disabled={count === 0}
          className="btn btn-secondary btn-sm disabled:opacity-40"
        >
          {count === 0
            ? "Nothing saved yet"
            : `Save ${plural(count, "item", "items")} to a file`}
        </button>

        <button
          onClick={() => fileInput.current?.click()}
          className="btn btn-ghost btn-sm"
        >
          Restore from a file
        </button>

        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {(note || error) && (
        <p
          role="status"
          className={`text-sm leading-relaxed mt-3 ${error ? "text-stamp" : "text-verify"}`}
        >
          {error ?? note}
        </p>
      )}

      {/* --- Handing it to somebody else -------------------------- */}
      {count > 0 && (
        <div className="mt-6 pt-5 border-t border-rule">
          <p className="eyebrow mb-2">Hand this case to someone</p>
          <p className="text-sm text-ink-soft leading-relaxed measure mb-3">
            Most people do not do this alone. This link carries{" "}
            {sentenceList(
              [
                summary.plans > 0 &&
                  `${plural(summary.plans, "claim", "claims")} you are working on`,
                summary.journals > 0 &&
                  `the dated record of what you have already done`,
                summary.checklists > 0 && "the documents you have gathered",
                summary.settings > 0 && "your language and text-size settings",
              ].filter(Boolean) as string[],
            )}{" "}
            &mdash; so whoever opens it starts where you left off instead of
            asking you to repeat it.
          </p>

          {link ? (
            <>
              <ShareLink
                url={link}
                title="A provident fund case in progress"
                text="Open this to see what has been done so far and what is left."
                label="Send this case"
              />
              {/* This sentence is the whole basis on which somebody
                  decides to send the link, so it has to describe the
                  payload exactly. Anything added to the backup has to
                  be added here in the same change. */}
              <p className="text-xs text-ink-faint leading-relaxed mt-3 measure">
                What it carries: which steps are ticked, the dated notes you
                have written about calls and visits, which documents are
                gathered, and how you like your text. No Aadhaar, PAN, bank
                detail or amount &mdash; those are never stored here in the
                first place. And the part after the{" "}
                <span className="machine">#</span> in the address is not sent
                to any server, including this one: it travels only between the
                two phones.
              </p>
            </>
          ) : tooBig ? (
            <p className="text-sm text-ink-soft leading-relaxed measure">
              There is more here than a link can carry safely — a truncated one
              would restore half a plan, which is worse than none. Save it to a
              file above and send that instead.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* The other end of the link.
 *
 * Deliberately never automatic. A URL that silently rewrites what is
 * stored on somebody's phone is the shape of an attack even when it
 * is not one, and the recipient is frequently the person in the pair
 * who is *less* confident with a phone. So it says what it holds,
 * says where it came from, and waits.
 *
 * Mounted at the layout root, because the link points at whatever
 * page the sender happened to be on. */
export function CaseHandoff() {
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const read = useCallback(() => {
    if (!window.location.hash.startsWith("#case=")) {
      setData(null);
      return;
    }
    /* Imported lazily so the decoder — and its base64 tables — are
       not in the critical path of a page nobody handed over. */
    import("@/lib/casefile").then(({ decode }) => {
      setData(decode(window.location.hash.slice("#case=".length)));
    });
  }, []);

  useEffect(() => {
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [read]);

  const clearHash = () => {
    /* replaceState rather than assigning location.hash: it takes the
       payload out of the address bar and the back button without
       adding a history entry the member has to press through. */
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    setData(null);
  };

  /* Before the empty check, not after it. Loading the case is what
     clears the payload out of the address, so by the time this runs
     there is deliberately no `data` left — testing that first made
     the confirmation unreachable and the load look like it had done
     nothing. */
  if (done !== null) {
    return (
      <div className="border-b border-verify bg-verify-wash">
        <div className="shell py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-ink">
            Loaded {plural(done, "item", "items")}. Reload the page to see it
            applied.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-sm"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const summary = describe(data);
  const parts = [
    summary.plans > 0 && plural(summary.plans, "claim in progress", "claims in progress"),
    summary.journals > 0 &&
      plural(summary.journals, "dated record of what was done", "dated records of what was done"),
    summary.checklists > 0 && "a list of documents gathered",
    summary.settings > 0 && "reading and language settings",
  ].filter(Boolean) as string[];

  return (
    <div className="border-b border-rule-heavy bg-pending-wash">
      <div className="shell py-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            Somebody has sent you a case they are working on.
          </p>
          <p className="text-sm text-ink-soft leading-relaxed mt-1 measure">
            It carries {parts.join(", ")}. Loading it replaces what this browser
            currently holds. Nothing has changed yet.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              setDone(restore(localStorage, data));
              clearHash();
            }}
            className="btn btn-primary btn-sm"
          >
            Load it
          </button>
          <button onClick={clearHash} className="btn btn-ghost btn-sm">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

/* "a", "a and b", "a, b and c". The previous version wired the
   conjunction between exactly two possible items, so adding a third
   produced "a, b your settings" — the glue has to be a function of
   how many there are. */
function sentenceList(items: string[]): string {
  if (items.length === 0) return "nothing yet";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}
