import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS, getMember, corpus } from "@/lib/members";
import { Tag } from "@/components/Provenance";
import { Disclose } from "@/components/Motion";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ uan: m.uan }));
}

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

export default async function Nomination({
  params,
}: PageProps<"/portal/[uan]/nomination">) {
  const { uan } = await params;
  const member = getMember(uan);
  if (!member) notFound();

  return (
    <div className="space-y-9 stagger">
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p className="eyebrow section-mark">Nomination &middot; Form 2</p>
          <Tag kind="verified" />
        </div>
        <h2 className="display-2 measure mb-3">
          You have not said who gets this money.
        </h2>
        <p className="lede measure">
          Who receives your fund and pension if you die. It takes minutes, and
          most members never do it.
        </p>
      </section>

      {/* The consequence, stated plainly. This is the whole point of
          the page: the form is easy, the motivation is missing. */}
      <section className="border border-stamp/50 bg-stamp-wash/40 px-5 py-5">
        <p className="eyebrow mb-2">If you leave this blank</p>
        <p className="leading-relaxed max-w-2xl mb-4">
          {rupees(corpus(member))} does not simply pass to your family. With no
          nomination on file, they must establish their claim through
          succession — producing a legal heir or succession certificate from a
          court before EPFO can release anything.
        </p>
        <ul className="space-y-2 text-sm text-ink-soft">
          <Consequence>
            Months of delay, at the point when the money is needed most
          </Consequence>
          <Consequence>
            Court and lawyer costs, paid out of pocket before anything is
            released
          </Consequence>
          <Consequence>
            Disputes between relatives that a single form would have prevented
          </Consequence>
          <Consequence>
            Pension under EPS follows its own order of entitlement, which may
            not be who you would have chosen
          </Consequence>
        </ul>

        <Link
          href="/after-a-death/"
          className="btn btn-secondary btn-sm mt-5"
        >
          What your family would actually face
        </Link>
      </section>

      <section>
        <p className="eyebrow mb-4">Current nomination</p>
        <div className="border border-rule bg-paper-raised px-5 py-8 text-center">
          <p className="text-ink-faint mb-1">No nominee on record</p>
          <p className="text-sm text-ink-faint">
            Nothing has been filed against UAN {member.uan}
          </p>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-4">Add a nominee</p>
        <div className="border border-rule-heavy bg-paper-raised p-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full name, as on their Aadhaar">
              <input
                placeholder="Enter name"
                className="num w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md placeholder:text-ink-faint/60"
              />
            </Field>
            <Field label="Relationship">
              <select
                defaultValue=""
                className="w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md"
              >
                <option value="" disabled>
                  Choose
                </option>
                <option>Spouse</option>
                <option>Son</option>
                <option>Daughter</option>
                <option>Mother</option>
                <option>Father</option>
              </select>
            </Field>
            <Field label="Date of birth">
              <input
                placeholder="DD/MM/YYYY"
                className="num w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md placeholder:text-ink-faint/60"
              />
            </Field>
            <Field label="Share of the total">
              <input
                defaultValue="100%"
                className="num w-full border border-rule bg-paper px-3.5 py-2.5 text-base outline-none focus:border-noting rounded-md"
              />
            </Field>
          </div>

          <div className="border-t border-rule pt-5">
            <button className="btn btn-primary">
              Save nomination
            </button>
            <p className="text-sm text-ink-faint leading-relaxed mt-3">
              Simulated, and deliberately so — a real nomination is signed with
              Aadhaar authentication, which this prototype must not touch.
            </p>
          </div>
        </div>
      </section>

      <Disclose label="What we changed" className="border-l-4 border-noting bg-noting-wash/50 rounded-lg px-5 py-4">
        <p className="lede measure">
          The original screen is a form with no explanation attached. Nobody
          fills in a form whose purpose they cannot see. We put the consequence
          first and the fields second, because the missing thing was never the
          form — it was the reason.
        </p>
      </Disclose>
    </div>
  );
}

function Consequence({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden className="text-stamp machine shrink-0">
        ×
      </span>
      <span>{children}</span>
    </li>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="eyebrow block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
