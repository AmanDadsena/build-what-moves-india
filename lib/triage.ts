/* ============================================================
   Guided triage.

   The assistant answers questions. This one is for people who
   cannot phrase the question — which, on a provident fund portal,
   is most of them. Somebody whose money has not arrived does not
   know whether they have a KYC problem, an exit-date problem or no
   problem at all, so asking them to type a query is asking them to
   supply the answer first.

   A short branching path gets to the same place in three taps, and
   it is deterministic: the same answers always reach the same
   outcome, and every outcome is a screen that already exists.
   ============================================================ */

export interface TriageOption {
  label: string;
  labelHi: string;
  next: string;
}

export interface TriageQuestion {
  kind: "question";
  id: string;
  prompt: string;
  promptHi: string;
  options: TriageOption[];
}

export interface TriageOutcome {
  kind: "outcome";
  id: string;
  title: string;
  titleHi: string;
  body: string;
  /** Path under /portal/[uan] the member should go to next. */
  path?: string;
  actionLabel?: string;
  /** Where this outcome came from, shown for honesty. */
  basis: string;
}

export type TriageNode = TriageQuestion | TriageOutcome;

export const TRIAGE: Record<string, TriageNode> = {
  start: {
    kind: "question",
    id: "start",
    prompt: "What has happened?",
    promptHi: "क्या हुआ है?",
    options: [
      {
        label: "A claim I filed was rejected",
        labelHi: "मेरा दावा अस्वीकृत हो गया",
        next: "rejected-why",
      },
      {
        label: "I filed and nothing has happened",
        labelHi: "दाखिल किया, पर कुछ नहीं हुआ",
        next: "silent",
      },
      {
        label: "I want to withdraw but have not filed yet",
        labelHi: "निकालना है, अभी दाखिल नहीं किया",
        next: "still-working",
      },
      {
        label: "My employer has not done something",
        labelHi: "नियोक्ता ने कुछ नहीं किया",
        next: "employer",
      },
    ],
  },

  "rejected-why": {
    kind: "question",
    id: "rejected-why",
    prompt: "What did the rejection message mention?",
    promptHi: "अस्वीकृति संदेश में क्या लिखा था?",
    options: [
      {
        label: "A discrepancy, or my name not matching",
        labelHi: "विसंगति, या नाम मेल न खाना",
        next: "out-name",
      },
      {
        label: "Date of exit not updated",
        labelHi: "निकास तिथि दर्ज नहीं",
        next: "out-exit",
      },
      {
        label: "Bank account or KYC",
        labelHi: "बैंक खाता या KYC",
        next: "out-bank",
      },
      {
        label: "Something else, or I do not remember",
        labelHi: "कुछ और, या याद नहीं",
        next: "out-unknown",
      },
    ],
  },

  "still-working": {
    kind: "question",
    id: "still-working",
    prompt: "Are you still working at that company?",
    promptHi: "क्या आप अब भी उसी कंपनी में हैं?",
    options: [
      {
        label: "Yes, I am still employed there",
        labelHi: "हाँ, अभी कार्यरत हूँ",
        next: "out-advance",
      },
      {
        label: "No, I left more than two months ago",
        labelHi: "नहीं, दो महीने से अधिक हो गए",
        next: "out-settlement",
      },
      {
        label: "No, but I left recently",
        labelHi: "नहीं, हाल ही में छोड़ा है",
        next: "out-wait",
      },
    ],
  },

  /* ---------------- outcomes ---------------- */

  "out-name": {
    kind: "outcome",
    id: "out-name",
    title: "A record of yours does not match your Aadhaar",
    titleHi: "आपका कोई अभिलेख आधार से मेल नहीं खाता",
    body: "Almost always a name, date of birth or relation name differing by a word or a character. Check which one, then correct that single field — not all of them.",
    path: "/records",
    actionLabel: "See which field differs",
    basis: "Most common rejection category in the knowledge base",
  },

  "out-exit": {
    kind: "outcome",
    id: "out-exit",
    title: "Your employer never recorded that you left",
    titleHi: "नियोक्ता ने आपका निकास दर्ज नहीं किया",
    body: "On paper you are still employed, and a final settlement cannot be paid to somebody in service. You may be able to record the exit yourself without waiting for them.",
    path: "/exit",
    actionLabel: "Check if you can do it yourself",
    basis: "EPFO self-service exit marking",
  },

  "out-bank": {
    kind: "outcome",
    id: "out-bank",
    title: "Your bank details are unverified, or in a different name",
    titleHi: "बैंक विवरण असत्यापित है, या नाम अलग है",
    body: "Bank seeding needs two actions: yours, then your employer's approval. Many members complete their half and assume it is done.",
    path: "/records",
    actionLabel: "Check your verification status",
    basis: "EPFO KYC approval procedure",
  },

  "out-unknown": {
    kind: "outcome",
    id: "out-unknown",
    title: "Paste the exact wording and we will decode it",
    titleHi: "सटीक शब्द चिपकाएँ, हम उसका अर्थ बताएँगे",
    body: "The remark is on your claim status screen. Approximate wording is fine — we match against every remark we know.",
    path: "/claims",
    actionLabel: "Open your claims",
    basis: "Remark matcher",
  },

  silent: {
    kind: "outcome",
    id: "silent",
    title: "Waiting is not a step. Put it on record.",
    titleHi: "इंतज़ार कोई कदम नहीं है। इसे दर्ज कराएँ।",
    body: "The twenty-day settlement commitment restarts every time a desk marks your file incomplete, so waiting can continue indefinitely without anything being formally breached. Only one route obliges an answer.",
    path: "/grievance",
    actionLabel: "See what actually binds them",
    basis: "RTI Act 2005, section 7(1)",
  },

  employer: {
    kind: "outcome",
    id: "employer",
    title: "You cannot compel your employer, but EPFO can",
    titleHi: "आप नियोक्ता को बाध्य नहीं कर सकते, EPFO कर सकता है",
    body: "Ask in writing first and keep the reply — every later step is stronger for it. If nothing moves in a fortnight, raise it against the establishment code rather than against yourself.",
    path: "/grievance",
    actionLabel: "Draft the letter and the grievance",
    basis: "EPFO establishment compliance route",
  },

  "out-advance": {
    kind: "outcome",
    id: "out-advance",
    title: "You want Form 31, not Form 19",
    titleHi: "आपको फॉर्म 19 नहीं, फॉर्म 31 चाहिए",
    body: "While you are still employed, a final settlement is not admissible and will be rejected. An advance for a specific purpose is. Filing the wrong form is one of the most common avoidable rejections.",
    path: "/file",
    actionLabel: "File an advance, checked first",
    basis: "EPF Scheme withdrawal conditions",
  },

  "out-settlement": {
    kind: "outcome",
    id: "out-settlement",
    title: "You can file for final settlement",
    titleHi: "आप अंतिम भुगतान के लिए दाखिल कर सकते हैं",
    body: "Before you do, let us run your record against every known rejection cause. It takes a moment and saves the six weeks a rejection costs.",
    path: "/file",
    actionLabel: "Run the pre-flight check",
    basis: "Pre-flight against the rejection knowledge base",
  },

  "out-wait": {
    kind: "outcome",
    id: "out-wait",
    title: "A final settlement is not admissible yet",
    titleHi: "अंतिम भुगतान अभी स्वीकार्य नहीं है",
    body: "Two months must pass after your last contribution. Until then you can either wait, or take an advance if your reason qualifies. We can tell you the exact date you become eligible.",
    path: "/exit",
    actionLabel: "See your eligibility date",
    basis: "EPF Scheme unemployment condition",
  },
};

export const TRIAGE_START = "start";

export function isOutcome(node: TriageNode): node is TriageOutcome {
  return node.kind === "outcome";
}
