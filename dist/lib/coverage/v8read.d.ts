/**
 * Reads the coverage-*.json files Node.js writes to NODE_V8_COVERAGE and
 * merges them into one set of script coverages.
 *
 * A faithful port of @bcoe/v8-coverage's mergeProcessCovs: scripts are
 * grouped by URL, functions by root range, and matching functions are merged
 * structurally with range trees (counts are summed over matching spans).
 */
import type { SourceMapCache, V8ScriptCoverage } from './types.js'
interface LoadResult {
  /** merged scripts, urls converted to absolute paths, sorted by url */
  scripts: V8ScriptCoverage[]
  /** source maps, keyed by the absolute script path */
  sourceMapCache: SourceMapCache
  /** absolute paths of every script that was covered by some process */
  coveredPaths: Set<string>
}
/**
 * Loads all V8 coverage files in a directory and merges them the same way
 * c8 does (mergeProcessCovs over every file).
 *
 * - file:// urls are converted to absolute paths (c8's _normalizeProcessCov)
 * - scripts with non-absolute urls are dropped (c8's omitRelative)
 * - the source-map cache is re-keyed by absolute script path
 * - unreadable or malformed files are skipped
 */
export declare const loadCoverage: (tempDir: string) => Promise<LoadResult>
export {}
