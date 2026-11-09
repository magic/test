/**
 * Converts V8 script coverage to Istanbul-format file coverage.
 *
 * A faithful minimal port of the v8-to-istanbul algorithm:
 *  - builds a line index for the original source (with `c8 ignore` support)
 *  - remaps V8 range offsets through the source map to original positions
 *  - records one "statement" per line, one "branch" per block range and one
 *    "function" per V8 function
 *
 * Node.js >= 12 reports coverage offsets without the CJS wrapper, so no
 * wrapper-length adjustment is needed.
 */
import type { FileCoverage, RawSourceMap, V8ScriptCoverage } from './types.js'
export interface ConvertOptions {
  /** raw source map data for the script (from the source-map-cache) */
  sourceMap: RawSourceMap | null
  /**
   * the generated (transpiled) source to use for line slicing. c8 rebuilds
   * it from the V8 source-map-cache `lineLengths` when present, because the
   * cached lengths describe the source as it was executed. When null or
   * undefined the file is read from disk.
   */
  transpiledSource?: string | null
  /** reads a source file, null when it cannot be read */
  readSource: (p: string) => string | null
  /** when true, files failing this check are dropped after remapping */
  excludeAfterRemap?: (p: string) => boolean
}
/**
 * Converts one V8 script coverage to a set of Istanbul file coverages
 * (one per original source file).
 */
export declare const convertScript: (
  script: V8ScriptCoverage,
  opts: ConvertOptions,
) => FileCoverage[]
/**
 * Merges one FileCoverage into a map of FileCoverage keyed by path, using
 * istanbul-lib-coverage merge semantics (position-based matching, container
 * hit inheritance, `all` replacement).
 */
export declare const mergeFileCoverage: (map: Map<string, FileCoverage>, fc: FileCoverage) => void
