/* ============================================================
   Domain model for an EPFO claim rejection.

   Vocabulary follows EPFO's own, deliberately: a member files a
   claim, it moves through desks, each desk records a noting, and
   the member is shown a single rejection remark. Naming it the way
   the institution names it keeps the mapping honest.
   ============================================================ */

/** The four desks a claim physically passes through inside a
 *  Regional Provident Fund office. Order is the routing order. */
export type Desk =
  | "dealing-assistant"
  | "section-supervisor"
  | "accounts-officer"
  | "assistant-commissioner";

export const DESK_ORDER: Desk[] = [
  "dealing-assistant",
  "section-supervisor",
  "accounts-officer",
  "assistant-commissioner",
];

export const DESK_LABEL: Record<Desk, { short: string; full: string }> = {
  "dealing-assistant": {
    short: "DA",
    full: "Dealing Assistant / Social Security Assistant",
  },
  "section-supervisor": { short: "SS", full: "Section Supervisor" },
  "accounts-officer": { short: "AO", full: "Accounts Officer" },
  "assistant-commissioner": {
    short: "APFC",
    full: "Assistant Provident Fund Commissioner",
  },
};

/** Who has to physically do something for the claim to move. This
 *  is the single most useful fact a rejected member never gets. */
export type Actor = "member" | "employer" | "epfo";

/** Records that must agree with one another before a claim clears. */
export type RecordSource = "epfo" | "aadhaar" | "pan" | "bank" | "employer";

export type FieldKey =
  | "name"
  | "fatherName"
  | "dateOfBirth"
  | "gender"
  | "accountNumber"
  | "ifsc"
  | "dateOfJoining"
  | "dateOfExit"
  | "uan";

export interface FieldValue {
  source: RecordSource;
  field: FieldKey;
  value: string;
  /** Whether EPFO has marked this source verified against the UAN. */
  verified?: boolean;
}

/** A single reconstructed line of internal noting. */
export interface NoteSheetEntry {
  desk: Desk;
  /** Days after filing that this desk acted. */
  dayOffset: number;
  /** What the officer recorded internally, in office register voice. */
  noting: string;
  /** Whether this action reset the service-standard clock. */
  resetsClock: boolean;
  action: "forwarded" | "returned-incomplete" | "rejected" | "settled";
}

/** How severely a field disagreement blocks a claim. */
export type MismatchSeverity = "blocking" | "probable" | "tolerated";

export interface FieldMismatch {
  field: FieldKey;
  left: FieldValue;
  right: FieldValue;
  severity: MismatchSeverity;
  /** Human explanation of why these two strings differ. */
  reason: string;
  /** Character-level segments for rendering the diff. */
  segments?: DiffSegment[];
}

export interface DiffSegment {
  text: string;
  state: "same" | "added" | "removed";
}

/** A statutory or administrative clock. The distinction between
 *  these two kinds is the core of what this product teaches. */
export interface Clock {
  id: string;
  label: string;
  /** "soft" = an internal service commitment with no legal remedy.
   *  "hard" = a statutory deadline with a named consequence. */
  kind: "soft" | "hard";
  days: number;
  authority: string;
  /** What actually happens when it lapses. Empty for soft clocks
   *  is itself the point. */
  consequence: string;
  resettable: boolean;
}

export interface EscalationStep {
  id: string;
  order: number;
  channel: string;
  actor: Actor;
  what: string;
  clock: Clock;
  /** Documents this product can draft for this step. */
  documents: string[];
}

export interface RejectionReason {
  id: string;
  /** Exact strings EPFO renders to members. Verbatim matters:
   *  matching on them is how a member finds their own case. */
  verbatim: string[];
  /** Short handle used in the UI. */
  title: string;
  titleHi: string;
  /** What the string is actually telling you. */
  plain: string;
  plainHi: string;
  /** The mechanism underneath — what went wrong in the file. */
  mechanism: string;
  rejectedAt: Desk;
  whoMustAct: Actor;
  /** Which record pairs to compare to locate the fault. */
  compare: Array<{ left: RecordSource; right: RecordSource; field: FieldKey }>;
  fixSteps: FixStep[];
  escalation: string[];
  documents: string[];
  /** Rough share of all rejections, for honest prioritisation. */
  prevalence: "very-common" | "common" | "occasional";
  /** Typical realistic resolution time when done correctly. */
  typicalDays: number;
}

export interface FixStep {
  actor: Actor;
  instruction: string;
  instructionHi: string;
  /** Where this is actually done. */
  where: string;
  /** Realistic elapsed days for this step alone. */
  days: number;
}

/** One month of contributions as it appears in the EPF passbook.
 *  The passbook is the single screen members actually visit, so it is
 *  also where a problem is usually visible long before a claim fails —
 *  contributions that simply stop, with no exit ever marked. */
export interface PassbookEntry {
  /** ISO year-month, e.g. "2026-02". */
  month: string;
  wages: number;
  employeeShare: number;
  employerShare: number;
  pensionShare: number;
}

export type ClaimStatus = "settled" | "rejected" | "under-process";

export interface Claim {
  id: string;
  /** "Form 19", "Form 31", "Form 10C". */
  form: string;
  /** Plain description: "Final settlement", "Advance — illness". */
  type: string;
  filedOn: string;
  amount: number;
  status: ClaimStatus;
  /** Verbatim remark shown to the member. Present when rejected. */
  remark?: string;
  /** Links into the rejection knowledge base. */
  rejectionId?: string;
  /** Reconstructed internal noting. Present when rejected. */
  noteSheet?: NoteSheetEntry[];
  settledOn?: string;
}

export interface Member {
  uan: string;
  name: string;
  employer: string;
  establishmentCode: string;
  dateOfJoining: string;
  /** Present only where the employer actually recorded it. Its absence
   *  is a real condition, not missing test data. */
  dateOfExit?: string;
  balance: {
    employeeShare: number;
    employerShare: number;
    pensionShare: number;
  };
  records: FieldValue[];
  passbook: PassbookEntry[];
  claims: Claim[];
}

/** Provenance is a first-class product concept, not a footnote.
 *  Every fact shown carries one of these. */
export type Provenance = "verified" | "reconstructed" | "mock" | "statutory";
