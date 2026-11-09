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
/** Writes the run summary as JSON, creating parent directories as needed. */
export const writeRunSummary = (file, summary) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(summary))
}
/** Reads a run summary, null when the file is missing, corrupt or partial. */
export const readRunSummary = file => {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    const d = is.objectNative(data) ? data : null
    if (d && is.int(d.all) && is.int(d.pass) && is.string(d.duration)) {
      return {
        all: d.all,
        pass: d.pass,
        duration: d.duration,
        totalDuration: is.string(d.totalDuration) ? d.totalDuration : '',
      }
    }
    return null
  } catch {
    return null
  }
}
//# sourceMappingURL=resultsFile.js.map
