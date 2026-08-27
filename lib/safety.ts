/* ============================================================
   Telling a real approach from a fraudulent one.

   A member whose claim has been stuck for four months is the single
   easiest person in India to defraud. They are already expecting
   contact about it, they have already been told things they did not
   understand, and they have been given no way to tell an official
   communication from an invented one. Somebody who calls and says the
   file needs a small payment to be released is describing exactly
   what the member's own experience has taught them to expect.

   So this product cannot decode rejections, draft escalations and
   then leave that door open. What follows is the test.

   A note on how this is written. Nothing here claims to speak for
   EPFO or to state EPFO policy. Every line is a structural fact about
   how a statutory body has to work — a password is a secret by
   definition, a statutory service has no price list, a decision made
   by an officer cannot be sold — which is what makes each one safe to
   rely on without a citation, and what makes the reasoning
   transferable to any other government service.
   ============================================================ */

export type Level = "fraud" | "warn" | "clear";

export interface Signal {
  id: string;
  question: string;
  questionHi: string;
  /** What answering yes actually tells you. */
  meaning: string;
  meaningHi: string;
  level: Level;
}

/* Ordered by how conclusive they are, because a member who reads only
   the first two should still get the two that matter most. */
export const SIGNALS: Signal[] = [
  {
    id: "password",
    question: "Did they ask for your UAN password, an OTP, or a bank PIN?",
    questionHi: "क्या उन्होंने आपका UAN पासवर्ड, OTP या बैंक PIN माँगा?",
    meaning:
      "This is conclusive. A password and an OTP exist so that the person holding them is the only one who can act. Anybody who needs yours is not verifying you — they are trying to become you. No office has any use for it, because every system they work in already trusts them.",
    meaningHi:
      "यह पक्का सबूत है। पासवर्ड और OTP इसीलिए होते हैं कि सिर्फ़ आप ही काम कर सकें। जिसे आपका पासवर्ड चाहिए, वह आपकी पहचान नहीं जाँच रहा — वह आपकी जगह लेना चाहता है। किसी दफ़्तर को इसकी ज़रूरत नहीं होती, क्योंकि उनकी अपनी पहुँच पहले से है।",
    level: "fraud",
  },
  {
    id: "fee",
    question: "Were you asked to pay to release, speed up or unblock the claim?",
    questionHi: "क्या दावा जल्दी कराने या छुड़ाने के लिए पैसे माँगे गए?",
    meaning:
      "This is conclusive. Settling a claim is a statutory duty, not a service being sold, so there is no price for doing it and no price for doing it faster. The only fee anywhere in this process is ₹10 for an RTI application, paid to the office and receipted.",
    meaningHi:
      "यह पक्का सबूत है। दावा निपटाना कानूनी ज़िम्मेदारी है, बिकने वाली सेवा नहीं। न इसका कोई दाम है, न जल्दी कराने का। इस पूरी प्रक्रिया में एक ही फ़ीस है — RTI आवेदन के ₹10, जो दफ़्तर में जमा होते हैं और जिसकी रसीद मिलती है।",
    level: "fraud",
  },
  {
    id: "link",
    question:
      "Did a message contain a link to a site asking for your UAN and password?",
    questionHi:
      "क्या किसी मैसेज में ऐसा लिंक था जो UAN और पासवर्ड माँग रहा था?",
    meaning:
      "Treat it as fraudulent. Sites that copy the member portal exactly are common and cheap to make, and a copy is indistinguishable from the original once you are looking at it. Reach the portal only by typing the address yourself or from an icon you saved.",
    meaningHi:
      "इसे फ़र्ज़ी मानें। मेंबर पोर्टल की हूबहू नकल बनाना आसान और सस्ता है, और एक बार खुल जाए तो नकल असली से अलग नहीं दिखती। पोर्टल पर सिर्फ़ खुद पता टाइप करके जाएँ, या अपने सहेजे हुए आइकॉन से।",
    level: "fraud",
  },
  {
    id: "urgent",
    question:
      "Were you told to act immediately or the money would be lost or lapse?",
    questionHi:
      "क्या कहा गया कि तुरंत नहीं किया तो पैसा चला जाएगा या लैप्स हो जाएगा?",
    meaning:
      "Treat it as fraudulent. Your provident fund does not lapse and cannot be forfeited for inaction. Urgency exists in these calls for one reason: to stop you checking. Nothing about your account needs to be settled in the next hour.",
    meaningHi:
      "इसे फ़र्ज़ी मानें। आपका भविष्य निधि न लैप्स होता है, न देर करने पर ज़ब्त होता है। ऐसी कॉल में जल्दबाज़ी सिर्फ़ एक वजह से डाली जाती है — ताकि आप जाँच न सकें। आपके खाते का कोई काम अगले एक घंटे में निपटाना ज़रूरी नहीं है।",
    level: "fraud",
  },
  {
    id: "agent",
    question:
      "Was it an agent offering to handle it for a share of the amount?",
    questionHi:
      "क्या कोई एजेंट रकम का हिस्सा लेकर काम कराने की बात कर रहा था?",
    meaning:
      "Not necessarily a fraud, but you are being charged for something free. Every form an agent files, you can file. Where a correction genuinely needs your employer's signature, an agent cannot obtain it any faster than you can — and anyone who says otherwise is describing a bribe, which leaves you exposed and them anonymous.",
    meaningHi:
      "ज़रूरी नहीं कि यह धोखा हो, पर आपसे उस काम के पैसे लिए जा रहे हैं जो मुफ़्त है। एजेंट जो भी फ़ॉर्म भरता है, वह आप भर सकते हैं। जहाँ सुधार के लिए सचमुच नियोक्ता के हस्ताक्षर चाहिए, वहाँ एजेंट भी उन्हें आपसे जल्दी नहीं ले सकता — और जो कहे कि ले सकता है, वह रिश्वत की बात कर रहा है।",
    level: "warn",
  },
  {
    id: "personal",
    question:
      "Did the number, email or account belong to a person rather than an office?",
    questionHi:
      "क्या नंबर, ईमेल या खाता किसी व्यक्ति का था, कार्यालय का नहीं?",
    meaning:
      "A warning sign on its own. Offices correspond as offices: a file number, a designation, an address. A matter that exists only in one person's phone is a matter with no record, and no record means nothing to escalate later.",
    meaningHi:
      "अपने आप में यह चेतावनी है। दफ़्तर दफ़्तर की तरह बात करते हैं — फ़ाइल नंबर, पदनाम, पता। जो मामला सिर्फ़ किसी एक व्यक्ति के फ़ोन में है, उसका कोई रिकॉर्ड नहीं होता, और रिकॉर्ड न हो तो आगे शिकायत भी नहीं की जा सकती।",
    level: "warn",
  },
  {
    id: "reference",
    question: "Could they give you a dated reference or file number?",
    questionHi: "क्या उन्होंने दिनांकित संदर्भ या फ़ाइल नंबर दिया?",
    meaning:
      "Being able to give one is a good sign, though not proof — check it in the portal yourself before acting on anything. Refusing to give one is close to conclusive: every genuine step in this process generates a number, and anybody who has taken a step can tell you what it is.",
    meaningHi:
      "नंबर दे देना अच्छा संकेत है, पर सबूत नहीं — कुछ भी करने से पहले उसे खुद पोर्टल पर जाँच लें। नंबर देने से इनकार करना लगभग पक्का संकेत है: इस प्रक्रिया का हर असली कदम एक नंबर बनाता है, और जिसने कदम उठाया है वह बता सकता है कि वह क्या है।",
    level: "clear",
  },
];

