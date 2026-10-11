export { writeTempFile } from './tempFiles.js'
export declare const compileSvelteOnlyExport: (
  sveltePath: string,
  sourceDir: string,
  exportNames?: string[],
) => Promise<string>
/**
 * Cached wrapper around resolveSvelteOnlyExportsImpl.
 *
 * The transformation is pure in (code, sourceDir), so results are cached on
 * disk keyed by their combined hash. Most test files contain no svelte
 * imports and come out unchanged; the cache lets warm runs skip the full
 * AST parse + package resolution entirely.
 */
export declare const resolveSvelteOnlyExports: (code: string, sourceDir: string) => Promise<string>
