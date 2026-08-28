/* ============================================================
   Languages.

   A deliberate and stated limit runs through this file, so it is
   worth putting at the top rather than in a footnote.

   What is translated: the interface itself — navigation, buttons,
   the words a member needs to move around — and the fifteen rejection
   titles, which are the single most valuable strings in the product.
   Those are short, factual sentences of the "your name is spelled
   differently in two places" kind, and they are what somebody needs
   in order to recognise their own problem in a list.

   What is not: the long explanations, the statutory periods, the
   fix steps and the document drafts. Those stay in English and Hindi.

   That is not laziness, and it is the more useful decision. Those
   passages describe how a deadline works and what an officer is
   obliged to do, and I cannot verify a machine translation of them
   into Tamil or Bengali. A wrong sentence about a thirty-day
   statutory period, in a language nobody in the loop can check, is
   the exact harm this product exists to prevent — and it would be
   dressed in the authority of an interface that looks official.

   So the interface speaks eight languages, the recognition and the
   read-aloud follow the choice, and the detail says plainly which
   language it is in. A member can navigate in Bengali, find their
   rejection in Bengali, and then have the explanation read aloud in
   Hindi or English rather than be given a confident translation
   nobody has checked.

   The translated titles are also fed to the search index as aliases,
   so speaking a query in Kannada actually reaches the right page.
   That is the part that makes this more than decoration.
   ============================================================ */

export type LangCode =
  | "en"
  | "hi"
  | "bn"
  | "mr"
  | "ta"
  | "te"
  | "gu"
  | "kn";

export interface Language {
  code: LangCode;
  /** The language's own name, in its own script. */
  native: string;
  /** For the <html lang> attribute and the speech APIs. */
  tag: string;
  /** True where the long-form explanations exist in this language. */
  full: boolean;
}

export const LANGUAGES: Language[] = [
  { code: "en", native: "English", tag: "en-IN", full: true },
  { code: "hi", native: "हिंदी", tag: "hi-IN", full: true },
  { code: "bn", native: "বাংলা", tag: "bn-IN", full: false },
  { code: "mr", native: "मराठी", tag: "mr-IN", full: false },
  { code: "ta", native: "தமிழ்", tag: "ta-IN", full: false },
  { code: "te", native: "తెలుగు", tag: "te-IN", full: false },
  { code: "gu", native: "ગુજરાતી", tag: "gu-IN", full: false },
  { code: "kn", native: "ಕನ್ನಡ", tag: "kn-IN", full: false },
];

export const DEFAULT_LANG: LangCode = "en";

