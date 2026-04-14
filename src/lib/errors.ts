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

export const ERROR_MESSAGES = {
  E_EMPTY_SUITE: (test: string) => `${test} is not exporting tests.`,
  E_NO_TESTS: 'No test suites found.',
  E_TEST_NO_FN: (test: string) => `test.fn is not a function in ${test}`,
  E_TEST_EXPECT: (test: string, error: Error) => `Expect failed for ${test}: ${error}`,
  E_TEST_BEFORE: (test: string, error: Error) => `Before hook failed for ${test}: ${error}`,
  E_TEST_AFTER: (test: string, error: Error) => `After hook failed for ${test}: ${error}`,
  E_TEST_FN: (test: string, error: Error) => `Test function failed for ${test}: ${error}`,
  E_IMPORT: (msg: string) => `Failed to import: ${msg}`,
} as const

/**
 * Create an error with a code
 */
export const createError = (code: string, message: string): CustomError => {
  const err = new Error(message) as CustomError
  err.code = code
  return err
}
