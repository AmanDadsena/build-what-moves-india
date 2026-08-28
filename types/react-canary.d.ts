/// <reference types="react/canary" />

/* Opts in the React canary type declarations, project-wide.
 *
 * ViewTransition ships in the React build Next vendors for the App
 * Router, but @types/react keeps its declaration behind a "react/canary"
 * module so a stable-channel project cannot reach for it by accident.
 *
 * It has to be referenced from a .d.ts rather than imported from a
 * component: `import {} from "react/canary"` type-checks, but the
 * bundler then tries to resolve a module that does not exist at
 * runtime and the build fails. A triple-slash reference is erased
 * before anything reaches the bundler.
 */