/** Things that are true of any statutory office, stated so a member
 *  can apply them to the next call as well as this one. */
export const NEVER: Array<{ claim: string; because: string }> = [
  {
    claim: "No office needs your password or your OTP.",
    because:
      "Their access does not come from your credentials. It comes from theirs.",
  },
  {
    claim: "Nobody can charge you to settle, speed up or unblock a claim.",
    because:
      "It is a duty owed to you under a scheme, not a service with a price.",
  },
  {
    claim: "Your provident fund does not expire and cannot lapse.",
    because:
      "There is no deadline on claiming your own money. Urgency is a technique.",
  },
  {
    claim: "A decision is never reversed over the phone.",
    because:
      "Every change passes a desk and leaves a written noting. If it is not on the file, it did not happen.",
  },
  {
    claim: "Nothing legitimate is settled through a personal bank account.",
    because:
      "Money moves to the account seeded against your own UAN, and nowhere else.",
  },
];

export interface Verdict {
  level: Level;
  title: string;
  body: string;
  /** Signals the member answered yes to, most conclusive first. */
  triggered: Signal[];
}

export function assess(answers: Record<string, boolean>): Verdict {
  const yes = SIGNALS.filter((s) => answers[s.id] === true);

  // "Could they give you a reference number?" reads the other way:
  // it is the absence that is a warning.
  const noReference = answers.reference === false;

  const fraud = yes.filter((s) => s.level === "fraud");
  const warn = yes.filter((s) => s.level === "warn");

  if (fraud.length > 0) {
    return {
      level: "fraud",
      title:
        fraud.length === 1
          ? "This is a fraud. Stop here."
          : "This is a fraud, on more than one count. Stop here.",
      body: "Do not send money, do not share anything further, and do not use any link you were sent. Nothing you have been told about your claim by this person is reliable. Check the position yourself, from the portal, and report the contact.",
      triggered: fraud,
    };
  }

  if (warn.length > 0 || noReference) {
    return {
      level: "warn",
      title: "Nothing here is proof of fraud, but do not act on it yet.",
      body: "Verify the position independently before doing anything they asked. If it is genuine, checking costs you a few minutes. If it is not, checking is the whole defence.",
      triggered: [
        ...warn,
        ...(noReference ? SIGNALS.filter((s) => s.id === "reference") : []),
      ],
    };
  }

  return {
    level: "clear",
    title: "Nothing you have described is a known warning sign.",
    body: "That is not the same as confirmed. Check the reference number in the portal yourself, and remember that a genuine office will still be there tomorrow if you want to think about it.",
    triggered: [],
  };
}
