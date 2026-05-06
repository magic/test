import log from '@magic/log'

import type { TestResult } from '../../types.ts'

export const processWorkerResults = (
  results: TestResult[],
  rawResults: TestResult[],
  logger: typeof log.warn = log.warn,
): TestResult[] => {
  for (const r of results) {
    rawResults.push(r)

    if (r.afterCleanupError) {
      logger('afterCleanup error in', r.name, r.afterCleanupError)
    }
    if (r.afterError) {
      logger('after error in', r.name, r.afterError)
    }
  }
  return results
}
