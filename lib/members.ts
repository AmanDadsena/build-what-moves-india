import type { Member, PassbookEntry } from "./types";

/* ============================================================
   Mock member records.

   Everything here is invented. No real UAN, Aadhaar, PAN or bank
   account appears in this file, and nothing is read from any live
   government system. The identifiers are deliberately malformed so
   they cannot collide with anything real: UANs begin 99, and no
   Aadhaar or account number is stored at all.

   The passbooks are generated rather than typed out, using the
   actual EPF contribution rules, because the arithmetic is part of
   what a member checks: employee share is 12% of wages, the
   employer's 12% is split with 8.33% going to pension — capped at a
   wage ceiling of ₹15,000, which is why the pension column stops
   moving once wages pass it.
   ============================================================ */

export const MOCK_PASSWORD = "demo1234";

const EPS_WAGE_CEILING = 15_000;

function contributions(wages: number) {
  const employeeShare = Math.round(wages * 0.12);
  const pensionShare = Math.round(Math.min(wages, EPS_WAGE_CEILING) * 0.0833);
  const employerShare = Math.round(wages * 0.12) - pensionShare;
  return { employeeShare, employerShare, pensionShare };
}

/** Build a run of monthly entries, with an annual increment so the
 *  ledger reads like a career rather than a flat test fixture. */
function passbook(
  startMonth: string,
  endMonth: string,
  startingWages: number
): PassbookEntry[] {
  const out: PassbookEntry[] = [];
  const [sy, sm] = startMonth.split("-").map(Number);
  const [ey, em] = endMonth.split("-").map(Number);

  let wages = startingWages;
  let y = sy;
  let m = sm;

  while (y < ey || (y === ey && m <= em)) {
    // Increment each April, as most Indian payrolls do.
    if (m === 4 && !(y === sy && m === sm)) {
      wages = Math.round((wages * 1.08) / 100) * 100;
    }
    out.push({
      month: `${y}-${String(m).padStart(2, "0")}`,
      wages,
      ...contributions(wages),
    });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

function totals(entries: PassbookEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      employeeShare: acc.employeeShare + e.employeeShare,
      employerShare: acc.employerShare + e.employerShare,
      pensionShare: acc.pensionShare + e.pensionShare,
    }),
    { employeeShare: 0, employerShare: 0, pensionShare: 0 }
  );
}

/* ---------------- Rajesh Kumar — name mismatch ---------------- */

const rajeshBook = passbook("2021-04", "2026-03", 24_000);

/* ---------------- Priya Nair — exit never marked ----------------
   Her contributions simply stop after February 2026. The employer
   never filed an exit reason, so nothing in the record says she
   left — which is visible on the passbook months before the claim
   was ever rejected. */

const priyaBook = passbook("2023-06", "2026-02", 19_000);

/* ---------------- Mohammed Aslam — still in service ----------------

   His establishment stopped filing for three months in 2023 without
   stopping the deduction from his pay. Nothing on the member's side
   announces this: the passbook simply has no rows for those months,
   and an absent row is easy to read as nothing at all. */

const ASLAM_UNFILED = ["2023-04", "2023-05", "2023-06"];

const aslamBook = passbook("2019-08", "2026-07", 14_000).filter(
  (e) => !ASLAM_UNFILED.includes(e.month)
);

