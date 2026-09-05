"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AssistantLauncher } from "@/components/AssistantLauncher";

/* The help button, without the help.
 *
 * The assistant is on every page, and it holds a set of written
 * answers rather than a model — which is the honest version of the
 * feature and the reason it can promise never to invent a statutory
 * deadline. The cost of holding them is that it imports the knowledge
 * base, and that imports the rejection corpus, the document templates
 * and the service map: roughly 40 KB compressed, in the first bundle
 * of every page, so that a floating button could say "Need help?".
 *
 * Which inverts who pays for what. The member on a slow connection
 * opening one rejection page — the person this entire site is
 * written for — was downloading every answer to every question in
 * order to see a button they mostly never press.
 *
 * So the button stays and the answers do not. The launcher here is
 * the same component the assistant renders, so nothing moves or
 * restyles when the real one arrives; pressing it fetches the
 * assistant and opens it. The wait is paid once per visit, by the
 * person who asked.
 */

const Assistant = dynamic(
  () => import("@/components/Assistant").then((m) => m.Assistant),
  /* Nothing to server-render: the panel starts closed, and the
     launcher below is already in the HTML. */
  { ssr: false },
);

export function AssistantMount({ uan }: { uan?: string }) {
  const [wanted, setWanted] = useState(false);

  /* Once the real assistant is here it renders its own launcher and
     owns the open state, so this steps out of the way entirely rather
     than leaving two buttons stacked on each other. */
  if (wanted) return <Assistant uan={uan} autoOpen />;

  return (
    <AssistantLauncher open={false} onClick={() => setWanted(true)} />
  );
}
