import Link from "next/link";
import { needsEmployer, routesFor } from "@/lib/employer-gone";
import type { RejectionReason } from "@/lib/types";

/* The question the steps above do not answer.
 *
 * A list of instructions that includes "ask your employer" reads as
 * complete. For the member whose establishment closed four years ago
 * it is not complete — it is a wall with a signpost on it — and until
 * this existed the site said nothing about that at exactly the moment
 * somebody discovered it.
 *
 * So it goes here, directly under the steps, rather than being
 * reachable only from the navigation. Somebody who has just read
 * "ask your employer to approve the KYC" and thought *there is no
 * employer* should not have to go looking.
 *
 * It renders nothing at all where the reason has no employer step,
 * which is checked against the knowledge base rather than against a
 * list somebody has to remember to update.
 */

export function EmployerGoneNote({ reason }: { reason: RejectionReason }) {
  if (!needsEmployer(reason)) return null;

  const steps = reason.fixSteps.filter((s) => s.actor === "employer");
  const routes = routesFor(reason.id).slice(0, 3);
  const free = routes.filter((r) => r.dependency === "nobody");

  return (
    <section
      aria-labelledby="no-employer"
      className="border-2 border-noting bg-noting-wash/40 rounded-xl overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-noting/25">
        <h2 id="no-employer" className="display-3 mb-2">
          And if there is no employer to ask?
        </h2>
        <p className="leading-relaxed measure">
          {steps.length === 1
            ? "One of the steps above belongs to your establishment."
            : `${steps.length} of the steps above belong to your establishment.`}{" "}
          If it has closed, will not reply, or cannot be found, none of them can
          be followed as written — and that is where most people are told the
          matter ends.
        </p>
      </div>

      <div className="px-6 py-5">
        <p className="text-sm leading-relaxed measure mb-4">
          It does not. What your employer would attest, they already filed with
          EPFO every month, under their own signature. The office is holding it.
          {free.length > 0 && (
            <>
              {" "}
              And{" "}
              {free.length === 1
                ? "one of the routes round it needs"
                : `${free.length} of the routes round it need`}{" "}
              nobody&rsquo;s agreement at all.
            </>
          )}
        </p>

        <ul className="space-y-2 mb-5">
          {routes.map((r) => (
            <li key={r.id} className="flex gap-3">
              <span aria-hidden className="text-noting shrink-0 pt-0.5">
                &rarr;
              </span>
              <span className="text-sm leading-relaxed">
                <span className="font-semibold">{r.title}</span>
                {" — "}
                {r.summary}
              </span>
            </li>
          ))}
        </ul>

        <Link href="/employer-gone/" className="btn btn-primary btn-sm">
          When there is no employer left to ask
        </Link>
      </div>
    </section>
  );
}
