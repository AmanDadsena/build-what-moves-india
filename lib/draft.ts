import { DOCUMENTS, type DocumentSubject, type DocumentClaim } from "./documents";
import { REJECTIONS, getRejection } from "./rejections";

/* ============================================================
   Drafting a letter for the person actually reading the page.

   Every public rejection page ends by listing what this site can
   draft — the letter to the employer, the grievance, and the RTI
   application that is the only instrument in the whole process with
   a deadline anybody has to keep. Underneath that list was a button
   reading "Open the case tools", which went to a sign-in page
   offering three fictional members.

   So the member who arrived from a search engine holding a real
   rejection could read what had gone wrong, be told the RTI existed,
   and then either sign in as Rajesh Kumar and receive Rajesh Kumar's
   application — with his UAN and his claim number in it — or leave
   with nothing. The most useful thing on the site was reachable only
   by pretending to be somebody else.

   This closes that. It is the same six templates, filled from eight
   fields a member can read off the message that rejected them.

   ------------------------------------------------------------
   Three decisions

   Nothing is required. A form that refuses to produce anything until
   every box is filled would be abandoned by the member who cannot
   remember the exact amount, and a draft with one blank in it is
   still a draft — every template already writes unknowable things as
   [bracketed prompts] for the address and the phone number, so a
   missing field simply becomes one more of those. The letter tells
   the member what to fill in, which is more use than a form that
   tells them what they have not filled in yet.

   Nothing leaves the device. The fields are a name, a UAN and a
   claim, which is more identifying than anything else this site
   holds, and the answer is the same as everywhere else here: it
   lives in one browser, there is no server, and the page says so
   next to the boxes rather than in a policy nobody opens.

   And it is typed once. Somebody who needs the grievance usually
   needs the RTI four weeks later, and asking for the same eight
   fields twice is how a person decides the second one is not worth
   it.
   ============================================================ */

export interface DraftInput {
  name: string;
  uan: string;
  employer: string;
  form: string;
  type: string;
  filedOn: string;
  amount: string;
  remark: string;
  /** Which of the fifteen reasons this was. Drives the templates
   *  that name the fields to be corrected. */
  reasonId: string;
}

export const EMPTY: DraftInput = {
  name: "",
  uan: "",
  employer: "",
  form: "Form 19",
  type: "Final settlement",
  filedOn: "",
  amount: "",
  remark: "",
  reasonId: "",
};

export const STORAGE_KEY = "rk-draft";

/* The forms a member files, with the plain description each carries
   in the letters. Kept here rather than imported from preflight so
   this page works without the portal's claim model. */
export const FORMS: Array<{ form: string; type: string }> = [
  { form: "Form 19", type: "Final settlement" },
  { form: "Form 31", type: "Advance" },
  { form: "Form 10C", type: "Pension withdrawal benefit" },
  { form: "Form 10D", type: "Monthly pension" },
  { form: "Form 13", type: "Transfer" },
];

/** A prompt the member can act on, in the same square brackets the
 *  templates already use for an address or a phone number. */
function orPrompt(value: string, prompt: string): string {
  const clean = value.trim();
  return clean.length > 0 ? clean : `[${prompt}]`;
}

/** Turns what somebody typed into the shape the templates read.
 *
 *  Deliberately total: any field may be blank, and a blank becomes a
 *  bracketed instruction rather than an empty space or the word
 *  "undefined" in the middle of an application to a public
 *  authority. */
export function toSubject(input: DraftInput): DocumentSubject {
  return {
    name: orPrompt(input.name, "your full name, as on your UAN"),
    uan: orPrompt(input.uan, "your 12-digit UAN"),
    employer: orPrompt(input.employer, "your employer's name"),
  };
}

export function toClaim(input: DraftInput): DocumentClaim {
  const amount = Number(String(input.amount).replace(/[^\d.]/g, ""));
  return {
    form: input.form || "[the form you filed]",
    type: input.type || "[what you claimed]",
    /* An unparseable or missing date has to stay a string the letter
       can print. fmtDate would turn it into "Invalid Date", which is
       worse in a submission to an officer than an obvious blank. */
    filedOn: isRealDate(input.filedOn) ? input.filedOn : "",
    amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
    remark: input.remark.trim() || undefined,
  };
}

export function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(iso + "T00:00:00");
  return !Number.isNaN(d.getTime());
}

/** Every template that applies to the chosen reason, in the order the
 *  escalation ladder uses them. Falls back to the two that apply
 *  whatever went wrong, so a member who cannot identify their reason
 *  still gets the grievance and the RTI. */
export function templatesFor(reasonId: string) {
  const reason = getRejection(reasonId);
  const ids = reason?.documents ?? ["epfigms", "rti-notesheet"];
  const wanted = new Set([...ids, "rti-notesheet"]);
  return DOCUMENTS.filter((d) => wanted.has(d.id));
}

/** Builds one letter. Returns null where the template does not apply
 *  to the chosen reason, rather than throwing into a render. */
export function draft(input: DraftInput, documentId: string): string | null {
  const template = DOCUMENTS.find((d) => d.id === documentId);
  if (!template) return null;

  /* The templates that name specific fields need a reason. Where the
     member has not chosen one, the first very-common reason stands in
     for its shape only — the letter still carries their own claim and
     their own remark, and the interface tells them to pick one. */
  const reason =
    getRejection(input.reasonId) ??
    REJECTIONS.find((r) => r.prevalence === "very-common") ??
    REJECTIONS[0];

  return template.build(toSubject(input), toClaim(input), reason);
}

/** How much of the eight is filled, so the page can say what is still
 *  worth adding without refusing to draft anything. */
export function completeness(input: DraftInput): {
  filled: number;
  total: number;
  missing: string[];
} {
  const fields: Array<[keyof DraftInput, string]> = [
    ["name", "your name"],
    ["uan", "your UAN"],
    ["employer", "your employer"],
    ["filedOn", "the date you filed"],
    ["amount", "the amount claimed"],
    ["remark", "the remark you were shown"],
    ["reasonId", "which reason it was"],
  ];
  const missing = fields
    .filter(([k]) => String(input[k] ?? "").trim().length === 0)
    .map(([, label]) => label);
  return { filled: fields.length - missing.length, total: fields.length, missing };
}

/* ------------------------------------------------------------------
   Storage. Same contract as everything else here: one browser, no
   server, and readable back by the case backup so a member who has
   filled this in does not lose it when they change phone.
   ------------------------------------------------------------------ */

export function parse(raw: string | null): DraftInput {
  if (!raw) return { ...EMPTY };
  try {
    const value = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return { ...EMPTY };
    const out = { ...EMPTY };
    for (const key of Object.keys(EMPTY) as Array<keyof DraftInput>) {
      const v = (value as Record<string, unknown>)[key];
      if (typeof v === "string") out[key] = v;
    }
    return out;
  } catch {
    return { ...EMPTY };
  }
}

export function serialise(input: DraftInput): string {
  return JSON.stringify(input);
}
