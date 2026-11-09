/**
 * Text coverage reporter.
 *
 * A faithful port of istanbul's `text` reporter (istanbul-reports) on top of
 * the `pkg` summarizer (istanbul-lib-report): a flat list of directory nodes
 * (only the immediate parents of files) with the common parent stripped,
 * truncated percentages, and istanbul's exact uncovered-line ranges.
 */
import type { FileCoverage } from './types.js'
/**
 * Renders the coverage table and writes it to stdout.
 */
export declare const printTextReport: (
  files: Map<string, FileCoverage>,
  opts?: {
    cwd?: string
    color?: boolean
    maxCols?: number
  },
) => void
