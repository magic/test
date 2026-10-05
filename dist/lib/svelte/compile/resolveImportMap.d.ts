/**
 * Find the nearest package.json by walking up from the directory containing
 * `fromPath`. Node resolves "#-prefixed" import-map specifiers against the
 * package scope of the IMPORTING file, not against process.cwd() - so
 * compiling files from nested/workspace packages must use the nearest
 * package.json to find their "imports" mappings.
 *
 * Falls back to the CWD package.json if no package.json is found up the tree
 * (or the input is not an absolute path).
 */
export declare const findNearestPackageJson: (fromPath: string) => Promise<string>
/**
 * Resolve a "#-prefixed" import-map specifier against a package.json
 * "imports" mapping (e.g. "#lib/*": "./src/lib/*",
 * "#client": "./src/internal/client.js").
 *
 * Resolution rules (longest matching key wins):
 *   1) Exact match: "#client" -> "./src/internal/client.js"
 *   2) Wildcard match: "#lib/*" -> "./src/lib/*"
 *   3) Parent-key base-dir match: "#lib" -> "./src/lib/index.js" resolves
 *      "#lib/forms/Button.svelte" to "./src/lib/forms/Button.svelte"
 *
 * After mapping, .js -> .ts conversion and common extension/index fallbacks
 * are applied. Returns the absolute file path, or null if no mapping matches
 * or no candidate file exists.
 */
export declare const resolveImportMapSpecifier: (
  specifier: string,
  pkgJsonPath: string,
) => Promise<string | null>
