import fs from 'node:fs'
import path from 'node:path'

import is from '@magic/types'

/**
 * Env var t.ts sets on the unit.js child: instead of printing the final run
 * summary lines, the child writes the summary numbers to this file so the
 * parent can print them after the coverage report (the report needs the
 * child's V8 coverage data, which is only flushed at child exit).
 */
export const RESULTS_FILE_ENV = 'MAGIC_TEST_RESULTS_FILE'

export interface RunSummary {
  all: number
  pass: number
  /** formatted test-execution duration, e.g. "22.9s" */
  duration: string
  /** formatted total duration incl. discovery, '' when unavailable */
  totalDuration: string
}

/** Writes the run summary as JSON, creating parent directories as needed. */
export const writeRunSummary = (file: string, summary: RunSummary): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(summary))
}

/** Reads a run summary, null when the file is missing, corrupt or partial. */
export const readRunSummary = (file: string): RunSummary | null => {
  try {
    const data: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
    const d = is.objectNative(data) ? (data as Record<string, unknown>) : null
    if (d && is.int(d.all) && is.int(d.pass) && is.string(d.duration)) {
      return {
        all: d.all as number,
        pass: d.pass as number,
        duration: d.duration as string,
        totalDuration: is.string(d.totalDuration) ? (d.totalDuration as string) : '',
      }
    }
    return null
  } catch {
    return null
  }
}
