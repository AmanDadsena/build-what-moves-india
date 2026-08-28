import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    /* Vendored agent skills — third-party scripts and deliberately
       broken React fixtures. They accounted for two and a half
       thousand findings, which is enough noise to hide a real one in
       the code this project actually ships. */
    ".claude/**",
  ]),

  {
    /* Flat config scopes plugin namespaces to the object they are
       declared in. eslint-config-next registers react-hooks inside
       its own "next" object, so naming one of its rules out here
       fails to resolve unless the plugin is declared again — and it
       has to be the same module instance, or ESLint refuses the
       redefinition. */
    plugins: { "react-hooks": reactHooks },
    rules: {
      /* Downgraded deliberately, and only this rule.
       *
       * The rule is right in general: setState in an effect body
       * usually means state that should have been derived during
       * render, and it costs a second pass.
       *
       * It cannot be satisfied here. Every route in this app is
       * exported to static HTML at build time, so the server render
       * has no access to today's date, the reader's saved
       * preferences, the voices installed on the device, or the query
       * string. Reading any of those during render either bakes the
       * build-time answer into the file — which is a real bug this
       * project has already shipped once and fixed — or produces a
       * hydration mismatch.
       *
       * So the value is genuinely unknown until the first client
       * render, and an effect is where it becomes known. The eight
       * sites this applies to are all of that shape: a one-shot read
       * of something only the browser can see.
       *
       * Left as a warning rather than switched off, so a ninth one
       * still has to be looked at.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
