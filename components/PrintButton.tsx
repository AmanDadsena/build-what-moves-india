"use client";

/* A print trigger. Trivial, but window.print needs a client boundary
   and the pages that use it are otherwise server-rendered. */

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="btn btn-primary btn-sm">
      {label}
    </button>
  );
}
