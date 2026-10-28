export { writeTempFile } from './tempFiles.js'
export declare const compileSvelteOnlyExport: (
  sveltePath: string,
  sourceDir: string,
  exportNames?: string[],
) => Promise<string>
/**
 * Build a MINIMAL on-demand barrel for a svelte barrel entry: for each
 * requested export name, resolve it to its `.svelte` file (transitively, via
 * `findSvelteFileForExport`), compile just that file (`compileSvelteOnlyExport`),
 * and emit a wrapper re-exporting only those names. This loads ONLY the
 * components the importer actually touches, instead of the barrel's full graph.
 *
 * Returns the temp file path of the minimal barrel, or null when any requested
 * name cannot be resolved to a unique `.svelte` file (caller must fall back to
 * loading the whole barrel). The wrapper path is deterministic in
 * (entryPath, sorted names) so repeated calls reuse the same file.
 */
export declare const buildOnDemandSvelteBarrel: (
  entryPath: string,
  sourceDir: string,
  importedNames: string[],
) => Promise<string | null>
/**
 * Cached wrapper around resolveSvelteOnlyExportsImpl.
 *
 * The transformation is pure in (code, sourceDir), so results are cached on
 * disk keyed by their combined hash. Most test files contain no svelte
 * imports and come out unchanged; the cache lets warm runs skip the full
 * AST parse + package resolution entirely.
 */
export declare const resolveSvelteOnlyExports: (code: string, sourceDir: string) => Promise<string>
