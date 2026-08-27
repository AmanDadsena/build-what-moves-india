import { SERVICES } from "./services";

/* ============================================================
   The A–Z directory.

   Public-service sites are navigated by search, not by menu, and
   people search with the word they already have — "passbook",
   "name change", "Form 19", "my money", "PF nikalna". A directory
   keyed only to official service names fails all of those.

   So each entry carries aliases: the phrasings a member is likely to
   arrive with, including the transliterated Hindi ones. They are
   matched but never displayed, so the page stays a clean index.
   ============================================================ */

export interface DirectoryEntry {
  term: string;
  termHi: string;
  description: string;
  /** Path under /portal/[uan], or an absolute path for public pages. */
  path: string;
  absolute?: boolean;
  aliases: string[];
}

/* Extra terms beyond the service names themselves — the words that
   actually get typed. */
const TASK_TERMS: DirectoryEntry[] = [
  {
    term: "Aadhaar mismatch",
    termHi: "आधार बेमेल",
    description: "Your name or date of birth differs from your Aadhaar record.",
    path: "/records",
    aliases: ["aadhar", "adhaar", "demographic discrepancy", "name not matching", "kyc mismatch"],
  },
  {
    term: "Bank account change",
    termHi: "बैंक खाता बदलना",
    description: "Add or correct the account your money is paid into.",
    path: "/records",
    aliases: ["ifsc", "account number", "bank kyc", "cheque", "passbook photo"],
  },
  {
    term: "Claim rejected",
    termHi: "दावा अस्वीकृत",
    description: "Find out the real reason and what to send next.",
    path: "/claims",
    aliases: ["rejection", "reject kyun", "why rejected", "claim failed", "remark"],
  },
  {
    term: "Date of exit",
    termHi: "निकास तिथि",
    description: "Record that you left an employer, when they never did.",
    path: "/exit",
    aliases: ["exit date", "left job", "resigned", "mark exit", "still in service"],
  },
  {
    term: "Form 19",
    termHi: "फॉर्म 19",
    description: "Final settlement — withdraw your whole provident fund.",
    path: "/file",
    aliases: ["final settlement", "full withdrawal", "pf nikalna", "withdraw all"],
  },
  {
    term: "Form 31",
    termHi: "फॉर्म 31",
    description: "Advance for illness, housing, education or marriage.",
    path: "/file",
    aliases: ["advance", "part withdrawal", "partial", "loan"],
  },
  {
    term: "Grievance",
    termHi: "शिकायत",
    description: "Raise a complaint, and see which rung actually binds anyone.",
    path: "/grievance",
    aliases: ["complaint", "epfigms", "cpgrams", "escalate", "shikayat"],
  },
  {
    term: "Name correction",
    termHi: "नाम सुधार",
    description: "Correct the name EPFO holds against your UAN.",
    path: "/correct",
    aliases: ["change name", "spelling", "joint declaration", "surname"],
  },
  {
    term: "Nominee",
    termHi: "नामांकित व्यक्ति",
    description: "Name who receives your fund and pension if you die.",
    path: "/nomination",
    aliases: ["nomination", "form 2", "beneficiary", "family", "death claim"],
  },
  {
    term: "Passbook",
    termHi: "पासबुक",
    description: "Every month of contributions, with wages and the pension split.",
    path: "/passbook",
    aliases: ["statement", "contributions", "balance history", "download passbook"],
  },
  {
    term: "Pension",
    termHi: "पेंशन",
    description: "Your qualifying service, and what you have earned so far.",
    path: "/pension",
    aliases: ["eps", "eps-95", "form 10c", "form 10d", "monthly pension", "ten years"],
  },
  {
    term: "RTI application",
    termHi: "आरटीआई आवेदन",
    description: "The only route that legally compels an answer about your file.",
    path: "/claims",
    aliases: ["right to information", "section 6", "note sheet", "file noting"],
  },
  {
    term: "Transfer old account",
    termHi: "पुराना खाता स्थानांतरण",
    description: "Merge a previous employer's account into this one.",
    path: "/transfer",
    aliases: ["form 13", "merge", "old uan", "multiple uan", "previous employer"],
  },
  {
    term: "TDS and tax",
    termHi: "टीडीएस और कर",
    description: "Why tax was cut, and how to avoid the penalty rate.",
    path: "/records",
    aliases: ["tax deducted", "pan", "form 15g", "15h", "income tax"],
  },
  {
    term: "UAN",
    termHi: "यूएएन",
    description: "Your permanent account number across every employer.",
    path: "",
    aliases: ["universal account number", "uan number", "activate uan"],
  },
];

/** Services plus task terms, alphabetised. */
export function directory(): DirectoryEntry[] {
  const fromServices: DirectoryEntry[] = SERVICES.map((s) => ({
    term: s.title,
    termHi: s.titleHi,
    description: s.blurb,
    path: s.path,
    aliases: [s.nav.toLowerCase(), s.formLabel?.toLowerCase() ?? ""].filter(Boolean),
  }));

  const all = [...fromServices, ...TASK_TERMS];

  // Drop duplicates that arrive from both sources.
  const seen = new Set<string>();
  const unique = all.filter((e) => {
    const key = e.term.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => a.term.localeCompare(b.term));
}

export function groupByLetter(
  entries: DirectoryEntry[]
): Array<[string, DirectoryEntry[]]> {
  const map = new Map<string, DirectoryEntry[]>();
  for (const e of entries) {
    const letter = e.term[0].toUpperCase();
    const list = map.get(letter);
    if (list) list.push(e);
    else map.set(letter, [e]);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function matches(entry: DirectoryEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    entry.term.toLowerCase().includes(q) ||
    entry.termHi.includes(q) ||
    entry.description.toLowerCase().includes(q) ||
    entry.aliases.some((a) => a.includes(q))
  );
}
