import log from '@magic/log'

import { printPercent } from './printPercent.js'
import { readRunSummary } from './resultsFile.js'

import type { RunSummary } from './resultsFile.js'

/**
 * Formats the final run summary lines from a RunSummary.
 *
 * The "Ran ..." line is always last so the coverage table (printed by
 * stats.coverage before this) can precede it in the output.
 */
export const formatRunSummary = (summary: RunSummary): string[] => {
  const { all, pass, duration, totalDuration } = summary
  const percentage = all > 0 ? printPercent((pass / all) * 100) : printPercent(0)
  const lines: string[] = []
  // Show total time if it differs from test execution time (indicates discovery overhead)
  if (totalDuration && totalDuration !== duration) {
    lines.push(`Total time (including discovery): ${totalDuration}`)
  }
  lines.push(`Ran ${all} tests in ${duration}. Passed ${pass}/${all} ${percentage}%`)
  return lines
}

/**
 * Prints the run summary from the results file the unit.js child wrote.
 * Silently no-ops when the file is missing or unreadable (crash, Ctrl-C) so a
 * partial run still prints whatever coverage it produced.
 */
export const summary = (resultsFile: string): void => {
  const runSummary = readRunSummary(resultsFile)
  if (!runSummary) {
    return
  }
  const lines = formatRunSummary(runSummary)
  log(`\n${lines.join('\n')}`)
  log('')
}