export const MEMBERS: Member[] = [
  {
    uan: "990012345678",
    name: "Rajesh Kumar",
    employer: "Meridian Logistics Pvt Ltd",
    establishmentCode: "MHBAN0043217000",
    dateOfJoining: "2021-04-05",
    dateOfExit: "2026-03-31",
    balance: totals(rajeshBook),
    passbook: rajeshBook,
    records: [
      { source: "epfo", field: "name", value: "RAJESH KUMAR", verified: true },
      { source: "aadhaar", field: "name", value: "RAJESH KUMAR SINGH", verified: true },
      { source: "pan", field: "name", value: "RAJESH KUMAR SINGH", verified: true },
      { source: "bank", field: "name", value: "RAJESH KUMAR SINGH", verified: true },
      { source: "epfo", field: "dateOfBirth", value: "14/03/1991", verified: true },
      { source: "aadhaar", field: "dateOfBirth", value: "14/03/1991", verified: true },
      { source: "epfo", field: "fatherName", value: "MOHAN SINGH", verified: true },
      { source: "aadhaar", field: "fatherName", value: "MOHAN SINGH", verified: true },
      { source: "bank", field: "ifsc", value: "HDFC0001234", verified: true },
      { source: "epfo", field: "ifsc", value: "HDFC0001234", verified: true },
    ],
    claims: [
      {
        id: "CLM26061101",
        form: "Form 19",
        type: "Final settlement",
        filedOn: "2026-06-11",
        amount: 187_430,
        status: "rejected",
        remark: "Claim rejected: Demographic discrepancy in EPFO portal",
        rejectionId: "name-mismatch",
        noteSheet: [
          {
            desk: "dealing-assistant",
            dayOffset: 3,
            noting:
              "Claim received under Form 19. Aadhaar demographic authentication run. Name field returned NO MATCH against UIDAI record. Claim not fit for further processing at this stage.",
            resetsClock: false,
            action: "forwarded",
          },
          {
            desk: "section-supervisor",
            dayOffset: 9,
            noting:
              "Seen. Member's name on UAN is short by one part as compared to Aadhaar. Member may be advised to file Joint Declaration through employer. Returned to DA for issue of deficiency memo.",
            resetsClock: true,
            action: "returned-incomplete",
          },
          {
            desk: "dealing-assistant",
            dayOffset: 21,
            noting:
              "Deficiency memo generated. System remark set to standard demographic discrepancy string. No reply received from member. Put up again.",
            resetsClock: true,
            action: "returned-incomplete",
          },
          {
            desk: "accounts-officer",
            dayOffset: 38,
            noting:
              "Ledger position verified, balance available. Payment cannot be released while demographic authentication is failing. No accounts objection otherwise.",
            resetsClock: false,
            action: "forwarded",
          },
          {
            desk: "assistant-commissioner",
            dayOffset: 44,
            noting:
              "Rejected on demographic mismatch. Member to be intimated through portal remark. Fresh claim may be filed after correction is approved.",
            resetsClock: false,
            action: "rejected",
          },
        ],
      },
      {
        id: "CLM24091802",
        form: "Form 31",
        type: "Advance — house purchase",
        filedOn: "2024-09-18",
        amount: 60_000,
        status: "settled",
        settledOn: "2024-10-04",
      },
    ],
  },

  {
    uan: "990087654321",
    name: "Priya Nair",
    employer: "Calicut Textiles Ltd",
    establishmentCode: "KRKCH0028841000",
    dateOfJoining: "2023-06-12",
    // Deliberately absent: the employer never marked an exit.
    balance: totals(priyaBook),
    passbook: priyaBook,
    records: [
      { source: "epfo", field: "name", value: "PRIYA NAIR", verified: true },
      { source: "aadhaar", field: "name", value: "PRIYA NAIR", verified: true },
      { source: "epfo", field: "dateOfExit", value: "", verified: false },
      { source: "employer", field: "dateOfExit", value: "28/02/2026", verified: false },
      { source: "bank", field: "name", value: "PRIYA NAIR", verified: true },
      { source: "epfo", field: "dateOfBirth", value: "09/11/1994", verified: true },
      { source: "aadhaar", field: "dateOfBirth", value: "09/11/1994", verified: true },
      { source: "bank", field: "ifsc", value: "SBIN0007391", verified: true },
      { source: "epfo", field: "ifsc", value: "SBIN0007391", verified: true },
    ],
    claims: [
      {
        id: "CLM26070201",
        form: "Form 19",
        type: "Final settlement",
        filedOn: "2026-07-02",
        amount: 94_260,
        status: "rejected",
        remark: "Claim rejected: Date of exit not updated by employer",
        rejectionId: "exit-date-missing",
        noteSheet: [
          {
            desk: "dealing-assistant",
            dayOffset: 4,
            noting:
              "Form 19 received. Member record shows continuing service. Last ECR contribution February 2026, no exit reason marked by establishment. Claim inadmissible while member is shown in service.",
            resetsClock: false,
            action: "forwarded",
          },
          {
            desk: "section-supervisor",
            dayOffset: 11,
            noting:
              "Establishment has stopped filing for this member without marking cessation. Letter to establishment may be issued. Meanwhile claim returned as incomplete.",
            resetsClock: true,
            action: "returned-incomplete",
          },
          {
            desk: "dealing-assistant",
            dayOffset: 26,
            noting:
              "No response from establishment to letter dated previous month. Member has not been advised of self-service exit marking facility. Put up for orders.",
            resetsClock: true,
            action: "returned-incomplete",
          },
          {
            desk: "assistant-commissioner",
            dayOffset: 33,
            noting:
              "Claim rejected for want of date of exit. Standard portal remark applied. Establishment to be pursued separately under compliance.",
            resetsClock: false,
            action: "rejected",
          },
        ],
      },
    ],
  },

  {
    uan: "990055512340",
    name: "Mohammed Aslam",
    employer: "Sunrise Facility Services",
    establishmentCode: "DLCPM0091162000",
    dateOfJoining: "2019-08-01",
    balance: totals(aslamBook),
    passbook: aslamBook,
    records: [
      { source: "epfo", field: "name", value: "MOHD ASLAM", verified: false },
      { source: "aadhaar", field: "name", value: "MOHAMMED ASLAM", verified: true },
      { source: "bank", field: "name", value: "MOHAMMED ASLAM", verified: false },
      { source: "employer", field: "name", value: "MOHD ASLAM", verified: false },
      { source: "epfo", field: "dateOfBirth", value: "02/08/1988", verified: true },
      { source: "aadhaar", field: "dateOfBirth", value: "02/08/1988", verified: true },
      { source: "bank", field: "ifsc", value: "PUNB0234500", verified: false },
      { source: "epfo", field: "ifsc", value: "PUNB0234500", verified: false },
    ],
    claims: [
      {
        id: "CLM26072101",
        form: "Form 31",
        type: "Advance — illness",
        filedOn: "2026-07-21",
        amount: 42_000,
        status: "rejected",
        remark: "Claim rejected: KYC not approved by employer",
        rejectionId: "employer-kyc-pending",
        noteSheet: [
          {
            desk: "dealing-assistant",
            dayOffset: 2,
            noting:
              "Form 31 received for medical advance. Bank KYC against this UAN is pending employer approval. Establishment digital signature appears to be unregistered since change of authorised signatory.",
            resetsClock: false,
            action: "forwarded",
          },
          {
            desk: "section-supervisor",
            dayOffset: 8,
            noting:
              "Multiple members of this establishment showing same pending status. Establishment-level issue, not member-level. Claim returned pending employer action.",
            resetsClock: true,
            action: "returned-incomplete",
          },
          {
            desk: "assistant-commissioner",
            dayOffset: 19,
            noting:
              "Rejected for want of approved KYC. Member advised through portal remark. Establishment to re-register signature.",
            resetsClock: false,
            action: "rejected",
          },
        ],
      },
      {
        id: "CLM22031403",
        form: "Form 31",
        type: "Advance — education",
        filedOn: "2022-03-14",
        amount: 35_000,
        status: "settled",
        settledOn: "2022-03-29",
      },
    ],
  },
];

export const MEMBER_BY_UAN = new Map(MEMBERS.map((m) => [m.uan, m]));

export function getMember(uan: string): Member | undefined {
  return MEMBER_BY_UAN.get(uan);
}

export function getClaim(uan: string, claimId: string) {
  return getMember(uan)?.claims.find((c) => c.id === claimId);
}

/** Total corpus, excluding pension, which is not withdrawable as a
 *  lump sum in the same way and is therefore shown separately. */
export function corpus(m: Member): number {
  return m.balance.employeeShare + m.balance.employerShare;
}