export function languageFor(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

/* ---------------- Interface strings ----------------
   Short, high-frequency, and checkable. These are the words that let
   somebody move around without reading English. */

type Dict = Record<LangCode, string>;

export const UI: Record<string, Dict> = {
  why: {
    en: "Why was it rejected?",
    hi: "दावा क्यों अस्वीकृत हुआ?",
    bn: "কেন বাতিল হল?",
    mr: "दावा का नाकारला?",
    ta: "ஏன் நிராகரிக்கப்பட்டது?",
    te: "ఎందుకు తిరస్కరించారు?",
    gu: "કેમ નામંજૂર થયું?",
    kn: "ಏಕೆ ತಿರಸ್ಕರಿಸಲಾಯಿತು?",
  },
  waiting: {
    en: "Still waiting",
    hi: "अब भी इंतज़ार",
    bn: "এখনও অপেক্ষায়",
    mr: "अजूनही प्रतीक्षेत",
    ta: "இன்னும் காத்திருப்பு",
    te: "ఇంకా ఎదురుచూపు",
    gu: "હજુ રાહ જોઈ રહ્યા છો",
    kn: "ಇನ್ನೂ ಕಾಯುತ್ತಿದ್ದೀರಾ",
  },
  services: {
    en: "All services A–Z",
    hi: "सभी सेवाएँ",
    bn: "সব পরিষেবা",
    mr: "सर्व सेवा",
    ta: "அனைத்து சேவைகள்",
    te: "అన్ని సేవలు",
    gu: "બધી સેવાઓ",
    kn: "ಎಲ್ಲಾ ಸೇವೆಗಳು",
  },
  help: {
    en: "Help & contact",
    hi: "सहायता और संपर्क",
    bn: "সহায়তা ও যোগাযোগ",
    mr: "मदत आणि संपर्क",
    ta: "உதவி மற்றும் தொடர்பு",
    te: "సహాయం మరియు సంప్రదింపు",
    gu: "મદદ અને સંપર્ક",
    kn: "ಸಹಾಯ ಮತ್ತು ಸಂಪರ್ಕ",
  },
  plain: {
    en: "Plain language",
    hi: "आसान भाषा",
    bn: "সহজ ভাষা",
    mr: "सोपी भाषा",
    ta: "எளிய மொழி",
    te: "సరళ భాష",
    gu: "સરળ ભાષા",
    kn: "ಸರಳ ಭಾಷೆ",
  },
  safety: {
    en: "Staying safe",
    hi: "धोखे से बचें",
    bn: "নিরাপদ থাকুন",
    mr: "फसवणुकीपासून सावध",
    ta: "பாதுகாப்பாக இருங்கள்",
    te: "సురక్షితంగా ఉండండి",
    gu: "સુરક્ષિત રહો",
    kn: "ಸುರಕ್ಷಿತವಾಗಿರಿ",
  },
  forms: {
    en: "Forms & downloads",
    hi: "फ़ॉर्म और डाउनलोड",
    bn: "ফর্ম ও ডাউনলোড",
    mr: "फॉर्म आणि डाउनलोड",
    ta: "படிவங்கள் மற்றும் பதிவிறக்கம்",
    te: "ఫారమ్‌లు మరియు డౌన్‌లోడ్",
    gu: "ફોર્મ અને ડાઉનલોડ",
    kn: "ಫಾರ್ಮ್‌ಗಳು ಮತ್ತು ಡೌನ್‌ಲೋಡ್",
  },
  about: {
    en: "About this build",
    hi: "इस साइट के बारे में",
    bn: "এই সাইট সম্পর্কে",
    mr: "या साइटविषयी",
    ta: "இந்த தளத்தைப் பற்றி",
    te: "ఈ సైట్ గురించి",
    gu: "આ સાઇટ વિશે",
    kn: "ಈ ತಾಣದ ಬಗ್ಗೆ",
  },
  search: {
    en: "Search",
    hi: "खोजें",
    bn: "খুঁজুন",
    mr: "शोधा",
    ta: "தேடு",
    te: "వెతకండి",
    gu: "શોધો",
    kn: "ಹುಡುಕಿ",
  },
  signIn: {
    en: "Sign in",
    hi: "साइन इन",
    bn: "সাইন ইন",
    mr: "साइन इन",
    ta: "உள்நுழை",
    te: "సైన్ ఇన్",
    gu: "સાઇન ઇન",
    kn: "ಸೈನ್ ಇನ್",
  },
  language: {
    en: "Language",
    hi: "भाषा",
    bn: "ভাষা",
    mr: "भाषा",
    ta: "மொழி",
    te: "భాష",
    gu: "ભાષા",
    kn: "ಭಾಷೆ",
  },
  partial: {
    en: "Menus and rejection reasons are in this language. The detailed explanations are in English and Hindi.",
    hi: "मेन्यू और अस्वीकृति के कारण इसी भाषा में हैं। विस्तृत जानकारी अंग्रेज़ी और हिंदी में है।",
    bn: "মেনু ও বাতিলের কারণ এই ভাষায়। বিস্তারিত ব্যাখ্যা ইংরেজি ও হিন্দিতে।",
    mr: "मेनू आणि नकाराची कारणे या भाषेत आहेत. सविस्तर माहिती इंग्रजी आणि हिंदीत आहे.",
    ta: "பட்டியல்களும் நிராகரிப்புக் காரணங்களும் இந்த மொழியில். விரிவான விளக்கம் ஆங்கிலம் மற்றும் இந்தியில்.",
    te: "మెనూలు మరియు తిరస్కరణ కారణాలు ఈ భాషలో ఉన్నాయి. వివరణ ఆంగ్లం మరియు హిందీలో ఉంది.",
    gu: "મેનુ અને નામંજૂરીનાં કારણો આ ભાષામાં છે. વિગતવાર સમજૂતી અંગ્રેજી અને હિન્દીમાં છે.",
    kn: "ಮೆನುಗಳು ಮತ್ತು ತಿರಸ್ಕಾರದ ಕಾರಣಗಳು ಈ ಭಾಷೆಯಲ್ಲಿವೆ. ವಿವರಣೆ ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಹಿಂದಿಯಲ್ಲಿದೆ.",
  },
};

export function t(key: string, lang: LangCode): string {
  return UI[key]?.[lang] ?? UI[key]?.en ?? key;
}

/* ---------------- Rejection titles ----------------
   The fifteen sentences somebody needs in order to recognise their
   own problem. Keyed by rejection id. */

export const REJECTION_TITLES: Record<string, Partial<Record<LangCode, string>>> = {
  "name-mismatch": {
    bn: "আপনার নাম দুই জায়গায় আলাদা ভাবে লেখা",
    mr: "तुमचे नाव दोन ठिकाणी वेगळे लिहिले आहे",
    ta: "உங்கள் பெயர் இரு இடங்களில் வெவ்வேறாக உள்ளது",
    te: "మీ పేరు రెండు చోట్ల వేరుగా ఉంది",
    gu: "તમારું નામ બે જગ્યાએ અલગ લખાયું છે",
    kn: "ನಿಮ್ಮ ಹೆಸರು ಎರಡು ಕಡೆ ಬೇರೆಯಾಗಿದೆ",
  },
  "exit-date-missing": {
    bn: "পুরনো নিয়োগকর্তা আপনার চাকরি ছাড়ার তারিখ নথিভুক্ত করেননি",
    mr: "जुन्या नियोक्त्याने तुमची नोकरी सोडल्याची नोंद केली नाही",
    ta: "பழைய முதலாளி நீங்கள் வெளியேறியதைப் பதிவு செய்யவில்லை",
    te: "పాత యజమాని మీరు ఉద్యోగం వదిలిన తేదీని నమోదు చేయలేదు",
    gu: "જૂના નોકરીદાતાએ તમારી નોકરી છોડ્યાની નોંધ કરી નથી",
    kn: "ಹಳೆಯ ಉದ್ಯೋಗದಾತರು ನೀವು ಕೆಲಸ ಬಿಟ್ಟ ದಿನಾಂಕ ದಾಖಲಿಸಿಲ್ಲ",
  },
  "bank-not-seeded": {
    bn: "আপনার ব্যাঙ্ক অ্যাকাউন্ট যুক্ত নেই, বা তাতে নাম আলাদা",
    mr: "तुमचे बँक खाते जोडलेले नाही, किंवा त्यावरील नाव वेगळे आहे",
    ta: "உங்கள் வங்கிக் கணக்கு இணைக்கப்படவில்லை, அல்லது பெயர் வேறாக உள்ளது",
    te: "మీ బ్యాంక్ ఖాతా అనుసంధానం కాలేదు, లేదా పేరు వేరుగా ఉంది",
    gu: "તમારું બેંક ખાતું જોડાયેલું નથી, અથવા તેમાં નામ અલગ છે",
    kn: "ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ಜೋಡಣೆಯಾಗಿಲ್ಲ, ಅಥವಾ ಹೆಸರು ಬೇರೆಯಾಗಿದೆ",
  },
  "dob-mismatch": {
    bn: "আপনার জন্মতারিখ আধারের থেকে আলাদা",
    mr: "तुमची जन्मतारीख आधारपेक्षा वेगळी आहे",
    ta: "உங்கள் பிறந்த தேதி ஆதாரிலிருந்து வேறுபடுகிறது",
    te: "మీ పుట్టిన తేదీ ఆధార్‌కు భిన్నంగా ఉంది",
    gu: "તમારી જન્મતારીખ આધારથી અલગ છે",
    kn: "ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕ ಆಧಾರ್‌ಗಿಂತ ಭಿನ್ನವಾಗಿದೆ",
  },
  "multiple-uan": {
    bn: "আপনার একাধিক UAN আছে, টাকা ভাগ হয়ে আছে",
    mr: "तुमचे एकापेक्षा जास्त UAN आहेत, पैसे विभागले आहेत",
    ta: "உங்களுக்கு ஒன்றுக்கு மேற்பட்ட UAN உள்ளது, பணம் பிரிந்துள்ளது",
    te: "మీకు ఒకటికి మించి UAN ఉంది, డబ్బు విడిపోయింది",
    gu: "તમારા એકથી વધુ UAN છે, પૈસા વહેંચાયેલા છે",
    kn: "ನಿಮಗೆ ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು UAN ಇದೆ, ಹಣ ಹಂಚಿಹೋಗಿದೆ",
  },
  "employer-kyc-pending": {
    bn: "আপনার নিয়োগকর্তা KYC অনুমোদন করেননি",
    mr: "तुमच्या नियोक्त्याने KYC मंजूर केलेले नाही",
    ta: "உங்கள் முதலாளி KYC ஐ அங்கீகரிக்கவில்லை",
    te: "మీ యజమాని KYC ఆమోదించలేదు",
    gu: "તમારા નોકરીદાતાએ KYC મંજૂર કર્યું નથી",
    kn: "ನಿಮ್ಮ ಉದ್ಯೋಗದಾತರು KYC ಅನುಮೋದಿಸಿಲ್ಲ",
  },
  "pan-not-verified": {
    bn: "আপনার PAN যাচাই হয়নি, তাই বেশি হারে কর কাটা হচ্ছে",
    mr: "तुमचा PAN पडताळलेला नाही, त्यामुळे जास्त दराने कर कापला जात आहे",
    ta: "உங்கள் PAN சரிபார்க்கப்படவில்லை, அதனால் அதிக வரி பிடிக்கப்படுகிறது",
    te: "మీ PAN ధృవీకరించలేదు, అందుకే ఎక్కువ పన్ను కోత",
    gu: "તમારું PAN ચકાસાયું નથી, તેથી વધુ દરે કર કપાય છે",
    kn: "ನಿಮ್ಮ PAN ಪರಿಶೀಲಿಸಿಲ್ಲ, ಹಾಗಾಗಿ ಹೆಚ್ಚಿನ ದರದಲ್ಲಿ ತೆರಿಗೆ ಕಡಿತ",
  },
  "father-name-mismatch": {
    bn: "বাবার বা স্বামীর নাম নথিতে আলাদা",
    mr: "वडिलांचे किंवा पतीचे नाव नोंदींमध्ये वेगळे आहे",
    ta: "தந்தை அல்லது கணவரின் பெயர் பதிவுகளில் வேறுபடுகிறது",
    te: "తండ్రి లేదా భర్త పేరు రికార్డులలో వేరుగా ఉంది",
    gu: "પિતા કે પતિનું નામ રેકોર્ડમાં અલગ છે",
    kn: "ತಂದೆ ಅಥವಾ ಪತಿಯ ಹೆಸರು ದಾಖಲೆಗಳಲ್ಲಿ ಬೇರೆಯಾಗಿದೆ",
  },
  "insufficient-service": {
    bn: "আপনি যে ধরনের টাকা তোলার আবেদন করেছেন, তার যোগ্য নন",
    mr: "तुम्ही मागितलेल्या प्रकारच्या रकमेसाठी तुम्ही पात्र नाही",
    ta: "நீங்கள் கேட்ட வகையான பணம் எடுக்க தகுதி இல்லை",
    te: "మీరు కోరిన రకమైన ఉపసంహరణకు మీరు అర్హులు కాదు",
    gu: "તમે માંગેલા પ્રકારની ઉપાડ માટે તમે પાત્ર નથી",
    kn: "ನೀವು ಕೇಳಿದ ರೀತಿಯ ಹಿಂಪಡೆಯುವಿಕೆಗೆ ನೀವು ಅರ್ಹರಲ್ಲ",
  },
  "cheque-illegible": {
    bn: "আপনি যে ছবি দিয়েছেন তা পড়া যায়নি",
    mr: "तुम्ही अपलोड केलेली प्रतिमा वाचता आली नाही",
    ta: "நீங்கள் பதிவேற்றிய படத்தைப் படிக்க முடியவில்லை",
    te: "మీరు అప్‌లోడ్ చేసిన చిత్రం చదవలేకపోయాం",
    gu: "તમે અપલોડ કરેલી છબી વાંચી શકાઈ નથી",
    kn: "ನೀವು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಚಿತ್ರ ಓದಲಾಗಲಿಲ್ಲ",
  },
  "tds-declaration-missing": {
    bn: "আপনার কর ঘোষণা নেই, তাই TDS কাটা হতে পারে",
    mr: "तुमचे कर घोषणापत्र नाही, त्यामुळे TDS कापला जाऊ शकतो",
    ta: "உங்கள் வரி அறிவிப்பு இல்லை, எனவே TDS பிடிக்கப்படலாம்",
    te: "మీ పన్ను ప్రకటన లేదు, కాబట్టి TDS కోత పడవచ్చు",
    gu: "તમારું કર ઘોષણાપત્ર નથી, તેથી TDS કપાઈ શકે છે",
    kn: "ನಿಮ್ಮ ತೆರಿಗೆ ಘೋಷಣೆ ಇಲ್ಲ, ಹಾಗಾಗಿ TDS ಕಡಿತವಾಗಬಹುದು",
  },
  "gender-mismatch": {
    bn: "আপনার UAN-এ লিঙ্গ আধারের সঙ্গে মিলছে না",
    mr: "तुमच्या UAN मधील लिंग आधारशी जुळत नाही",
    ta: "உங்கள் UAN இல் உள்ள பாலினம் ஆதாருடன் பொருந்தவில்லை",
    te: "మీ UAN లోని లింగం ఆధార్‌తో సరిపోలడం లేదు",
    gu: "તમારા UAN માં લિંગ આધાર સાથે મેળ ખાતું નથી",
    kn: "ನಿಮ್ಮ UAN ನಲ್ಲಿನ ಲಿಂಗ ಆಧಾರ್‌ಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ",
  },
  "nomination-missing-death-claim": {
    bn: "এই মৃত্যু-দাবির জন্য বৈধ মনোনয়ন পাওয়া যায়নি",
    mr: "या मृत्यू-दाव्यासाठी वैध नामनिर्देशन सापडले नाही",
    ta: "இந்த இறப்புக் கோரிக்கைக்கு செல்லுபடியான வாரிசுப் பதிவு இல்லை",
    te: "ఈ మరణ దావాకు చెల్లుబాటు అయ్యే నామినేషన్ లేదు",
    gu: "આ મૃત્યુ-દાવા માટે માન્ય નામાંકન મળ્યું નથી",
    kn: "ಈ ಮರಣ ಕ್ಲೇಮ್‌ಗೆ ಮಾನ್ಯ ನಾಮನಿರ್ದೇಶನ ಸಿಗಲಿಲ್ಲ",
  },
  "eps-under-ten-years": {
    bn: "আপনার এখনও দশ বছরের যোগ্য EPS চাকরি হয়নি",
    mr: "तुमची अद्याप दहा वर्षांची पात्र EPS सेवा झालेली नाही",
    ta: "உங்களுக்கு இன்னும் பத்து ஆண்டு தகுதியான EPS சேவை இல்லை",
    te: "మీకు ఇంకా పది సంవత్సరాల అర్హత గల EPS సేవ లేదు",
    gu: "તમારી હજુ દસ વર્ષની પાત્ર EPS સેવા થઈ નથી",
    kn: "ನಿಮಗೆ ಇನ್ನೂ ಹತ್ತು ವರ್ಷಗಳ ಅರ್ಹ EPS ಸೇವೆ ಇಲ್ಲ",
  },
  "international-worker-coc": {
    bn: "আন্তর্জাতিক কর্মী হিসেবে আপনার Certificate of Coverage যাচাই দরকার",
    mr: "आंतरराष्ट्रीय कर्मचारी म्हणून तुमची Certificate of Coverage तपासणी आवश्यक आहे",
    ta: "சர்வதேச ஊழியர் என்ற முறையில் Certificate of Coverage சரிபார்ப்பு தேவை",
    te: "అంతర్జాతీయ ఉద్యోగిగా Certificate of Coverage తనిఖీ అవసరం",
    gu: "આંતરરાષ્ટ્રીય કર્મચારી તરીકે Certificate of Coverage ચકાસણી જરૂરી છે",
    kn: "ಅಂತಾರಾಷ್ಟ್ರೀಯ ಉದ್ಯೋಗಿಯಾಗಿ Certificate of Coverage ಪರಿಶೀಲನೆ ಅಗತ್ಯ",
  },
};

/** Every translated title for a rejection, for the search index. */
export function titleAliases(id: string): string[] {
  const entry = REJECTION_TITLES[id];
  return entry ? Object.values(entry).filter(Boolean) : [];
}
