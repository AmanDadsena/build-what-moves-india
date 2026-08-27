import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

/* Lets the tests import the app's modules unmodified.
 *
 * Node runs TypeScript directly now by stripping the types, which is
 * why this project needs no build step or test framework to test its
 * logic. The one thing it will not do is guess at a file extension:
 * Node's ESM resolver is strict, so `import "./escalation"` fails even
 * though `escalation.ts` is sitting right there.
 *
 * The bundler that builds the site resolves those specifiers happily,
 * so the alternative would be writing `.ts` into every import in the
 * application purely to satisfy the test runner — letting the tests
 * dictate the shape of the source. This hook is the smaller price.
 *
 *   node --import ./scripts/ts-resolve.mjs --test
 */

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith(".") &&
      !path.extname(specifier) &&
      context.parentURL?.startsWith("file:")
    ) {
      const from = path.dirname(fileURLToPath(context.parentURL));
      for (const extension of [".ts", ".tsx", "/index.ts"]) {
        const candidate = path.resolve(from, specifier + extension);
        if (existsSync(candidate)) {
          return { url: pathToFileURL(candidate).href, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
