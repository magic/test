import { buildCoverageMap } from '../coverage/index.js'
import { printTextReport } from '../coverage/text.js'

import type { CoverageOptions } from '../coverage/types.js'

export type { CoverageOptions }

/**
 * Prints the text coverage report from the V8 coverage data in opts.tempDir.
 *
 * Must run in the parent of the instrumented process: Node flushes
 * NODE_V8_COVERAGE at process exit, so the child that ran the tests cannot
 * read its own coverage.
 */
export const coverage = async (opts: CoverageOptions): Promise<void> => {
  const files = await buildCoverageMap(opts)

  printTextReport(files, {
    cwd: opts.cwd,
    color: opts.color,
    maxCols: opts.maxCols,
  })
}
