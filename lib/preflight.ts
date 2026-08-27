import type { FieldKey, Member, RecordSource } from "./types";
import { classifyMismatch } from "./diff";

/* ============================================================
   The pre-flight check.

   Every rejection in the knowledge base is something a member could
   have been told before they filed rather than six weeks after. The
   checks below are the same comparisons the office runs, executed
   against the member's own record in advance.

   This is the loop the real portal leaves open: it knows all of this
   at the moment you press submit, and says nothing until the claim
   has already failed.
   ============================================================ */

export type ClaimForm = "19" | "31" | "10C";

export const CLAIM_FORMS: Record<
  ClaimForm,
  { label: string; name: string; needsExit: boolean; blurb: string }
> = {
  "19": {
    label: "Form 19",
    name: "Final settlement",
    needsExit: true,
    blurb:
      "Withdraw your entire provident fund. Available once you have left employment and the required period has passed.",
  },
  "31": {
    label: "Form 31",
    name: "Advance",
    needsExit: false,
    blurb:
      "Take part of your fund for a specific purpose — illness, housing, education or marriage — while still employed.",
  },
  "10C": {
    label: "Form 10C",
    name: "Pension withdrawal benefit",
    needsExit: true,
    blurb:
      "Withdraw your pension contribution where your qualifying service is under ten years.",
  },
};

export type CheckStatus = "pass" | "fail" | "warn";

export interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  /** The rejection this would produce if filed as-is. */
  rejectionId?: string;
  /** Where in this portal the member fixes it. */
  fixPath?: string;
  fixLabel?: string;
}

function value(
  member: Member,
  source: RecordSource,
  field: FieldKey
): string | undefined {
  return member.records.find((r) => r.source === source && r.field === field)
    ?.value;
}

function compare(
  member: Member,
  field: FieldKey,
  right: RecordSource
): { status: CheckStatus; detail: string } | null {
  const a = value(member, "epfo", field);
  const b = value(member, right, field);
  if (a === undefined || b === undefined) return null;
  if (a === b) return { status: "pass", detail: "These match exactly." };

  const { severity, reason } = classifyMismatch(field, a, b);
  return {
    status: severity === "tolerated" ? "pass" : severity === "probable" ? "warn" : "fail",
    detail: reason,
  };
}

export function preflight(member: Member, form: ClaimForm): Check[] {
  const checks: Check[] = [];
  const spec = CLAIM_FORMS[form];

  /* --- Identity ---------------------------------------------------- */

  const name = compare(member, "name", "aadhaar");
  if (name) {
    checks.push({
      id: "name-aadhaar",
      label: "Your name matches Aadhaar",
      ...name,
      rejectionId: name.status === "pass" ? undefined : "name-mismatch",
      fixPath: "/correct",
      fixLabel: "Correct your details",
    });
  }

  const dob = compare(member, "dateOfBirth", "aadhaar");
  if (dob) {
    checks.push({
      id: "dob-aadhaar",
      label: "Your date of birth matches Aadhaar",
      ...dob,
      rejectionId: dob.status === "pass" ? undefined : "dob-mismatch",
      fixPath: "/correct",
      fixLabel: "Correct your details",
    });
  }

  const father = compare(member, "fatherName", "aadhaar");
  if (father) {
    checks.push({
      id: "father-aadhaar",
      label: "Your relation name matches Aadhaar",
      ...father,
      rejectionId: father.status === "pass" ? undefined : "father-name-mismatch",
      fixPath: "/correct",
      fixLabel: "Correct your details",
    });
  }

  /* --- Where the money goes ---------------------------------------- */

  const bankName = compare(member, "name", "bank");
  if (bankName) {
    checks.push({
      id: "bank-name",
      label: "Your bank account is in the same name",
      ...bankName,
      rejectionId: bankName.status === "pass" ? undefined : "bank-not-seeded",
      fixPath: "/records",
      fixLabel: "Check your records",
    });
  }

  const bankVerified = member.records.filter(
    (r) => r.source === "bank" && r.verified === false
  );
  checks.push(
    bankVerified.length === 0
      ? {
          id: "bank-verified",
          label: "Your bank account is approved by your employer",
          status: "pass",
          detail: "Approved. Payment can be released to this account.",
        }
      : {
          id: "bank-verified",
          label: "Your bank account is approved by your employer",
          status: "fail",
          detail:
            "Your bank details are waiting for approval in your employer's login. Nothing you do on your own account will clear this.",
          rejectionId: "employer-kyc-pending",
          fixPath: "/grievance",
          fixLabel: "Chase your employer",
        }
  );

  /* --- Employment status ------------------------------------------- */

  if (spec.needsExit) {
    checks.push(
      member.dateOfExit
        ? {
            id: "exit",
            label: "Your exit date is recorded",
            status: "pass",
            detail: `Recorded as ${new Date(member.dateOfExit).toLocaleDateString(
              "en-IN",
              { day: "numeric", month: "short", year: "numeric" }
            )}.`,
          }
        : {
            id: "exit",
            label: "Your exit date is recorded",
            status: "fail",
            detail:
              "No exit date is on your record, so EPFO still shows you in service. A final settlement cannot be paid to somebody who is, on paper, still employed.",
            rejectionId: "exit-date-missing",
            fixPath: "/exit",
            fixLabel: "Mark your exit",
          }
    );
  } else if (member.dateOfExit) {
    checks.push({
      id: "in-service",
      label: "You are eligible for an advance",
      status: "warn",
      detail:
        "Your record shows you have left this employer. An advance is meant for members still in service — a final settlement may be the correct form instead.",
      rejectionId: "insufficient-service",
    });
  }

  /* --- Tax ---------------------------------------------------------- */

  const serviceYears = member.passbook.length / 12;
  const panVerified = member.records.some(
    (r) => r.source === "pan" && r.verified
  );
  if (serviceYears < 5) {
    checks.push({
      id: "pan",
      label: "Your PAN is verified",
      status: panVerified ? "pass" : "warn",
      detail: panVerified
        ? "Verified. Tax will be deducted at the normal rate if it applies at all."
        : `Your service is about ${serviceYears.toFixed(1)} years, which is under five. Without a verified PAN, tax is deducted at a much higher rate and can only be recovered later through your income tax return.`,
      rejectionId: panVerified ? undefined : "pan-not-verified",
      fixPath: "/records",
      fixLabel: "Check your records",
    });
  }

  return checks;
}

export function verdict(checks: Check[]): {
  status: "clear" | "warn" | "blocked";
  failed: number;
  warned: number;
} {
  const failed = checks.filter((c) => c.status === "fail").length;
  const warned = checks.filter((c) => c.status === "warn").length;
  return {
    status: failed > 0 ? "blocked" : warned > 0 ? "warn" : "clear",
    failed,
    warned,
  };
}
