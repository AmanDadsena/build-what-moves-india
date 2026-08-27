import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { Illustration } from "@/components/Illustration";
import { IconFile, IconWithdraw, IconPension, IconTransfer, IconNominee, IconCorrect, IconRecords, IconCertificate } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Forms & downloads",
  description:
    "Every provident fund form, what it is actually for, who has to sign it, and where it goes.",
};

/* Forms, indexed by the question they answer.

   Every public-service site has a downloads page, and it is nearly
   always a list of file names. A member who does not already know
   that Form 10C is the pension withdrawal benefit cannot use that
   list at all. So the form number comes second here, after what the
   form is for. */

interface FormEntry {
  code: string;
  name: string;
  nameHi: string;
  purpose: string;
  signedBy: string;
  goesTo: string;
  /** Where in the portal this is filed or generated. */
  path?: string;
  action?: string;
}

const FORMS: FormEntry[] = [
  {
    code: "Form 19",
    name: "Withdraw your whole provident fund",
    nameHi: "पूरा भविष्य निधि निकालना",
    purpose:
      "Final settlement after you have left employment and the required period has passed.",
    signedBy: "You",
    goesTo: "Filed online against your UAN",
    path: "/file",
    action: "File with a pre-flight check",
  },
  {
    code: "Form 31",
    name: "Take an advance while still working",
    nameHi: "नौकरी के दौरान अग्रिम लेना",
    purpose:
      "Part withdrawal for a specific purpose — illness, housing, education or marriage.",
    signedBy: "You",
    goesTo: "Filed online against your UAN",
    path: "/file",
    action: "File with a pre-flight check",
  },
  {
    code: "Form 10C",
    name: "Withdraw the pension part",
    nameHi: "पेंशन हिस्सा निकालना",
    purpose:
      "Pension withdrawal benefit where qualifying service is under ten years. Taking it ends your pension service.",
    signedBy: "You",
    goesTo: "Filed online against your UAN",
    path: "/pension",
    action: "Check your service first",
  },
  {
    code: "Form 10D",
    name: "Start a monthly pension",
    nameHi: "मासिक पेंशन शुरू करना",
    purpose:
      "Monthly pension once you have ten years of qualifying service and reach the required age.",
    signedBy: "You",
    goesTo: "Regional office",
    path: "/pension",
    action: "See your qualifying service",
  },
  {
    code: "Form 13",
    name: "Move an old account into this one",
    nameHi: "पुराना खाता इसमें मिलाना",
    purpose:
      "Transfer provident fund and service from a previous employer. Do this before any withdrawal.",
    signedBy: "You",
    goesTo: "Filed online",
    path: "/transfer",
    action: "Search for old accounts",
  },
  {
    code: "Form 2",
    name: "Name who receives your money",
    nameHi: "नामांकन करना",
    purpose:
      "Nomination for provident fund and pension. Without it your family must establish their claim through succession.",
    signedBy: "You",
    goesTo: "Filed online",
    path: "/nomination",
    action: "Add a nominee",
  },
  {
    code: "Joint Declaration",
    name: "Correct a name or date of birth",
    nameHi: "नाम या जन्मतिथि सुधारना",
    purpose:
      "The prescribed route for correcting particulars EPFO holds against your UAN.",
    signedBy: "You and your employer, both",
    goesTo: "Regional office, through the employer's login",
    path: "/correct",
    action: "See what needs correcting",
  },
  {
    code: "Form 15G / 15H",
    name: "Avoid tax being deducted",
    nameHi: "कर कटौती से बचना",
    purpose:
      "Declaration that your income is below the taxable limit. 15H if you are a senior citizen.",
    signedBy: "You",
    goesTo: "Submitted with the claim",
  },
  {
    code: "RTI application",
    name: "Demand the reason in writing",
    nameHi: "लिखित में कारण माँगना",
    purpose:
      "Application under section 6(1) for the noting on your own file. The only route that legally compels a reply.",
    signedBy: "You",
    goesTo: "Central Public Information Officer, with a ₹10 fee",
    path: "/claims",
    action: "Generate it from your case",
  },
];

const FORM_ICONS: Record<string, (p: { size?: number }) => React.JSX.Element> = {
  "Form 19": IconWithdraw,
  "Form 31": IconWithdraw,
  "Form 10C": IconPension,
  "Form 10D": IconPension,
  "Form 13": IconTransfer,
  "Form 2": IconNominee,
  "Joint Declaration": IconCorrect,
  "Form 15G / 15H": IconCertificate,
  "RTI application": IconRecords,
};

const DEMO_UAN = "990012345678";

export default function Downloads() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Forms & downloads"
          provenance="verified"
          title="Which form you need, in words rather than numbers."
          lede="Nine forms cover almost everything. Each one here says what it is for, who has to sign it, and where it goes."
          aside={
            <div className="rounded-lg bg-paper p-5 border border-paper/20">
              <Illustration src="/img/forms.webp" priority />
            </div>
          }
        />

        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14 space-y-10 stagger">


          <section>
            <ul className="grid gap-4 lg:grid-cols-2">
              {FORMS.map((f) => {
                const Icon = FORM_ICONS[f.code] ?? IconFile;
                return (
                  <li key={f.code}>
                    <div className="lift-hover group h-full border border-rule bg-paper-raised rounded-lg p-5 sm:p-6 hover:border-noting">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-paper-inset text-noting transition-colors group-hover:bg-noting-wash shrink-0">
                          <Icon size={22} />
                        </span>
                        <div className="min-w-0">
                          <p className="figure-sm text-sm text-noting mb-0.5">
                            {f.code}
                          </p>
                          <h2 className="title">{f.name}</h2>
                          <p className="font-deva text-sm text-ink-faint">
                            {f.nameHi}
                          </p>
                        </div>
                      </div>

                      <p className="text-ink-soft leading-relaxed mb-4">
                        {f.purpose}
                      </p>

                      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4 pt-4 border-t border-rule">
                        <div>
                          <dt className="eyebrow mb-0.5">Signed by</dt>
                          <dd className="text-ink-soft">{f.signedBy}</dd>
                        </div>
                        <div>
                          <dt className="eyebrow mb-0.5">Goes to</dt>
                          <dd className="text-ink-soft">{f.goesTo}</dd>
                        </div>
                      </dl>

                      {f.path && (
                        <Link
                          href={`/portal/${DEMO_UAN}${f.path}`}
                          className="btn btn-secondary btn-sm"
                        >
                          {f.action}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="border border-rule-heavy bg-paper-raised rounded-lg p-6">
            <h2 className="display-3 mb-2">Not sure which one applies to you?</h2>
            <p className="text-ink-soft leading-relaxed measure mb-5">
              Filing the wrong form is one of the most common avoidable
              rejections — Form 19 while still employed is the classic. Three
              questions will tell you which is right.
            </p>
            <Link
              href={`/portal/${DEMO_UAN}/ask`}
              className="btn btn-primary btn-sm"
            >
              Find the right form
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
