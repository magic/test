import type { RunSummary } from './resultsFile.js'
/**
 * Formats the final run summary lines from a RunSummary.
 *
 * The "Ran ..." line is always last so the coverage table (printed by
 * stats.coverage before this) can precede it in the output.
 */
export declare const formatRunSummary: (summary: RunSummary) => string[]
/**
 * Prints the run summary from the results file the unit.js child wrote.
 * Silently no-ops when the file is missing or unreadable (crash, Ctrl-C) so a
 * partial run still prints whatever coverage it produced.
 */
export declare const summary: (resultsFile: string) => void
