import is from '@magic/types'
/**
 * Check if any test in the suite needs isolation (has before/after hooks)
 */
export const suiteNeedsIsolation = tests => {
  if (is.array(tests)) {
    return tests.some(test => is.function(test.before) || is.function(test.after))
  } else if (is.objectNative(tests)) {
    const testObj = tests
    return Object.values(testObj).some(test => {
      if (is.objectNative(test) && (is.function(test.before) || is.function(test.after))) {
        return true
      }
      if (is.objectNative(test) && test.tests) {
        return suiteNeedsIsolation(test.tests)
      }
      return false
    })
  }
  return false
}
