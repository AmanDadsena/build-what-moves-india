"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Taking your case with you.
 *
 * There is no account here and there is not going to be one, so every
 * tick on a plan, every document gathered for a death claim and every
 * reading preference lives in this browser and nowhere else. That is
 * the right trade — nothing about somebody's blocked money sits on a
 * server I control — but it has a cost, and the cost lands on exactly
 * the people least able to absorb it.
 *
 * A claim runs for months. In that time a shared phone gets cleared, a
 * cyber-café machine is wiped nightly, a browser is reinstalled, or
 * the work moves from a son's phone to a daughter's. Any of those and
 * the record of what has already been done is gone, which in practice
 * means starting the sequence again.
 *
 * So the state can be written out to a small file and read back in.
 * No account, no upload, no server: the member holds the file. It is
 * the same reasoning as the calendar export — the durable copy should
 * belong to them rather than to this site.
 */

/* Only the keys this build owns, listed rather than swept up, so a
   future key cannot be exported by accident. */
const KEYS = [
  "rk-reader", // reading preferences
  "rk-lang", // chosen language
  "rk-voice-lang", // dictation language
  "rk-survivor-checklist", // documents gathered after a death
  "rk-install-dismissed",
  "epf.install.dismissed",
] as const;

const PLAN_PREFIX = "rk-plan-"; // one per claim
const FORMAT = "reject-kyun/case-backup";
const VERSION = 1;

interface Backup {
  format: string;
  version: number;
  savedAt: string;
  data: Record<string, string>;
}

function collect(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (const key of KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null) out[key] = value;
    }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PLAN_PREFIX)) {
        out[key] = localStorage.getItem(key) ?? "";
      }
    }
  } catch {
    // Private mode. Nothing to collect, and nothing to report.
  }
  return out;
}

export function CaseBackup({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setCount(Object.keys(collect()).length);
  }, []);

  const save = useCallback(() => {
    const data = collect();
    const backup: Backup = {
      format: FORMAT,
      version: VERSION,
      savedAt: new Date().toISOString(),
      data,
    };
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
    setNote(`Saved ${Object.keys(data).length} items to a file.`);
    setError(null);
  }, []);

  const restore = useCallback(async (file: File) => {
    setNote(null);
    setError(null);
    try {
      const parsed = JSON.parse(await file.text()) as Backup;

      /* Checked before anything is written. A file from somewhere else
         would otherwise overwrite a member's real progress with
         whatever it happened to contain. */
      if (parsed?.format !== FORMAT || typeof parsed.data !== "object") {
        setError(
          "That file was not saved by this site. Nothing has been changed.",
        );
        return;
      }

      let written = 0;
      for (const [key, value] of Object.entries(parsed.data)) {
        const known =
          (KEYS as readonly string[]).includes(key) ||
          key.startsWith(PLAN_PREFIX);
        if (!known || typeof value !== "string") continue;
        localStorage.setItem(key, value);
        written += 1;
      }

      setCount(Object.keys(collect()).length);
      setNote(
        `Restored ${written} items. Reload the page to see them applied.`,
      );
    } catch {
      setError("That file could not be read. Nothing has been changed.");
    }
  }, []);

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
            : `Save ${count} ${count === 1 ? "item" : "items"} to a file`}
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
            if (file) restore(file);
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
    </div>
  );
}
