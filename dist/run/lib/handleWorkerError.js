import log from '@magic/log'
import { getTestKey, cleanError, ERRORS } from '../../lib/index.js'
import { createFailResult } from './index.js'
export const handleWorkerError = (testToRun, error, rawResults) => {
  log.error(ERRORS.E_TEST_FN, {
    testKey: testToRun.key || getTestKey(testToRun.pkg, testToRun.parent, testToRun.name),
    testName: testToRun.name,
    parent: testToRun.parent,
    error: cleanError(error),
  })
  const failResult = createFailResult(testToRun)
  rawResults.push(failResult)
  return failResult
}
