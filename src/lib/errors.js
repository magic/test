/**
 * @typedef {Record<string, string>} ErrorCodeMap
 */

/**
 * @typedef {Record<string, string | ((...args: any[]) => string)>} ErrorMessageMap
 */

/**
 * @typedef {Error & { code?: string }} CustomError
 */

/** @type {ErrorCodeMap} */
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

/** @type {ErrorMessageMap} */
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
 * @param {string} code
 * @param {string} message
 * @returns {CustomError}
 */
export const createError = (code, message) => {
  const err = /** @type {CustomError} */ (new Error(message))
  err.code = code
  return err
}

/**
 * Create an error from a code and optional data
 * @param {string} code
 * @param {any} data
 * @returns {CustomError}
 */
export const errorify = (code, data) => {
  const msgTemplate = ERROR_MESSAGES[code]
  let msg = ''

  if (typeof msgTemplate === 'function') {
    msg = msgTemplate(data)
  } else if (typeof msgTemplate === 'string') {
    msg = msgTemplate
  } else {
    msg = String(data)
  }

  return createError(code, msg)
}
