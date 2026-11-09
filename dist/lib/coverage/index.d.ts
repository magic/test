/**
 * Local replacement for c8.
 *
 * Reads the V8 coverage JSON files Node.js writes to NODE_V8_COVERAGE,
 * merges them, remaps them through the source maps Node cached in the
 * same files and prints a text report. No external dependencies.
 */
import type { CoverageOptions, FileCoverage } from './types.js'
/**
 * Builds the merged Istanbul-style coverage map from the V8 coverage data in
 * tempDir (one FileCoverage per reportable original file).
 */
export declare const buildCoverageMap: (opts: CoverageOptions) => Promise<Map<string, FileCoverage>>
