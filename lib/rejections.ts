import type { RejectionReason } from "./types";

/* ============================================================
   The rejection knowledge base.

   Each entry maps a remark EPFO actually renders to a member onto
   the mechanism underneath it — which desk raised it, whose action
   is required, and which records have to be compared to locate the
   fault. The remark strings are representative of remarks widely
   reported by members and reflected in EPFO grievance guidance.
   Nothing here is read from a live government system.
   ============================================================ */

export const REJECTIONS: RejectionReason[] = [
  {
    id: "name-mismatch",
    verbatim: [
      "Name in EPFO records not matching with Aadhaar",
      "Demographic discrepancy in EPFO portal",
      "Name differs in claim form and Aadhaar",
      "KYC mismatch",
    ],
    title: "Your name is spelled differently in two places",
    titleHi: "आपका नाम दो जगह अलग-अलग लिखा है",
    plain:
      "EPFO compared the name on your UAN with the name on your Aadhaar and found they are not identical. Not similar — identical. A middle name, an initial, an extra space or a different spelling is enough.",
    plainHi:
      "EPFO ने आपके UAN और Aadhaar का नाम मिलाया। दोनों बिल्कुल एक जैसे नहीं हैं। बीच का नाम, एक अक्षर, extra space या अलग spelling भी दावा रोक सकती है।",
    mechanism:
      "Since Aadhaar seeding became mandatory for online claims, the first desk runs an automated string comparison against the UIDAI demographic record. The comparison is exact, character for character. It does not report which character differed — it returns a single pass or fail, and the remark you receive is generated from that. This is why the message never tells you what to fix.",
    rejectedAt: "dealing-assistant",
    whoMustAct: "member",
    compare: [
      { left: "epfo", right: "aadhaar", field: "name" },
      { left: "epfo", right: "pan", field: "name" },
    ],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Decide which record is correct. Your Aadhaar name is usually the one to keep, because banks and PAN follow it.",
        instructionHi:
          "तय करें कि कौन सा रिकॉर्ड सही है। आमतौर पर आधार का नाम रखें, क्योंकि बैंक और PAN उसी का पालन करते हैं।",
        where: "Your own documents",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "File a Joint Declaration with your employer to correct the name held by EPFO. Name changes are made through the employer's login, not by a member alone.",
        instructionHi:
          "EPFO में दर्ज नाम सुधारने के लिए नियोक्ता के साथ संयुक्त घोषणा (Joint Declaration) दाखिल करें। नाम सुधार नियोक्ता के लॉगिन से होता है।",
        where: "Employer HR / EPFO Unified Member Portal",
        days: 3,
      },
      {
        actor: "employer",
        instruction:
          "Employer digitally signs the Joint Declaration and forwards it to the Regional Office with supporting Aadhaar proof.",
        instructionHi:
          "नियोक्ता संयुक्त घोषणा पर डिजिटल हस्ताक्षर कर आधार प्रमाण के साथ क्षेत्रीय कार्यालय भेजता है।",
        where: "Employer EPFO login",
        days: 7,
      },
      {
        actor: "epfo",
        instruction:
          "Regional Office approves the correction. Only after the correction shows on the member portal should the claim be refiled.",
        instructionHi:
          "क्षेत्रीय कार्यालय सुधार स्वीकृत करता है। सुधार पोर्टल पर दिखने के बाद ही दावा दोबारा दाखिल करें।",
        where: "EPFO Regional Office",
        days: 15,
      },
    ],
    escalation: ["epfigms", "cpgrams", "rti"],
    documents: ["joint-declaration", "employer-email", "epfigms", "rti-notesheet"],
    prevalence: "very-common",
    typicalDays: 26,
  },

  {
    id: "exit-date-missing",
    verbatim: [
      "Date of exit not updated by employer",
      "Date of exit not available",
      "Member is shown as in service",
    ],
    title: "Your old employer never marked you as having left",
    titleHi: "पुराने नियोक्ता ने आपके नौकरी छोड़ने की तारीख दर्ज नहीं की",
    plain:
      "EPFO's records still show you working at a company you have left. A final settlement cannot be paid to somebody who is, on paper, still employed. Your employer has to record your date of exit — and many simply never do.",
    plainHi:
      "EPFO के रिकॉर्ड में आप अब भी उस कंपनी में काम करते दिख रहे हैं जिसे आप छोड़ चुके हैं। कागज़ पर नौकरी में दिख रहे व्यक्ति का final settlement नहीं हो सकता। नियोक्ता को आपके नौकरी छोड़ने की तारीख दर्ज करनी होती है, लेकिन कई यह करते ही नहीं।",
    mechanism:
      "Date of exit is written by the employer in the monthly ECR filing. If the employer stops filing for you without marking an exit reason, your record simply goes quiet — it never flips to 'exited'. The system reads the absence of an exit date as continuing service. A member can now mark their own date of exit through the Unified Portal, but only after two months have passed since the last contribution, and many members are never told this exists.",
    rejectedAt: "section-supervisor",
    whoMustAct: "member",
    compare: [{ left: "epfo", right: "employer", field: "dateOfExit" }],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Check whether two months have passed since your last PF contribution. If yes, you can mark your own exit date without the employer.",
        instructionHi:
          "देखें कि आपके अंतिम PF अंशदान को दो महीने हो चुके हैं या नहीं। यदि हाँ, तो आप स्वयं निकास तिथि दर्ज कर सकते हैं।",
        where: "Unified Member Portal → Manage → Mark Exit",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "Mark the exit yourself using the Aadhaar OTP flow. Choose the correct reason — 'Cessation (Short Service)' is the usual one for resignation.",
        instructionHi:
          "आधार OTP के ज़रिये स्वयं निकास दर्ज करें। सही कारण चुनें — इस्तीफ़े के लिए आमतौर पर 'Cessation (Short Service)'।",
        where: "Unified Member Portal",
        days: 1,
      },
      {
        actor: "employer",
        instruction:
          "If under two months, or the self-service option is unavailable, write to the employer's PF contact asking them to update exit in the next ECR.",
        instructionHi:
          "यदि दो महीने नहीं हुए या विकल्प उपलब्ध नहीं है, तो नियोक्ता के PF प्रभारी को अगली ECR में निकास दर्ज करने के लिए लिखें।",
        where: "Employer HR / PF desk",
        days: 10,
      },
    ],
    escalation: ["employer-email", "epfigms", "cpgrams", "rti"],
    documents: ["employer-email", "epfigms", "cpgrams", "rti-notesheet"],
    prevalence: "very-common",
    typicalDays: 12,
  },

  {
    id: "bank-not-seeded",
    verbatim: [
      "Bank account not seeded with UAN",
      "Bank KYC not verified",
      "Bank account details incorrect",
    ],
    title: "Your bank account is not linked, or the name on it differs",
    titleHi: "आपका बैंक खाता जुड़ा नहीं है, या उस पर नाम अलग है",
    plain:
      "EPFO will only pay into an account whose holder name matches your EPFO name and which the employer has approved. A joint account, a maiden name, or an IFSC changed by a bank merger will all fail this check.",
    plainHi:
      "EPFO उसी खाते में पैसा भेजता है जिस पर आपका नाम EPFO रिकॉर्ड से मिले और जिसे नियोक्ता ने मंजूर किया हो। joint account, शादी से पहले का नाम या बैंक merger के बाद बदला IFSC इस जांच में अटक सकता है।",
    mechanism:
      "Bank seeding is a two-party action: the member enters the account, then the employer digitally approves it. Many rejections happen because the member completed their half and assumed it was done. Separately, bank mergers have silently invalidated large numbers of IFSC codes still sitting in EPFO records — the account is live, but the IFSC pointing at it no longer exists.",
    rejectedAt: "accounts-officer",
    whoMustAct: "member",
    compare: [
      { left: "epfo", right: "bank", field: "name" },
      { left: "epfo", right: "bank", field: "ifsc" },
    ],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Confirm your current IFSC with your bank — if your bank has merged since you opened the account, it has almost certainly changed.",
        instructionHi:
          "अपने बैंक से वर्तमान IFSC की पुष्टि करें — यदि खाता खोलने के बाद बैंक का विलय हुआ है, तो वह लगभग निश्चित रूप से बदल चुका है।",
        where: "Bank branch or passbook",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "Add the corrected account under KYC on the member portal and upload a legible passbook or cancelled cheque showing your printed name.",
        instructionHi:
          "सदस्य पोर्टल पर KYC में सही खाता जोड़ें और अपना छपा नाम दिखाती स्पष्ट पासबुक या रद्द चेक अपलोड करें।",
        where: "Unified Member Portal → KYC",
        days: 1,
      },
      {
        actor: "employer",
        instruction:
          "Employer must digitally approve the bank KYC. Until they do, it stays pending and every claim will fail the same check.",
        instructionHi:
          "नियोक्ता को बैंक KYC डिजिटल रूप से स्वीकृत करनी होगी। तब तक हर दावा इसी जाँच में विफल होगा।",
        where: "Employer EPFO login",
        days: 7,
      },
    ],
    escalation: ["employer-email", "epfigms", "cpgrams"],
    documents: ["employer-email", "epfigms", "cpgrams"],
    prevalence: "very-common",
    typicalDays: 9,
  },

  {
    id: "dob-mismatch",
    verbatim: [
      "Date of Birth mismatch with Aadhaar",
      "DOB not matching UIDAI records",
    ],
    title: "Your date of birth differs from Aadhaar",
    titleHi: "आपकी जन्मतिथि आधार से अलग है",
    plain:
      "The date of birth on your EPFO record and on your Aadhaar are not the same. This is extremely common for members whose first job recorded a school-certificate date while Aadhaar took a different one.",
    plainHi:
      "आपके EPFO रिकॉर्ड और Aadhaar में जन्मतिथि अलग है। ऐसा अक्सर तब होता है जब पहली नौकरी में स्कूल प्रमाणपत्र वाली तारीख दर्ज हुई हो और Aadhaar में दूसरी तारीख हो।",
    mechanism:
      "EPFO permits a date-of-birth correction only within a tolerance band, and the evidence it accepts is ranked — Aadhaar is not automatically the winner. Where the difference is large, the correction needs higher approval and materially more documentation, which is why some members are quietly stuck for months on what looks like a typo.",
    rejectedAt: "dealing-assistant",
    whoMustAct: "member",
    compare: [{ left: "epfo", right: "aadhaar", field: "dateOfBirth" }],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Measure the gap. A small difference is a routine Joint Declaration. A large one needs additional proof and Commissioner-level approval.",
        instructionHi:
          "अंतर मापें। छोटा अंतर सामान्य संयुक्त घोषणा है। बड़े अंतर पर अतिरिक्त प्रमाण और आयुक्त-स्तरीय स्वीकृति चाहिए।",
        where: "Compare both documents",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "File the Joint Declaration with the strongest available proof — a school leaving certificate or birth certificate ranks above Aadhaar for this specific correction.",
        instructionHi:
          "उपलब्ध सबसे मज़बूत प्रमाण के साथ संयुक्त घोषणा दाखिल करें — इस सुधार के लिए स्कूल प्रमाणपत्र या जन्म प्रमाणपत्र आधार से ऊपर माना जाता है।",
        where: "Employer HR → EPFO Regional Office",
        days: 5,
      },
      {
        actor: "employer",
        instruction:
          "Employer digitally signs the Joint Declaration and forwards it to the Regional Office. A member cannot file one alone — the form carries two signatures by design, so that neither party can alter a record on its own.",
        instructionHi:
          "नियोक्ता संयुक्त घोषणा पर डिजिटल हस्ताक्षर करके उसे क्षेत्रीय कार्यालय भेजता है। सदस्य अकेले यह फ़ॉर्म दाखिल नहीं कर सकता — इस पर दो हस्ताक्षर ज़रूरी हैं।",
        where: "Employer EPFO login",
        days: 7,
      },
      {
        actor: "epfo",
        instruction:
          "Regional Office approves the correction. Only once the corrected date shows on the member portal should the claim be refiled — refiling before that fails against the old record.",
        instructionHi:
          "क्षेत्रीय कार्यालय सुधार स्वीकृत करता है। सुधरी हुई तारीख़ पोर्टल पर दिखने के बाद ही दावा दोबारा दाखिल करें।",
        where: "EPFO Regional Office",
        days: 15,
      },
    ],
    escalation: ["epfigms", "cpgrams", "rti"],
    documents: ["joint-declaration", "employer-email", "epfigms", "rti-notesheet"],
    prevalence: "common",
    typicalDays: 30,
  },

  {
    id: "multiple-uan",
    verbatim: [
      "Multiple UAN allotted, previous service not transferred",
      "Previous PF account not transferred",
      "More than one UAN found against Aadhaar",
    ],
    title: "You have more than one UAN, and the money is split",
    titleHi: "आपके एक से अधिक UAN हैं, और पैसा बँटा हुआ है",
    plain:
      "A new employer created a fresh UAN for you instead of continuing the old one. Your service is now split across two numbers, and a final settlement cannot be computed until they are merged.",
    plainHi:
      "नए नियोक्ता ने पुराना UAN चलाने के बजाय नया बना दिया। आपकी सेवा दो नंबरों में बंट गई है। दोनों को जोड़े बिना final settlement का सही हिसाब नहीं बन सकता।",
    mechanism:
      "A UAN is meant to be permanent, but employers can and do generate a new one when the Aadhaar lookup at onboarding fails or is skipped. Because pension eligibility depends on total continuous service, a split UAN can silently cost a member their EPS qualification even after the PF corpus itself is paid out. This one is worth fixing carefully rather than quickly.",
    rejectedAt: "accounts-officer",
    whoMustAct: "member",
    compare: [{ left: "epfo", right: "aadhaar", field: "uan" }],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Identify every UAN issued against your Aadhaar and decide which to keep — normally the oldest, since it carries your earliest service.",
        instructionHi:
          "अपने आधार पर जारी सभी UAN पहचानें और तय करें कि कौन सा रखना है — आमतौर पर सबसे पुराना, क्योंकि उसमें आरंभिक सेवा दर्ज है।",
        where: "Unified Member Portal",
        days: 2,
      },
      {
        actor: "member",
        instruction:
          "File Form 13 online to transfer the old account into the retained UAN. Do this before refiling any withdrawal claim.",
        instructionHi:
          "पुराने खाते को बनाए रखे गए UAN में स्थानांतरित करने के लिए ऑनलाइन फॉर्म 13 दाखिल करें। कोई भी निकासी दावा दोबारा दाखिल करने से पहले यह करें।",
        where: "Unified Member Portal → One Member One EPF Account",
        days: 3,
      },
      {
        actor: "epfo",
        instruction:
          "EPFO merges the accounts and deactivates the duplicate UAN. Verify your full service history reappears before refiling.",
        instructionHi:
          "EPFO खाते मिलाकर डुप्लिकेट UAN निष्क्रिय करता है। दोबारा दाखिल करने से पहले पूरी सेवा अवधि दिखना सुनिश्चित करें।",
        where: "EPFO Regional Office",
        days: 20,
      },
    ],
    escalation: ["epfigms", "cpgrams", "rti"],
    documents: ["employer-email", "epfigms", "cpgrams", "rti-notesheet"],
    prevalence: "common",
    typicalDays: 25,
  },

  {
    id: "employer-kyc-pending",
    verbatim: [
      "KYC not approved by employer",
      "KYC pending at employer login",
      "Digital signature of employer not registered",
    ],
    title: "Your employer has not approved your KYC",
    titleHi: "नियोक्ता ने आपकी KYC मंजूर नहीं की",
    plain:
      "You completed your side of KYC. It is sitting unapproved in your employer's EPFO login. Nothing you do on your own portal will clear this — the action is entirely theirs.",
    plainHi:
      "आपने अपनी KYC पूरी कर दी है, लेकिन वह नियोक्ता के EPFO login में मंजूरी का इंतजार कर रही है। अपने portal पर कुछ बदलने से यह नहीं सुलझेगा। अब काम नियोक्ता को करना है।",
    mechanism:
      "Employer approval requires a registered Digital Signature Certificate or e-Sign. When a company's authorised signatory leaves and the certificate is not re-registered, every pending KYC in that establishment freezes at once. Members read it as a personal problem; it is usually an establishment-wide outage nobody has announced.",
    rejectedAt: "dealing-assistant",
    whoMustAct: "employer",
    compare: [{ left: "epfo", right: "employer", field: "name" }],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Write to the employer's PF contact naming the exact KYC item pending and the date you submitted it. Keep it in writing — you will need the trail.",
        instructionHi:
          "नियोक्ता के PF प्रभारी को लिखें, लंबित KYC मद और जमा करने की तिथि स्पष्ट रूप से बताएँ। लिखित रखें — आगे इसकी ज़रूरत पड़ेगी।",
        where: "Email to employer",
        days: 1,
      },
      {
        actor: "employer",
        instruction:
          "Employer approves the KYC using a registered digital signature or e-Sign. If their signatory has changed, they must re-register first.",
        instructionHi:
          "नियोक्ता पंजीकृत डिजिटल हस्ताक्षर या e-Sign से KYC स्वीकृत करे। यदि हस्ताक्षरकर्ता बदला है, तो पहले पुनः पंजीकरण करें।",
        where: "Employer EPFO login",
        days: 7,
      },
      {
        actor: "member",
        instruction:
          "If the employer does not act within a fortnight, escalate to EPFiGMS naming the establishment code. EPFO can compel an establishment; it cannot compel you.",
        instructionHi:
          "यदि नियोक्ता पंद्रह दिन में कार्रवाई न करे, तो प्रतिष्ठान कोड सहित EPFiGMS पर शिकायत करें। EPFO प्रतिष्ठान को बाध्य कर सकता है।",
        where: "EPFiGMS",
        days: 15,
      },
    ],
    escalation: ["employer-email", "epfigms", "cpgrams", "rti"],
    documents: ["employer-email", "epfigms", "cpgrams", "rti-notesheet"],
    prevalence: "very-common",
    typicalDays: 18,
  },

  {
    id: "pan-not-verified",
    verbatim: [
      "PAN not verified, TDS applicable at higher rate",
      "PAN not seeded against UAN",
    ],
    title: "Your PAN is unverified, so tax is being cut at the penalty rate",
    titleHi: "आपका PAN verify नहीं है, इसलिए ज्यादा TDS कट रहा है",
    plain:
      "If you withdraw before five years of service and your PAN is not verified with EPFO, tax is deducted at a much higher rate. Some claims are rejected outright; others are paid with a large and avoidable deduction.",
    plainHi:
      "पांच साल की सेवा पूरी होने से पहले निकासी पर, अगर PAN EPFO में verify नहीं है तो ज्यादा TDS कटता है। कुछ दावे रुक जाते हैं और कुछ में बड़ी कटौती के बाद पैसा मिलता है।",
    mechanism:
      "This is the rejection most worth catching before it is paid rather than after. Once tax is deducted at the unverified rate, the money is recoverable only by claiming a refund in your income tax return for that assessment year — the claim itself cannot be reopened to correct it. Verifying PAN first is far cheaper than reclaiming later.",
    rejectedAt: "accounts-officer",
    whoMustAct: "member",
    compare: [{ left: "epfo", right: "pan", field: "name" }],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Check that the name on your PAN matches your EPFO name exactly. PAN verification fails on the same string comparison that fails Aadhaar.",
        instructionHi:
          "जाँचें कि PAN का नाम EPFO के नाम से बिल्कुल मेल खाता है। PAN सत्यापन उसी तुलना पर विफल होता है जिस पर आधार।",
        where: "Unified Member Portal → KYC",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "If your total service is under five years and the amount exceeds the threshold, submit Form 15G (or 15H if you are a senior citizen) with the claim.",
        instructionHi:
          "यदि कुल सेवा पाँच वर्ष से कम है और राशि सीमा से अधिक है, तो दावे के साथ फॉर्म 15G (वरिष्ठ नागरिक हों तो 15H) जमा करें।",
        where: "Along with the claim form",
        days: 1,
      },
    ],
    escalation: ["epfigms"],
    documents: ["employer-email", "epfigms"],
    prevalence: "common",
    typicalDays: 7,
  },

  {
    id: "father-name-mismatch",
    verbatim: [
      "Father's name mismatch",
      "Relation name not matching records",
      "Father/Husband name discrepancy",
    ],
    title: "Your father's or husband's name differs across records",
    titleHi: "पिता या पति का नाम रिकॉर्ड में अलग है",
    plain:
      "EPFO holds a relation name from your first employment form. If it differs from Aadhaar — including where a married woman's record still carries her father's name — the claim fails.",
    plainHi:
      "EPFO में आपकी पहली नौकरी के समय पिता या पति का जो नाम दर्ज हुआ था, वह Aadhaar से अलग है। शादी के बाद भी रिकॉर्ड में पिता का नाम रह जाना भी इसी वजह से दावा रोक सकता है।",
    mechanism:
      "This field is usually filled once, by hand, by an HR clerk at a member's first job, and never looked at again for the rest of their working life. It disproportionately blocks married women, whose Aadhaar is commonly updated after marriage while the EPFO relation field is not.",
    rejectedAt: "dealing-assistant",
    whoMustAct: "member",
    compare: [{ left: "epfo", right: "aadhaar", field: "fatherName" }],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "File a Joint Declaration for the relation field. It is corrected through the same route as a name correction.",
        instructionHi:
          "संबंध-नाम के लिए संयुक्त घोषणा दाखिल करें। यह नाम सुधार वाले मार्ग से ही ठीक होता है।",
        where: "Employer HR → EPFO Regional Office",
        days: 5,
      },
      {
        actor: "employer",
        instruction:
          "Employer attests and forwards with Aadhaar proof of the correct relation name.",
        instructionHi:
          "नियोक्ता सही संबंध-नाम के आधार प्रमाण के साथ सत्यापित कर आगे भेजे।",
        where: "Employer EPFO login",
        days: 7,
      },
    ],
    escalation: ["epfigms", "cpgrams", "rti"],
    documents: ["joint-declaration", "employer-email", "epfigms", "rti-notesheet"],
    prevalence: "common",
    typicalDays: 24,
  },

  {
    id: "insufficient-service",
    verbatim: [
      "Member not eligible for final settlement, still in service",
      "Withdrawal not permissible, service period condition not met",
      "Claim not admissible",
    ],
    title: "You are not eligible for the type of withdrawal you asked for",
    titleHi: "जिस निकासी के लिए आपने आवेदन किया, वह अभी नहीं मिल सकती",
    plain:
      "The claim itself was wrong, not your documents. Each withdrawal type has its own conditions — a full settlement needs a period of unemployment, while an advance for a specific purpose has its own limits.",
    plainHi:
      "दिक्कत कागज़ों में नहीं, चुने हुए दावे में है। हर तरह की निकासी की अलग शर्त होती है। full settlement के लिए बेरोज़गारी की अवधि चाहिए, जबकि advance के अपने नियम हैं।",
    mechanism:
      "Members overwhelmingly file Form 19 (final settlement) when what they are actually entitled to right now is Form 31 (advance). The portal offers both without explaining the difference, so a member who is still employed files for full settlement, is rejected, and concludes their money is stuck — when a different form would have been paid.",
    rejectedAt: "assistant-commissioner",
    whoMustAct: "member",
    compare: [],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Establish which form matches your actual situation. Still employed means an advance under Form 31, not a settlement under Form 19.",
        instructionHi:
          "पहचानें कि आपकी वास्तविक स्थिति किस फॉर्म से मेल खाती है। अभी कार्यरत हैं तो फॉर्म 19 नहीं, फॉर्म 31 के तहत अग्रिम।",
        where: "Unified Member Portal → Claim",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "Refile under the correct form. This rejection needs no correspondence with anyone — refiling correctly is the entire fix.",
        instructionHi:
          "सही फॉर्म के तहत दोबारा दाखिल करें। इस अस्वीकृति में किसी पत्राचार की ज़रूरत नहीं — सही फॉर्म ही पूरा समाधान है।",
        where: "Unified Member Portal",
        days: 1,
      },
    ],
    escalation: ["epfigms"],
    documents: ["epfigms"],
    prevalence: "common",
    typicalDays: 2,
  },

  {
    id: "cheque-illegible",
    verbatim: [
      "Cheque/passbook image not legible",
      "Uploaded document not clear",
      "Scanned copy rejected",
    ],
    title: "The image you uploaded could not be read",
    titleHi: "आपकी अपलोड की हुई तस्वीर साफ नहीं थी",
    plain:
      "Your documents are fine. The photograph of them was rejected. The upload must clearly show your printed name, full account number and IFSC in a single frame.",
    plainHi:
      "आपके कागज़ ठीक हैं, लेकिन उनकी तस्वीर साफ नहीं थी। एक ही फोटो में बैंक का छपा हुआ नाम, पूरा account number और IFSC साफ दिखना चाहिए।",
    mechanism:
      "The upload is checked by a person, not a machine, and the file size ceiling pushes members to compress images until the digits blur. The most common failure is a handwritten name where the portal expects the bank's printed name — a cancelled cheque without a printed name is rejected however sharp the photograph.",
    rejectedAt: "dealing-assistant",
    whoMustAct: "member",
    compare: [],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Photograph the passbook's first page flat, in daylight, with no flash and no shadow across the digits.",
        instructionHi:
          "पासबुक का पहला पृष्ठ समतल रखकर दिन के उजाले में, बिना फ़्लैश और बिना छाया के फ़ोटो लें।",
        where: "Your phone camera",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "Confirm your name is printed by the bank, not written by hand. If your cheque has no printed name, use the passbook instead.",
        instructionHi:
          "सुनिश्चित करें कि नाम बैंक द्वारा छपा है, हाथ से लिखा नहीं। चेक पर छपा नाम न हो तो पासबुक का उपयोग करें।",
        where: "Bank passbook",
        days: 1,
      },
    ],
    escalation: ["epfigms"],
    documents: ["epfigms"],
    prevalence: "occasional",
    typicalDays: 3,
  },

  {
    id: "tds-declaration-missing",
    verbatim: [
      "Form 15G/15H not submitted",
      "TDS applicable — declaration not available",
      "Income tax declaration not received with claim",
    ],
    title: "Your tax declaration is missing, so TDS may be deducted",
    titleHi: "टैक्स घोषणा नहीं है, इसलिए TDS कट सकता है",
    plain:
      "Your withdrawal can attract TDS because your qualifying service is short and EPFO does not have a valid tax declaration. This usually changes the amount paid, not your basic right to withdraw. Check the exact portal remark before treating it as a full claim rejection.",
    plainHi:
      "आपकी सेवा अवधि कम है और EPFO के पास टैक्स घोषणा नहीं है, इसलिए निकासी पर TDS कट सकता है। आमतौर पर इससे मिलने वाली रकम बदलती है, आपका निकासी का हक नहीं। इसे पूरा दावा खारिज होना मानने से पहले पोर्टल की सही टिप्पणी देखें।",
    mechanism:
      "EPFO applies the income-tax rules to eligible early withdrawals. A valid Form 15G or Form 15H can stop TDS only where the member qualifies to make that declaration. The declaration cannot repair an unverified PAN or make an ineligible withdrawal eligible. Current tax forms and thresholds can change, so the member should use the declaration shown in the portal for the relevant financial year.",
    rejectedAt: "accounts-officer",
    whoMustAct: "member",
    compare: [{ left: "epfo", right: "pan", field: "name" }],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Check your total service, PAN status and the tax shown in the portal. Do not submit Form 15G or 15H unless you are eligible to make that declaration.",
        instructionHi:
          "कुल सेवा अवधि, PAN की स्थिति और पोर्टल पर दिख रहा टैक्स देखें। पात्र हुए बिना Form 15G या 15H जमा न करें।",
        where: "Unified Member Portal → KYC and claim details",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "If you qualify, submit the tax declaration requested for this financial year and keep its acknowledgement with the claim records.",
        instructionHi:
          "यदि आप पात्र हैं, तो इस वित्त वर्ष के लिए मांगी गई टैक्स घोषणा जमा करें और उसकी रसीद दावे के साथ रखें।",
        where: "Unified Member Portal / EPFO claim process",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "If tax has already been deducted correctly, claim any refund through your income-tax return instead of filing the same PF claim again.",
        instructionHi:
          "अगर सही तरीके से TDS कट चुका है, तो वही PF दावा फिर से भरने के बजाय आयकर रिटर्न में रिफंड मांगें।",
        where: "Income-tax return",
        days: 30,
      },
    ],
    escalation: ["epfigms", "cpgrams"],
    documents: ["epfigms", "cpgrams"],
    prevalence: "common",
    typicalDays: 3,
  },

  {
    id: "gender-mismatch",
    verbatim: [
      "Gender mismatch with Aadhaar",
      "Gender details in UAN not matching Aadhaar",
      "Demographic mismatch — gender",
    ],
    title: "The gender in your UAN does not match Aadhaar",
    titleHi: "UAN में दर्ज लिंग Aadhaar से अलग है",
    plain:
      "EPFO found different gender details in your UAN and Aadhaar. The Aadhaar check needs this field to match exactly, so the claim cannot clear until the record is corrected.",
    plainHi:
      "EPFO को आपके UAN और Aadhaar में लिंग की जानकारी अलग मिली है। Aadhaar जांच में यह जानकारी बिल्कुल एक जैसी होनी चाहिए, इसलिए सुधार होने तक दावा आगे नहीं बढ़ेगा।",
    mechanism:
      "EPFO's Aadhaar-seeding process matches name, date of birth and gender together. Where gender differs, the employer can send a Joint Declaration correction through the portal for EPFO approval. A member should correct the source record first if Aadhaar itself is wrong; changing the UAN to a wrong Aadhaar value only moves the problem.",
    rejectedAt: "dealing-assistant",
    whoMustAct: "member",
    compare: [{ left: "epfo", right: "aadhaar", field: "gender" }],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Check which record is correct. If Aadhaar is wrong, correct Aadhaar first; if Aadhaar is correct, ask the employer to correct the UAN entry.",
        instructionHi:
          "पहले देखें कि सही रिकॉर्ड कौन-सा है। Aadhaar गलत हो तो उसे पहले ठीक कराएं; Aadhaar सही हो तो नियोक्ता से UAN की जानकारी ठीक करवाएं।",
        where: "Aadhaar record and Unified Member Portal",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "File a Joint Declaration with the document that proves the correct demographic detail.",
        instructionHi:
          "सही जानकारी साबित करने वाले दस्तावेज़ के साथ Joint Declaration जमा करें।",
        where: "Employer HR / Unified Member Portal",
        days: 3,
      },
      {
        actor: "employer",
        instruction:
          "Employer submits the correction through the Joint Declaration function and follows up until EPFO approves it.",
        instructionHi:
          "नियोक्ता Joint Declaration से सुधार भेजे और EPFO की मंजूरी मिलने तक उसका पीछा करे।",
        where: "Employer EPFO login",
        days: 7,
      },
    ],
    escalation: ["employer-email", "epfigms", "cpgrams", "rti"],
    documents: ["joint-declaration", "employer-email", "epfigms", "cpgrams", "rti-notesheet"],
    prevalence: "occasional",
    typicalDays: 21,
  },

  {
    id: "nomination-missing-death-claim",
    verbatim: [
      "Nomination not available",
      "E-nomination not registered",
      "Nominee details not available in UAN",
    ],
    title: "EPFO cannot find a valid nomination for this death claim",
    titleHi: "मृत्यु दावे के लिए EPFO को वैध नामांकन नहीं मिला",
    plain:
      "EPFO cannot use the online nominee route because it has no valid e-nomination on the member's file. This does not remove the family's entitlement. It means the family must use the physical claim route with proof of who is entitled to receive the money.",
    plainHi:
      "EPFO के रिकॉर्ड में वैध e-nomination नहीं है, इसलिए ऑनलाइन nominee वाला रास्ता नहीं खुल रहा। इससे परिवार का हक खत्म नहीं होता। परिवार को यह साबित करने वाले कागज़ों के साथ physical claim देना होगा कि रकम किसे मिलनी है।",
    mechanism:
      "An e-nomination is valid only after the member signs it with Aadhaar e-sign. EPFO uses that record to let a nominee make an online death claim. A nomination cannot be added or changed after the member dies, so the field office must instead examine the family, nominee or legal-heir documents submitted with the physical claim.",
    rejectedAt: "section-supervisor",
    whoMustAct: "member",
    compare: [],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Check whether the member left a signed e-nomination. A saved draft without Aadhaar e-sign is not a valid nomination.",
        instructionHi:
          "देखें कि सदस्य ने Aadhaar e-sign किया हुआ e-nomination छोड़ा है या नहीं। सिर्फ save किया हुआ draft वैध नामांकन नहीं है।",
        where: "EPFO member record / family documents",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "File the applicable physical death-claim forms with the death certificate, identity proof, bank details and proof of relationship or legal-heir status.",
        instructionHi:
          "लागू physical death-claim form के साथ मृत्यु प्रमाणपत्र, पहचान पत्र, बैंक विवरण और रिश्ते या legal heir होने का प्रमाण जमा करें।",
        where: "Employer HR or EPFO Regional Office",
        days: 3,
      },
      {
        actor: "employer",
        instruction:
          "Employer certifies the service details where required and forwards the complete death-claim papers without waiting for a nomination that cannot now be created.",
        instructionHi:
          "जहां जरूरी हो, नियोक्ता सेवा विवरण की पुष्टि करे और अब बन न सकने वाले नामांकन का इंतजार किए बिना पूरे death-claim papers भेजे।",
        where: "Employer HR / EPFO Regional Office",
        days: 7,
      },
      {
        actor: "epfo",
        instruction:
          "EPFO verifies the claimant's entitlement and settles the PF, pension and insurance parts that apply.",
        instructionHi:
          "EPFO दावेदार का हक जांचे और जो PF, pension और insurance रकम लागू हो उसका निपटारा करे।",
        where: "EPFO Regional Office",
        days: 20,
      },
    ],
    escalation: ["employer-email", "epfigms", "cpgrams", "rti"],
    documents: ["employer-email", "epfigms", "cpgrams", "rti-notesheet"],
    prevalence: "occasional",
    typicalDays: 30,
  },

  {
    id: "eps-under-ten-years",
    verbatim: [
      "Pension claim not admissible — eligible service less than 10 years",
      "Member not eligible for monthly pension",
      "Form 10D rejected — service less than 10 years",
    ],
    title: "You do not yet have ten years of eligible EPS service",
    titleHi: "आपकी EPS की पात्र सेवा अभी दस साल नहीं हुई है",
    plain:
      "A monthly EPS-95 pension needs at least ten years of eligible service. This is not a document mistake. If all your service is counted and remains below ten years, use the withdrawal-benefit or service-certificate route that applies to your age and situation instead of refiling Form 10D.",
    plainHi:
      "मासिक EPS-95 पेंशन के लिए कम से कम दस साल की पात्र सेवा चाहिए। यह कागज़ों की गलती नहीं है। सारी सेवा जोड़ने के बाद भी दस साल पूरे नहीं होते, तो Form 10D फिर से भरने के बजाय अपनी उम्र और स्थिति के हिसाब से withdrawal benefit या service certificate वाला रास्ता चुनें।",
    mechanism:
      "EPS eligibility is based on eligible service, including prior service that has been properly transferred or recognised. A member with less than ten years does not qualify for a monthly pension under Form 10D. The correct alternative depends on age and service history: a withdrawal benefit under Form 10C may be available, while a service certificate preserves service for a later pension claim.",
    rejectedAt: "accounts-officer",
    whoMustAct: "member",
    compare: [
      { left: "epfo", right: "employer", field: "dateOfJoining" },
      { left: "epfo", right: "employer", field: "dateOfExit" },
    ],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Count every period of EPS service, including earlier jobs. Check that transferred accounts and their dates appear in your current UAN.",
        instructionHi:
          "पहली नौकरी सहित EPS सेवा की हर अवधि गिनें। देखें कि transfer हुए पुराने खाते और उनकी तारीखें मौजूदा UAN में दिख रही हैं।",
        where: "Passbook and Unified Member Portal",
        days: 1,
      },
      {
        actor: "member",
        instruction:
          "Transfer any missing earlier account before choosing a pension form. It can change whether you reach ten years.",
        instructionHi:
          "पेंशन का फॉर्म चुनने से पहले कोई छूटा पुराना खाता transfer करें। इससे दस साल पूरे होने या न होने का नतीजा बदल सकता है।",
        where: "Unified Member Portal → One Member One EPF Account",
        days: 10,
      },
      {
        actor: "member",
        instruction:
          "If eligible service is still below ten years, file the applicable Form 10C withdrawal-benefit or service-certificate claim instead of Form 10D.",
        instructionHi:
          "अगर पात्र सेवा फिर भी दस साल से कम है, तो Form 10D की जगह लागू Form 10C withdrawal benefit या service certificate का दावा दें।",
        where: "Unified Member Portal → Claim",
        days: 1,
      },
    ],
    escalation: ["epfigms", "rti"],
    documents: ["epfigms", "rti-notesheet"],
    prevalence: "common",
    typicalDays: 12,
  },

  {
    id: "international-worker-coc",
    verbatim: [
      "International worker — Certificate of Coverage required",
      "Social Security Agreement benefit not available",
      "International worker details pending verification",
    ],
    title: "Your international-worker status needs a Certificate of Coverage check",
    titleHi: "International Worker की स्थिति के लिए Certificate of Coverage जांचना है",
    plain:
      "EPFO has treated you as an international worker. If you are covered by a social-security agreement, a valid Certificate of Coverage can decide whether you are exempt, whether service can be totalised, and which claim you can make. Do not use the ordinary withdrawal route until this is checked.",
    plainHi:
      "EPFO ने आपको International Worker माना है। अगर आपके देश के साथ social-security agreement है, तो valid Certificate of Coverage से तय होगा कि छूट मिलेगी या नहीं, सेवा जोड़ी जाएगी या नहीं और कौन-सा दावा बनता है। यह जांचे बिना सामान्य withdrawal वाला रास्ता न चुनें।",
    mechanism:
      "International-worker rules differ from the ordinary EPS route. A worker from a country with which India has a Social Security Agreement may use a Certificate of Coverage and totalisation of service, subject to the agreement. A worker from a country without such an agreement does not receive that totalisation and may face different pension and withdrawal rules. The employee starts the online request, the employer approves it with e-sign, and EPFO's field office processes the certificate.",
    rejectedAt: "assistant-commissioner",
    whoMustAct: "member",
    compare: [],
    fixSteps: [
      {
        actor: "member",
        instruction:
          "Confirm your nationality, the country of coverage and whether India has a Social Security Agreement with that country. Keep your passport and foreign social-security papers ready.",
        instructionHi:
          "अपनी nationality, coverage वाले देश और उस देश के साथ भारत का Social Security Agreement है या नहीं, यह पक्का करें। पासपोर्ट और foreign social-security papers तैयार रखें।",
        where: "International Workers Portal / employer HR",
        days: 2,
      },
      {
        actor: "member",
        instruction:
          "Apply for or upload the Certificate of Coverage through the international-worker process used for your agreement.",
        instructionHi:
          "अपने agreement के लिए लागू international-worker प्रक्रिया से Certificate of Coverage के लिए आवेदन करें या उसे अपलोड करें।",
        where: "EPFO International Workers Portal",
        days: 5,
      },
      {
        actor: "employer",
        instruction:
          "Employer verifies the employment details, e-signs the Certificate of Coverage application and sends it to the jurisdictional EPFO office.",
        instructionHi:
          "नियोक्ता नौकरी के विवरण की पुष्टि करे, Certificate of Coverage application पर e-sign करे और उसे संबंधित EPFO office भेजे।",
        where: "Employer EPFO login",
        days: 7,
      },
      {
        actor: "epfo",
        instruction:
          "EPFO records the certificate or explains the applicable international-worker rule before the claim is processed again.",
        instructionHi:
          "EPFO certificate दर्ज करे या दावा फिर से चलाने से पहले लागू International Worker नियम साफ बताए।",
        where: "EPFO Regional Office",
        days: 20,
      },
    ],
    escalation: ["employer-email", "epfigms", "cpgrams", "rti"],
    documents: ["employer-email", "epfigms", "cpgrams", "rti-notesheet"],
    prevalence: "occasional",
    typicalDays: 34,
  },
];

export const REJECTION_BY_ID = new Map(REJECTIONS.map((r) => [r.id, r]));

export function getRejection(id: string): RejectionReason | undefined {
  return REJECTION_BY_ID.get(id);
}
