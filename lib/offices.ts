/* ============================================================
   Regional offices.

   The original portal has an office locator, and it answers the
   easier half of the question: where the building is. The harder
   half is what the building can actually do — a member who takes a
   Joint Declaration to an office that does not hold their
   establishment code has spent a day's wages travelling to be turned
   away.

   Every office below is invented, and the addresses and phone
   numbers are deliberately non-functional. What is real is the
   division of work between an office, an employer's login and the
   online portal, which is what the page is actually about.
   ============================================================ */

export interface Office {
  id: string;
  name: string;
  city: string;
  state: string;
  /** Establishment-code prefixes this office holds. */
  covers: string[];
  address: string;
  phone: string;
  hours: string;
}

export const OFFICES: Office[] = [
  {
    id: "mh-bandra",
    name: "Regional Office, Bandra",
    city: "Mumbai",
    state: "Maharashtra",
    covers: ["MHBAN"],
    address: "Bhavishya Nidhi Bhavan, Bandra East, Mumbai 400051",
    phone: "022 0000 0000",
    hours: "Mon–Fri, 9:30–17:30",
  },
  {
    id: "kr-kochi",
    name: "Regional Office, Kochi",
    city: "Kochi",
    state: "Kerala",
    covers: ["KRKCH", "KRERN"],
    address: "Bhavishya Nidhi Bhavan, Kaloor, Kochi 682017",
    phone: "0484 000 0000",
    hours: "Mon–Fri, 9:30–17:30",
  },
  {
    id: "dl-cpm",
    name: "Regional Office, Delhi Central",
    city: "New Delhi",
    state: "Delhi",
    covers: ["DLCPM", "DLNDL"],
    address: "Bhavishya Nidhi Bhavan, Bhikaji Cama Place, New Delhi 110066",
    phone: "011 0000 0000",
    hours: "Mon–Fri, 9:30–17:30",
  },
  {
    id: "ka-bangalore",
    name: "Regional Office, Bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    covers: ["KNBGE", "KNBGN"],
    address: "Bhavishya Nidhi Bhavan, Rajajinagar, Bengaluru 560010",
    phone: "080 0000 0000",
    hours: "Mon–Fri, 9:30–17:30",
  },
  {
    id: "tn-chennai",
    name: "Regional Office, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    covers: ["TNMAS", "TNAMB"],
    address: "Bhavishya Nidhi Bhavan, Royapettah, Chennai 600014",
    phone: "044 0000 0000",
    hours: "Mon–Fri, 9:30–17:30",
  },
  {
    id: "wb-kolkata",
    name: "Regional Office, Kolkata",
    city: "Kolkata",
    state: "West Bengal",
    covers: ["WBCAL", "WBHOW"],
    address: "Bhavishya Nidhi Bhavan, Sector III, Salt Lake, Kolkata 700106",
    phone: "033 0000 0000",
    hours: "Mon–Fri, 9:30–17:30",
  },
  {
    id: "up-noida",
    name: "Regional Office, Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    covers: ["UPNOI", "UPGZB"],
    address: "Bhavishya Nidhi Bhavan, Sector 24, Noida 201301",
    phone: "0120 000 0000",
    hours: "Mon–Fri, 9:30–17:30",
  },
  {
    id: "gj-ahmedabad",
    name: "Regional Office, Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    covers: ["GJAHD", "GJVAD"],
    address: "Bhavishya Nidhi Bhavan, Naranpura, Ahmedabad 380013",
    phone: "079 0000 0000",
    hours: "Mon–Fri, 9:30–17:30",
  },
];

/** What a counter can do, and what it will send you away to do. */
export const AT_THE_OFFICE = {
  can: [
    "Accept a Joint Declaration your employer has already countersigned",
    "Accept an RTI application and its ₹10 fee, and give you a receipt",
    "Tell you which desk your file is currently sitting on",
    "Accept a physical grievance where you cannot file online",
    "Certify documents against originals you bring",
  ],
  cannot: [
    "Approve your KYC — that happens in your employer's login, not here",
    "Overrule a rejection at the counter",
    "Accept a declaration you have signed alone",
    "Discuss anybody else's file, including a spouse's",
    "Release money the same day, whatever you are told",
  ],
  bring: [
    "Your UAN and establishment code",
    "Aadhaar, and the original of anything you want certified",
    "The exact rejection remark, printed or written down",
    "Any reference number already raised online",
    "A photocopy of everything — counters rarely copy for you",
  ],
};

export function findOffice(establishmentCode: string): Office | undefined {
  return OFFICES.find((o) =>
    o.covers.some((prefix) => establishmentCode.startsWith(prefix))
  );
}

export function searchOffices(query: string): Office[] {
  const q = query.trim().toLowerCase();
  if (!q) return OFFICES;
  return OFFICES.filter(
    (o) =>
      o.city.toLowerCase().includes(q) ||
      o.state.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      o.covers.some((c) => c.toLowerCase().includes(q))
  );
}
