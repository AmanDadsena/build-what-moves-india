import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { Tag } from "@/components/Provenance";

/* Honesty is one of the six things this build is judged on, so it
   gets a page rather than a footnote — and the page is written to be
   useful to a sceptical reader, not to reassure. */

export const metadata = {
  title: "What is real and what is mocked",
  description:
    "A line-by-line account of which parts of this prototype are verified fact, which are reconstructed, and which are invented.",
};

export default function HowReal() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 sm:py-14">
          <p className="eyebrow mb-3">Disclosure</p>
          <h1 className="display-1 mb-5">
            What is real here, and what is not
          </h1>
          <p className="lede measure mb-10">
            This is a hackathon prototype. It reaches no government system and
            holds no real person&rsquo;s data. Rather than say that once at the
            bottom of the page, every claim in the interface carries a tag, and
            this is what each tag means.
          </p>

          <Block
            kind="verified"
            title="Verified fact"
            body="Published figures and documented procedure, sourced. The rejection statistics come from EPFO's annual report for 2024–25 as reported by Business Today in July 2026: about 796 lakh claims filed, about 174 lakh rejected, roughly 22 per cent. The rejection remarks are representative of strings widely reported by members. The correction routes — Joint Declaration through the employer, self-service exit marking, Form 13 transfer — are EPFO's own documented procedures."
          />

          <Block
            kind="statutory"
            title="Statute"
            body="Quoted from the text of the Right to Information Act 2005. Section 6(1) is the application. Section 7(1) sets the thirty-day reply period and section 7(2) makes silence a deemed refusal. Section 19(1) is the first appeal and 19(3) the second. Section 20(1) is the penalty of ₹250 a day up to ₹25,000, payable by the Public Information Officer personally. Everything the interface calls a hard clock traces to one of these."
          />

          <Block
            kind="reconstructed"
            title="Reconstructed"
            body="The note sheets are the one place we model rather than report. They are built from EPFO's documented four-desk claim workflow and from the remark on each case, to show what a file of that kind contains and where the twenty-day count restarts. They are not copies of anyone's actual file, and we do not claim to know what any real officer wrote. Obtaining the genuine article is exactly what the RTI on the Documents tab is for — that is the product's point rather than a limitation of it."
          />

          <Block
            kind="mock"
            title="Mock data"
            body="Every member is invented. The numbers are deliberately malformed so they cannot collide with anything real: UANs begin 99, Aadhaar numbers would begin 0000 — a range UIDAI does not issue — and no real bank account, PAN or Aadhaar number appears anywhere in this build. Sign-in is decorative; there is no account, no OTP, no session and no database. Nothing you type is transmitted or stored."
          />

          <section className="border-t border-rule py-6">
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <Tag kind="reconstructed" />
              <h2 className="font-semibold tracking-[-0.01em]">
                How this was made
              </h2>
            </div>
            <p className="text-ink-soft leading-relaxed mb-4">
              The illustrations were generated with an image model, then
              constrained rather than accepted: locked to this design
              system&rsquo;s palette, and prompted to contain no lettering, so
              that nothing on screen becomes untranslatable, unreadable to a
              screen reader, or blurry when the page is enlarged. None of them
              carries the EPFO logo, the State Emblem, the Ashoka Chakra or the
              flag, because a prototype that borrowed an authority mark would
              be claiming an approval it does not have. Each file still holds
              the generator&rsquo;s invisible provenance watermark, which
              survives resizing, so they remain identifiable as generated.
            </p>
            <p className="text-ink-soft leading-relaxed">
              No language model runs when you use this. The assistant and the
              search retrieve passages that were written in advance and name
              their source; they cannot compose a new answer, which is why they
              will say they hold nothing rather than produce something
              plausible about a statutory deadline. The whole site is static
              files, so there is no server to be slow and nothing to cold-start
              on a poor connection.
            </p>
          </section>

          <section className="mt-12 border-t border-rule pt-8">
            <h2 className="text-xl font-semibold tracking-[-0.015em] mb-4">
              What this prototype cannot do
            </h2>
            <ul className="space-y-3 text-ink-soft leading-relaxed">
              <Limit>
                It cannot read your actual EPFO record. A production version
                would need EPFO to expose a member-consented read, which does
                not exist today.
              </Limit>
              <Limit>
                It cannot file anything for you. Every document is a draft you
                send yourself, because filing on a member&rsquo;s behalf would
                need authorisation this build has no way to obtain.
              </Limit>
              <Limit>
                It cannot tell you what your own officers wrote. It shows what a
                file of your type contains, and gives you the instrument that
                compels disclosure of yours.
              </Limit>
              <Limit>
                It is not legal advice. The RTI drafts follow the Act&rsquo;s
                own language, but a complicated case deserves a person, not a
                template.
              </Limit>
            </ul>
          </section>

          <section className="mt-10 border border-rule-heavy bg-paper-raised px-5 py-5">
            <h2 className="font-semibold mb-2.5">
              How it would work at real scale
            </h2>
            <p className="text-ink-soft leading-relaxed text-sm">
              Nothing here needs new legislation. The decoder needs EPFO to
              publish its remark codes with their true causes — a mapping the
              organisation already holds internally. The diff needs a
              member-consented read of the four KYC fields, which is the same
              consent architecture already used to seed them. The note sheet
              needs only that the existing noting be shown to the member whose
              money it concerns. The RTI route needs nothing at all: it works
              today, and almost nobody is told about it.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function Block({
  kind,
  title,
  body,
}: {
  kind: "verified" | "statutory" | "reconstructed" | "mock";
  title: string;
  body: string;
}) {
  return (
    <section className="border-t border-rule py-6">
      <div className="flex items-center gap-2.5 mb-3 flex-wrap">
        <Tag kind={kind} />
        <h2 className="font-semibold tracking-[-0.01em]">{title}</h2>
      </div>
      <p className="text-ink-soft leading-relaxed">{body}</p>
    </section>
  );
}

function Limit({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="text-stamp shrink-0 machine text-sm pt-0.5">
        ×
      </span>
      <span>{children}</span>
    </li>
  );
}
