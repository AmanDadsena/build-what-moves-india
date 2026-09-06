"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMPTY,
  FORMS,
  STORAGE_KEY,
  completeness,
  draft,
  parse,
  serialise,
  templatesFor,
  type DraftInput,
} from "@/lib/draft";
import { REJECTIONS } from "@/lib/rejections";
import { PageHero } from "@/components/PageHero";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";

/* The letters, for the person actually reading the page.
 *
 * Every rejection page ends by listing what this site can draft, and
 * the button under that list used to go to a sign-in page offering
 * three fictional members. So somebody arriving from a search engine
 * with a real rejection could be told the RTI existed — the one
 * instrument in this entire process with a deadline anybody has to
 * keep — and then had to sign in as Rajesh Kumar to receive Rajesh
 * Kumar's application.
 *
 * Eight fields, all of them on the message that rejected them, and
 * the same six templates the portal uses.
 *
 * The form does not gate anything. Every letter is drafted from the
 * first keystroke, and an empty field becomes a bracketed instruction
 * inside the letter rather than a red border on the form. Somebody
 * who cannot remember the exact amount still leaves with an RTI they
 * can finish by hand, which is the whole difference between this and
 * a form that says "required".
 */

export function DraftDocuments() {
  /* Starts EMPTY on the server and on the client alike, which is what
     keeps hydration quiet — and it is also the right thing to render
     for somebody arriving with nothing saved. */
  const [input, setInput] = useState<DraftInput>({ ...EMPTY });
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  /* ?reason= is read from the address bar after mount rather than
     with useSearchParams, for the reason SearchPage gives at length:
     on a statically exported page the hook buys nothing and forces a
     Suspense boundary whose fallback can strand the real content in a
     hidden container. Reading location removes the boundary and the
     failure mode with it. */
  useEffect(() => {
    let saved = { ...EMPTY };
    try {
      saved = parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      // Private mode. An empty form still drafts.
    }
    const asked = new URLSearchParams(window.location.search).get("reason");
    // A reason in the address is the one the member was just reading,
    // so it wins over whatever they chose on a previous visit.
    setInput(asked ? { ...saved, reasonId: asked } : saved);
  }, []);

  const set = useCallback((patch: Partial<DraftInput>) => {
    setInput((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, serialise(next));
      } catch {
        // Quota or private mode. It still works for this session.
      }
      return next;
    });
  }, []);

  const templates = useMemo(() => templatesFor(input.reasonId), [input.reasonId]);
  const progress = useMemo(() => completeness(input), [input]);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2600);
    } catch {
      setCopied(null);
    }
  };

  const download = (id: string, title: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* There is deliberately no loading state here.
   *
   * Gating the page on the localStorage read meant the exported HTML
   * for /draft was one sentence — "reading what is saved on this
   * device" — with no heading, no form and no letters in it. Which
   * costs three separate things: a screen reader arrives at a page
   * with no h1, anybody without JavaScript gets nothing at all, and a
   * search engine indexes an empty page. That last one matters most
   * for this page in particular, because somebody searching "how to
   * write an RTI for PF claim" is exactly who it is for.
   *
   * The empty form is the correct first render anyway, and the saved
   * values arrive a moment later. The static HTML now carries a
   * complete RTI application with bracketed prompts in it, which is
   * the best possible thing for a crawler to find. */

  return (
    <>
      <PageHero
        eyebrow="Draft it for your own claim"
        provenance="statutory"
        title="The letters, with your name on them rather than somebody else's."
        titleHi="ये पत्र, किसी और के नहीं — आपके अपने नाम से।"
        lede="Eight things, all of them on the message that rejected you. No sign-in, no account, and nothing sent anywhere — the letters are assembled in this browser and never leave it."
      />

      <div className="shell py-10 sm:py-14 space-y-12 stagger">
        {/* ---- The eight fields ---- */}
        <section className="shell-reading">
          <h2 className="eyebrow section-mark mb-4">What the letters need</h2>
          <p className="text-ink-soft leading-relaxed measure mb-6">
            Fill in what you have. Anything you leave blank appears in the
            letter as an instruction in square brackets, so you can finish it
            by hand &mdash; a missing amount is not a reason to be sent away
            without an application.
          </p>

          <div className="border border-rule-heavy bg-paper-raised rounded-xl p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Your full name, as on your UAN">
                <input
                  value={input.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="As it appears in EPFO records"
                  autoComplete="off"
                  className={INPUT}
                />
              </Field>

              <Field label="Your UAN">
                <input
                  value={input.uan}
                  onChange={(e) => set({ uan: e.target.value })}
                  inputMode="numeric"
                  placeholder="12 digits"
                  autoComplete="off"
                  className={`num ${INPUT}`}
                />
              </Field>

              <Field label="Your employer's name">
                <input
                  value={input.employer}
                  onChange={(e) => set({ employer: e.target.value })}
                  placeholder="The establishment you worked for"
                  autoComplete="off"
                  className={INPUT}
                />
              </Field>

              <Field label="Which form you filed">
                <select
                  value={input.form}
                  onChange={(e) => {
                    const f = FORMS.find((x) => x.form === e.target.value);
                    set({ form: e.target.value, type: f?.type ?? input.type });
                  }}
                  className={INPUT}
                >
                  {FORMS.map((f) => (
                    <option key={f.form} value={f.form}>
                      {f.form} &mdash; {f.type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="The date you filed it">
                <input
                  type="date"
                  value={input.filedOn}
                  onChange={(e) => set({ filedOn: e.target.value })}
                  className={`num ${INPUT}`}
                />
              </Field>

              <Field label="The amount you claimed">
                <input
                  value={input.amount}
                  onChange={(e) => set({ amount: e.target.value })}
                  inputMode="numeric"
                  placeholder="e.g. 187430"
                  className={`num ${INPUT}`}
                />
              </Field>
            </div>

            <Field label="The remark you were shown, word for word">
              <textarea
                value={input.remark}
                onChange={(e) => set({ remark: e.target.value })}
                rows={2}
                placeholder="Copy it exactly, even if it reads like nonsense — that is the phrase the office recognises"
                className={`machine ${INPUT} leading-relaxed`}
              />
            </Field>

            <Field label="Which reason it was">
              <select
                value={input.reasonId}
                onChange={(e) => set({ reasonId: e.target.value })}
                className={INPUT}
              >
                <option value="">
                  I am not sure &mdash; give me the ones that always apply
                </option>
                {REJECTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </Field>

            <div className="border-t border-rule pt-4 flex items-start justify-between gap-4 flex-wrap">
              <p role="status" className="text-sm text-ink-soft leading-relaxed">
                {progress.missing.length === 0
                  ? "Everything filled. The letters below are ready to send."
                  : `${progress.filled} of ${progress.total} filled. Still worth adding: ${progress.missing.join(", ")}.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setInput({ ...EMPTY });
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch {
                    /* nothing to clear */
                  }
                }}
                className="press text-xs text-ink-faint hover:text-stamp underline underline-offset-4 shrink-0"
              >
                Clear what I typed
              </button>
            </div>
          </div>

          <p className="text-sm text-ink-faint leading-relaxed measure mt-4">
            This is kept in this browser so you do not have to type it again
            for the next letter. It is not sent anywhere, and there is no
            account here to send it to.
          </p>
        </section>

        {/* ---- The letters ---- */}
        <section>
          <div className="shell-reading">
            <h2 className="eyebrow section-mark mb-4">
              {templates.length} letters you can send
            </h2>
            <p className="text-ink-soft leading-relaxed measure mb-6">
              Ordered as the escalation uses them. Only one carries a deadline
              anybody has to keep, and it is marked.
            </p>
          </div>

          <ul className="space-y-4">
            {templates.map((t) => {
              const text = draft(input, t.id) ?? "";
              const showing = open === t.id;
              const statutory = t.id.startsWith("rti");

              return (
                <li
                  key={t.id}
                  className={`border rounded-xl overflow-hidden ${
                    statutory ? "border-2 border-stamp" : "border-rule-heavy"
                  }`}
                >
                  <div className="px-6 py-5 bg-paper-raised">
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                      <Tag kind={statutory ? "statutory" : "verified"} />
                      <span className="text-xs text-ink-faint">{t.channel}</span>
                    </div>
                    <h3 className="display-3 mb-2">{t.title}</h3>
                    <p className="leading-relaxed measure mb-3">{t.purpose}</p>
                    <p className="text-sm text-ink-soft leading-relaxed measure">
                      {t.standing}
                    </p>

                    <div className="flex gap-2 flex-wrap mt-5">
                      <button
                        type="button"
                        onClick={() => copy(t.id, text)}
                        className="btn btn-primary btn-sm"
                      >
                        {copied === t.id ? "Copied" : "Copy the letter"}
                      </button>
                      <button
                        type="button"
                        onClick={() => download(t.id, t.title, text)}
                        className="btn btn-secondary btn-sm"
                      >
                        Save as a file
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpen(showing ? null : t.id)}
                        aria-expanded={showing}
                        className="btn btn-secondary btn-sm"
                      >
                        {showing ? "Hide it" : "Read it first"}
                      </button>
                    </div>
                  </div>

                  {showing && (
                    <pre className="machine text-xs leading-relaxed whitespace-pre-wrap bg-paper border-t border-rule px-6 py-5 overflow-x-auto">
                      {text}
                    </pre>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---- The honest close ---- */}
        <section className="shell-reading">
          <Disclose
            label="What these are, and what they are not"
            className="border-l-4 border-rule-heavy bg-paper-inset/40 rounded-lg px-5 py-4"
          >
            <div className="text-sm text-ink-soft leading-relaxed measure space-y-3">
              <p>
                They are drafts. Nothing here files anything on your behalf, and
                nothing here is legal advice &mdash; a complicated case deserves
                a person rather than a template. Read each one before you send
                it, and fill in anything left in square brackets.
              </p>
              <p>
                The RTI application follows the language of the Act itself and
                asks for facts about your own file, which is what the Act is
                for. The others are ordinary letters, written to be hard to
                close without answering: they name the claim, fix the date, and
                ask for one specific thing rather than for help.
              </p>
              <p>
                Everything you typed stayed on this device. There is no account
                here, no server to receive it, and nothing was transmitted while
                you filled it in.
              </p>
            </div>
          </Disclose>

          <div className="mt-6 flex gap-2 flex-wrap">
            <Link href="/still-waiting/" className="btn btn-secondary btn-sm">
              Which of these applies yet
            </Link>
            <Link href="/what-it-costs/" className="btn btn-secondary btn-sm">
              What each one costs you
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

const INPUT =
  "w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none transition-colors focus:border-noting focus:ring-4 focus:ring-noting/12 rounded-md placeholder:text-ink-faint/60";

/* The label wraps the control, so the association needs no id and
   cannot fall out of step with one. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
