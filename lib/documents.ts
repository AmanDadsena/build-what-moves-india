import type { Claim, Member, RejectionReason } from "./types";

/* ============================================================
   The document pack.

   A rejected member is told to "contact the employer" or "raise a
   grievance" without being told what to write. Most people write
   something polite and vague, which is easy to close without doing
   anything. Each template here is built to be hard to close without
   answering: it names the claim, fixes the date, cites the provision
   it relies on, and asks for a specific thing rather than for help.

   The RTI application is the one that matters. It is the only
   document in this set that creates a legal obligation to answer,
   and what it asks for is the internal noting that produced the
   one-line remark the member was given.
   ============================================================ */

export interface DocumentTemplate {
  id: string;
  title: string;
  titleHi: string;
  /** Where this is filed or sent. */
  channel: string;
  /** One line on what this document is for. */
  purpose: string;
  /** What it costs and what it legally obliges, if anything. */
  standing: string;
  format: "letter" | "email" | "form" | "application";
  build: (m: Member, claim: Claim, r: RejectionReason) => string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const today = () =>
  new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

export const DOCUMENTS: DocumentTemplate[] = [
  {
    id: "employer-email",
    title: "Letter to your employer",
    titleHi: "नियोक्ता को पत्र",
    channel: "Email to the establishment's PF contact",
    purpose:
      "Asks your employer for the one action only they can take, in writing, with a date on it.",
    standing:
      "Creates no legal obligation. Its value is evidentiary: every later step is stronger if you can show you asked and when.",
    format: "email",
    build: (m, claim, r) => `Subject: PF claim ${claim.form} rejected — action required from establishment — UAN ${m.uan}

Dear Sir / Madam,

I was employed with ${m.employer} and my Universal Account Number is ${m.uan}.

On ${fmtDate(claim.filedOn)} I filed a claim under ${claim.form} (${claim.type}) for ${rupees(claim.amount)}. The claim has been rejected. The remark shown to me on the EPFO member portal is:

    "${claim.remark ?? "(no remark recorded)"}"

On examining my records, the reason appears to be the following:

    ${r.title}.

The action required to clear this lies with the establishment, not with me. Specifically, I request that you:

${r.fixSteps
  .filter((s) => s.actor === "employer")
  .map((s, i) => `    ${i + 1}. ${s.instruction}`)
  .join("\n") || "    1. Confirm in writing what remains pending at your end and by when it will be completed."}

I would be grateful if this could be completed within fifteen days of this letter. Please confirm by email once the action has been taken, so that I can refile the claim.

If it is not possible for the establishment to act, I would request a written reply saying so and stating the reason, so that I may take the matter up with the Regional Provident Fund Office directly.

Yours faithfully,

${m.name}
UAN: ${m.uan}
Date: ${today()}`,
  },

  {
    id: "joint-declaration",
    title: "Joint Declaration for record correction",
    titleHi: "अभिलेख सुधार हेतु संयुक्त घोषणा",
    channel: "Signed by you and your employer, filed with the Regional Office",
    purpose:
      "The prescribed route for correcting a name, date of birth or relation name held by EPFO.",
    standing:
      "Administrative. Must be signed by both member and employer, and is approved at the Regional Office.",
    format: "form",
    build: (m, claim, r) => `JOINT DECLARATION BY THE MEMBER AND THE EMPLOYER
FOR CORRECTION OF PARTICULARS IN EPFO RECORDS

To,
The Regional Provident Fund Commissioner
[Regional Office having jurisdiction over establishment]

Subject: Joint request for correction of member particulars — UAN ${m.uan}

We, the undersigned, jointly declare the following:

1.  MEMBER PARTICULARS

    Name of member (as currently in EPFO records) : ${m.name}
    Universal Account Number (UAN)                : ${m.uan}
    Name of establishment                         : ${m.employer}
    Establishment code                            : [as per employer records]

2.  PARTICULARS REQUIRING CORRECTION

    Field to be corrected : ${r.compare[0]?.field ?? "[field]"}

    As presently recorded with EPFO : [existing value]
    As it should correctly read     : [correct value]

3.  REASON FOR THE DISCREPANCY

    The particulars were recorded at the time of initial enrolment and
    do not match the member's Aadhaar record. No change of identity is
    involved; only the recorded particulars require correction.

4.  DOCUMENTS ENCLOSED IN SUPPORT

    (a) Self-attested copy of Aadhaar
    (b) Self-attested copy of PAN
    (c) Copy of appointment letter or service record, where available
    (d) [Any further document relied upon]

5.  DECLARATION

    We declare that the particulars given above are true to the best of
    our knowledge and belief, that no benefit has been claimed on the
    basis of the incorrect particulars, and that this declaration is
    made solely to bring EPFO records into agreement with the member's
    identity documents.


    ______________________              ______________________
    Signature of Member                 Signature and seal of
    ${m.name}                           Authorised Signatory
    UAN ${m.uan}                        ${m.employer}

    Date: ${today()}                    Date: ${today()}


NOTE FOR THE MEMBER — this declaration must be submitted through your
employer's EPFO login. A copy signed only by you will not be processed.`,
  },

  {
    id: "epfigms",
    title: "EPFiGMS grievance",
    titleHi: "EPFiGMS शिकायत",
    channel: "EPFO Internet Grievance Management System",
    purpose:
      "Registers the complaint inside EPFO and puts a dated reference number on it.",
    standing:
      "No enforceable deadline. A grievance can be closed with a reply that resolves nothing, and closure counts as disposal. File it anyway — the reference number is used by every step after this one.",
    format: "form",
    build: (m, claim) => `GRIEVANCE TEXT — paste into the description field on EPFiGMS

Grievance category : PF claim / Settlement
UAN                : ${m.uan}
Establishment      : ${m.employer}

DETAILS OF GRIEVANCE

I filed a claim under ${claim.form} (${claim.type}) on ${fmtDate(claim.filedOn)} for an amount of ${rupees(claim.amount)} against UAN ${m.uan}.

The claim was rejected. The only reason communicated to me on the member portal was:

    "${claim.remark ?? "(no remark recorded)"}"

This remark does not identify which particular, in which record, was found to be discrepant. Without that information I cannot correct the defect, and I am unable to refile the claim with any confidence that it will not be rejected again on the same ground.

I therefore request the following:

1.  That I be informed, in specific terms, of the exact field and the
    exact values which were compared and found not to match.

2.  That I be provided a copy of any deficiency memo issued in respect
    of this claim, together with the date on which it was dispatched to
    me and the mode of dispatch.

3.  That I be informed of the present status of the file and the
    designation of the officer with whom it currently rests.

4.  That the claim be reconsidered once the defect, once identified, has
    been corrected.

I have not received any communication other than the portal remark
reproduced above.

${m.name}
UAN ${m.uan}
Date: ${today()}`,
  },

  {
    id: "cpgrams",
    title: "CPGRAMS escalation",
    titleHi: "CPGRAMS पर शिकायत",
    channel: "Centralised Public Grievance Redress and Monitoring System",
    purpose:
      "Takes the matter above the Regional Office, to the Ministry of Labour and Employment.",
    standing:
      "Administrative target of about 21 days, with no penalty for breach. Attach your EPFiGMS reference so it cannot be treated as a fresh first complaint and routed back down.",
    format: "form",
    build: (m, claim) => `GRIEVANCE TEXT — CPGRAMS

Ministry / Department : Ministry of Labour and Employment
Subordinate office    : Employees' Provident Fund Organisation
Grievance type        : Delay / non-settlement of PF claim

DETAILS

1.  I am a member of the Employees' Provident Fund with UAN ${m.uan},
    formerly employed at ${m.employer}.

2.  I filed a claim under ${claim.form} on ${fmtDate(claim.filedOn)} for ${rupees(claim.amount)}.

3.  The claim was rejected with the single remark:

        "${claim.remark ?? "(no remark recorded)"}"

4.  I raised this with EPFO through EPFiGMS vide reference
    [insert your EPFiGMS registration number] dated [insert date].
    The response I received did not identify the specific particular
    that was found discrepant, and the grievance was closed without the
    defect being communicated to me in usable terms.

5.  The consequence is that a sum of ${rupees(claim.amount)} belonging to me
    remains unpaid, and I have not been given information sufficient to
    correct whatever defect is said to exist.

RELIEF SOUGHT

(a) That EPFO communicate to me the specific field and the specific
    values compared, in writing.

(b) That the claim be processed once that defect is corrected.

(c) That I be informed of the reason the defect was not communicated in
    specific terms at the time of rejection.

${m.name}
UAN ${m.uan}
Date: ${today()}`,
  },

  {
    id: "rti-notesheet",
    title: "RTI application for the note sheet",
    titleHi: "नोट शीट हेतु आरटीआई आवेदन",
    channel:
      "Central Public Information Officer, EPFO Regional Office concerned",
    purpose:
      "Compels EPFO to hand over the internal file noting on your own claim — the reason you were never shown.",
    standing:
      "Statutory. Section 7(1) of the Right to Information Act 2005 requires a reply within 30 days. Silence is a deemed refusal under section 7(2) and opens your right of appeal. Fee is ₹10; a person below the poverty line pays nothing.",
    format: "application",
    build: (m, claim) => `APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

To,
The Central Public Information Officer (CPIO)
Employees' Provident Fund Organisation
[Regional Office having jurisdiction over establishment code of ${m.employer}]

Applicant
Name        : ${m.name}
UAN         : ${m.uan}
Address     : [your full postal address]
Contact     : [your phone number and email]

Subject: Information sought regarding the processing and rejection of
         claim filed under ${claim.form} against UAN ${m.uan}

Sir / Madam,

I am a member of the Employees' Provident Fund. On ${fmtDate(claim.filedOn)} I filed
a claim under ${claim.form} (${claim.type}) for ${rupees(claim.amount)} against
UAN ${m.uan}. The claim was rejected and the only reason communicated to me was
the following portal remark:

    "${claim.remark ?? "(no remark recorded)"}"

Under section 6(1) of the Right to Information Act, 2005, I request the
following information:

1.  A complete and legible copy of the note sheet, order sheet and all
    internal noting recorded on the file relating to the above claim,
    from the date of its receipt to the date of its rejection.

2.  The name and designation of every official who dealt with the said
    file, together with the date on which the file was received by each
    of them and the date on which it was disposed of by each of them.

3.  The specific field or fields on which the verification is said to
    have failed, and the exact values which were compared against one
    another in arriving at that conclusion.

4.  A copy of every deficiency memo, letter or intimation issued to me
    in respect of this claim, together with the date of dispatch and the
    mode of dispatch of each.

5.  The number of days for which the said file remained pending at each
    level, and the reason recorded, if any, for any period of pendency
    exceeding the period stipulated in the Citizen's Charter.

6.  A certified copy of the order rejecting the claim, containing the
    reasons recorded in writing for the rejection.

7.  The number of claims rejected by this office during the financial
    year 2025-26 under the same category of remark as that reproduced
    above.

I am enclosing the prescribed application fee of ₹10 by way of
[Indian Postal Order / Demand Draft / court fee stamp] bearing number
[insert number] dated [insert date], drawn in favour of the Accounts
Officer, EPFO.

The information sought relates to my own case and to the manner in which
a decision affecting my own funds was arrived at. Should any part of the
information be considered exempt, I request that the remaining
information be furnished under section 10(1), together with the reasons
for severance.

Kindly note that under section 7(1) of the Act the information is
required to be furnished within thirty days of receipt of this
application.

Yours faithfully,

${m.name}
Date: ${today()}
Place: [your city]

Enclosures: Application fee of ₹10; copy of portal rejection remark.`,
  },

  {
    id: "rti-appeal",
    title: "First appeal — deemed refusal",
    titleHi: "प्रथम अपील — मानी गई अस्वीकृति",
    channel: "First Appellate Authority, EPFO Regional Office concerned",
    purpose:
      "Filed when the 30 days pass in silence. You do not have to ask again first — the silence is itself the ground.",
    standing:
      "Statutory, under section 19(1). The Appellate Authority must decide within 30 days, extendable to 45 with recorded reasons. Beyond that, a second appeal lies to the Central Information Commission, which may impose a penalty on the officer personally under section 20(1).",
    format: "application",
    build: (m, claim) => `FIRST APPEAL UNDER SECTION 19(1) OF THE RIGHT TO INFORMATION ACT, 2005

To,
The First Appellate Authority
Employees' Provident Fund Organisation
[Regional Office concerned]

Appellant
Name    : ${m.name}
UAN     : ${m.uan}
Address : [your full postal address]

Subject: Appeal against deemed refusal of information sought under
         application dated [date of your RTI application]

Sir / Madam,

1.  On [date of your RTI application] I filed an application under
    section 6(1) of the Right to Information Act, 2005, addressed to the
    Central Public Information Officer of this office, seeking
    information concerning the processing and rejection of my claim
    under ${claim.form} against UAN ${m.uan}.

2.  The application was accompanied by the prescribed fee of ₹10 and was
    delivered on [date of delivery], as evidenced by
    [speed post receipt number / acknowledgement].

3.  Under section 7(1) of the Act, the information was required to be
    furnished within thirty days of receipt, that is, on or before
    [thirtieth day].

4.  No reply of any kind has been received by me to date.

5.  Under section 7(2) of the Act, the failure of the Central Public
    Information Officer to give a decision within the period specified
    in section 7(1) is deemed to be a refusal of the request. It is
    against that deemed refusal that this appeal is preferred.

GROUNDS OF APPEAL

(a) The information sought relates to the appellant's own case and to
    the reasons for a decision directly affecting the appellant's own
    funds. It attracts no exemption under section 8.

(b) No part of the information was furnished, and no order of rejection
    disclosing any ground of exemption was passed. The refusal is
    therefore unreasoned.

(c) The appellant has been deprived of the only means available of
    ascertaining why the claim was rejected, the portal remark furnished
    being insufficient to identify the defect.

RELIEF SOUGHT

(i)   That the Central Public Information Officer be directed to furnish
      the information sought in full.

(ii)  That the information be furnished free of further charge, the
      prescribed period under section 7(1) having elapsed, as provided
      by section 7(6).

(iii) That such action as is considered appropriate be taken in respect
      of the failure to respond within the statutory period.

Yours faithfully,

${m.name}
UAN ${m.uan}
Date: ${today()}

Enclosures: Copy of the original RTI application; proof of dispatch and
delivery; copy of the portal rejection remark.`,
  },
];

export const DOCUMENT_BY_ID = new Map(DOCUMENTS.map((d) => [d.id, d]));

export function getDocument(id: string): DocumentTemplate | undefined {
  return DOCUMENT_BY_ID.get(id);
}
