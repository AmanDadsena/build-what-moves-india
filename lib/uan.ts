/* ============================================================
   Finding a UAN.

   Everything else in this product, and everything in the real portal,
   begins by assuming the member has their Universal Account Number.
   A great many do not. It was allotted by an employer years ago,
   printed on a payslip they no longer have, for a job they left in a
   city they no longer live in.

   Without it there is no passbook, no claim, no grievance and no
   correction. It is the first gate, it is invisible from outside, and
   no screen anywhere is addressed to the person standing in front of
   it.

   The insight this page exists to state is the one that decides which
   route will work: every self-service method — the portal lookup, the
   missed call, the SMS — authenticates against the mobile number
   registered on the account. If the member still has that number,
   this takes four minutes. If they have changed it, which after a few
   years is common, then none of those work at all and only the
   employer or the office can help. Nobody tells them that first, so
   they spend an afternoon on routes that were never going to answer.

   On numbers: the specific helpline, missed-call and SMS numbers are
   not printed here. This build states plainly that it is not an
   official service and that its own helpline is invented, so quoting
   a real number in the same interface would be the one place a reader
   could not tell which kind of fact they were looking at. The routes
   are described so a member knows to ask for them; the digits come
   from the official site.
   ============================================================ */

export type Need = "payslip" | "mobile" | "employer" | "office" | "nothing";

export interface Route {
  id: string;
  title: string;
  titleHi: string;
  /** What the member actually does. */
  how: string;
  /** What has to be true for this to work at all. */
  needs: Need;
  needsLabel: string;
  /** Roughly how long, when it works. */
  speed: string;
  /** The catch, where there is one. */
  catch?: string;
}

export const ROUTES: Route[] = [
  {
    id: "payslip",
    title: "Look at any payslip",
    titleHi: "किसी भी सैलरी स्लिप पर देखें",
    how: "Most employers print the UAN on the payslip, usually near the provident fund deduction. Any month will do — the number never changes, not between jobs and not across a lifetime.",
    needs: "payslip",
    needsLabel: "One old payslip",
    speed: "Immediate",
  },
  {
    id: "form16",
    title: "Check your Form 16",
    titleHi: "अपना फ़ॉर्म 16 देखें",
    how: "Where a payslip cannot be found, the annual tax statement your employer issued often carries it alongside the provident fund figures.",
    needs: "payslip",
    needsLabel: "Form 16 from any year",
    speed: "Immediate",
  },
  {
    id: "portal",
    title: "Ask the member portal to tell you",
    titleHi: "मेंबर पोर्टल से पूछें",
    how: "The official portal has a lookup that returns your UAN from your Aadhaar, PAN or old member ID. It sends a one-time password to confirm it is you.",
    needs: "mobile",
    needsLabel: "The mobile number registered on the account",
    speed: "About four minutes",
    catch:
      "The OTP goes to the number registered when the account was opened — not to whatever number you use now. This is where most people stop.",
  },
  {
    id: "missed-call",
    title: "Give a missed call",
    titleHi: "मिस्ड कॉल दें",
    how: "EPFO runs a missed-call service that replies by SMS with your details. You call, it rings off, the message arrives.",
    needs: "mobile",
    needsLabel: "The registered mobile, in your hand",
    speed: "A minute or two",
    catch:
      "It answers only the registered number. From any other phone nothing comes back, and no error explains why.",
  },
  {
    id: "sms",
    title: "Send an SMS",
    titleHi: "एसएमएस भेजें",
    how: "A short coded message from the registered mobile returns your balance and details by reply. It works on a feature phone with no internet at all, which is the reason it exists.",
    needs: "mobile",
    needsLabel: "The registered mobile, in your hand",
    speed: "A minute or two",
    catch:
      "Same condition as the missed call: the registered number, and no other.",
  },
  {
    id: "employer",
    title: "Ask your employer, in writing",
    titleHi: "नियोक्ता से लिखित में पूछें",
    how: "The establishment allotted the number and holds it against your record. Ask HR or the accounts office in writing, and keep the reply — it is also the first document any later escalation will want.",
    needs: "employer",
    needsLabel: "The employer still trading, and answering",
    speed: "Days",
    catch:
      "Where the establishment has closed or stopped replying, this is the point to go to the regional office instead rather than keep asking.",
  },
  {
    id: "office",
    title: "Go to the regional office",
    titleHi: "क्षेत्रीय कार्यालय जाएँ",
    how: "The office holding your establishment code can look you up from your name, your father's name, your date of birth and the employer. Take identity proof and anything showing where you worked.",
    needs: "office",
    needsLabel: "A visit, and identity proof",
    speed: "A day",
    catch:
      "This is the route that works when every other one has failed, including when the registered mobile is long gone. It is listed last because it costs a day's wages, not because it is least likely to work.",
  },
];

/** The question that decides which routes are even worth trying. */
export interface Answer {
  routes: Route[];
  headline: string;
  note: string;
}

export function routesFor(hasRegisteredMobile: boolean | null): Answer {
  if (hasRegisteredMobile === null) {
    return {
      routes: ROUTES,
      headline: "Seven ways, and one question that rules out three of them.",
      note: "Answer above and the list below shortens to the ones that can actually work for you.",
    };
  }

  if (hasRegisteredMobile) {
    return {
      routes: ROUTES,
      headline: "All seven are open to you. Start at the top.",
      note: "Because you still have the registered number, the self-service routes will authenticate you. Most people are finished inside five minutes without speaking to anybody.",
    };
  }

  return {
    routes: ROUTES.filter((r) => r.needs !== "mobile"),
    headline: "Three of the seven are closed to you. These four are not.",
    note: "Every self-service lookup sends its one-time password to the number registered when the account was opened. Without that phone they cannot confirm who you are, and no amount of retrying changes it. Nobody tells you this first, which is how an afternoon disappears.",
  };
}
