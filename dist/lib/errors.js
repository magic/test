export const ERRORS = {
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
export const createError = (code, message) => {
  const err = new Error(message)
  err.code = code
  return err
}
