import log from '@magic/log'
import { getTestKey, cleanError, ERRORS } from '../../lib/index.ts'
import { createFailResult } from './index.ts'
import type { WrappedTest, TestResult } from '../../types.ts'

export const handleWorkerError = (
  testToRun: WrappedTest,
  error: unknown,
  rawResults: TestResult[],
): TestResult => {
  log.error(ERRORS.E_TEST_FN!, {
    testKey: testToRun.key || getTestKey(testToRun.pkg, testToRun.parent, testToRun.name),
    testName: testToRun.name,
    parent: testToRun.parent,
    error: cleanError(error),
  })
  const failResult = createFailResult(testToRun)
  rawResults.push(failResult)
  return failResult
}
