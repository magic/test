import is from '@magic/types'
import type { CustomError } from '@magic/error'

export const ERRORS: Record<string, string> = {
  E_EMPTY_SUITE: 'E_EMPTY_SUITE',
  E_RUN_SUITE_UNKNOWN: 'E_RUN_SUITE_UNKNOWN',
  E_TEST_NO_FN: 'E_TEST_NO_FN',
  E_TEST_EXPECT: 'E_TEST_EXPECT',
  E_TEST_BEFORE: 'E_TEST_BEFORE',
  E_TEST_AFTER: 'E_TEST_AFTER',
  E_TEST_FN: 'E_TEST_FN',
  E_NO_TESTS: 'E_NO_TESTS',
  E_IMPORT: 'E_IMPORT',
  E_MAGIC_TEST: 'E_MAGIC_TEST',
}

export const ERROR_MESSAGES: Record<string, string | ((...args: unknown[]) => string)> = {
  E_EMPTY_SUITE: test => `${test} is not exporting tests.`,
  E_NO_TESTS: 'No test suites found.',
  E_TEST_NO_FN: test => `test.fn is not a function in ${test}`,
  E_TEST_EXPECT: (test, error) => `Expect failed for ${test}: ${error}`,
  E_TEST_BEFORE: (test, error) => `Before hook failed for ${test}: ${error}`,
  E_TEST_AFTER: (test, error) => `After hook failed for ${test}: ${error}`,
  E_TEST_FN: (test, error) => `Test function failed for ${test}: ${error}`,
  E_IMPORT: msg => `Failed to import: ${msg}`,
}

/**
 * Create an error with a code
 */
export const createError = (code: string, message: string): CustomError => {
  const err = new Error(message) as CustomError
  err.code = code
  return err
}

/**
 * Create an error from a code and optional data
 */
export const errorify = (code: string, data: unknown): CustomError => {
  const msgTemplate = ERROR_MESSAGES[code]
  let msg = ''

  if (is.fn(msgTemplate)) {
    msg = msgTemplate(data)
  } else if (is.string(msgTemplate)) {
    msg = msgTemplate
  } else {
    msg = String(data)
  }

  return createError(code, msg)
}
