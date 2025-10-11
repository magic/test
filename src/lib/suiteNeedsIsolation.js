import is from '@magic/types'

/**
 * @typedef {Test[] | (Record<string, unknown> & TestsWithHooks)} TestCollection
 */

/**
 * Check if any test in the suite needs isolation (has before/after hooks)
 * @param {TestCollection} tests - Collection of tests to check
 * @returns {boolean} - True if any test needs isolation
 */
export const suiteNeedsIsolation = tests => {
  if (is.array(tests)) {
    return tests.some(test => is.function(test.before) || is.function(test.after))
  } else if (is.objectNative(tests)) {
    return Object.values(tests).some(test => {
      if (is.objectNative(test) && (is.function(test.before) || is.function(test.after))) {
        return true
      }

      if (is.objectNative(test) && test.tests) {
        return suiteNeedsIsolation(/** @type {TestCollection} */ (test.tests))
      }

      return false
    })
  }

  return false
}
