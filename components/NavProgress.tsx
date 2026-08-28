"use client";

import { useLinkStatus } from "next/link";

/* A hairline that fills while a link is still fetching.
 *
 * On a fast connection nobody sees this, and that is correct — it
 * only exists on the connections this build is actually for. On a
 * slow one the alternative is a member tapping a nav item, seeing
 * nothing change, and tapping it again.
 *
 * useLinkStatus reports the pending state of the Link it is rendered
 * inside, so this has to be a child of one. It is aria-hidden and
 * purely decorative: the navigation announces itself through the
 * route change, and a progress bar that also spoke would say it
 * twice.
 */

export function NavProgress() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      data-pending={pending ? "true" : "false"}
      className="nav-progress"
    />
  );
}
