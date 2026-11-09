/**
 * Env var t.ts sets on the unit.js child: instead of printing the final run
 * summary lines, the child writes the summary numbers to this file so the
 * parent can print them after the coverage report (the report needs the
 * child's V8 coverage data, which is only flushed at child exit).
 */
export declare const RESULTS_FILE_ENV = 'MAGIC_TEST_RESULTS_FILE'
export interface RunSummary {
  all: number
  pass: number
  /** formatted test-execution duration, e.g. "22.9s" */
  duration: string
  /** formatted total duration incl. discovery, '' when unavailable */
  totalDuration: string
}
/** Writes the run summary as JSON, creating parent directories as needed. */
export declare const writeRunSummary: (file: string, summary: RunSummary) => void
/** Reads a run summary, null when the file is missing, corrupt or partial. */
export declare const readRunSummary: (file: string) => RunSummary | null
