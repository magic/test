import is from '@magic/types'

// Check if any test in the suite needs isolation
export const suiteNeedsIsolation = tests => {
  if (is.array(tests)) {
    return tests.some(test => is.function(test.before) || is.function(test.after))
  } else if (is.objectNative(tests)) {
    return Object.values(tests).some(test => {
      if (is.function(test.before) || is.function(test.after)) {
        return true
      }

      if (test.tests) {
        return suiteNeedsIsolation(test.tests)
      }

      return false
    })
  }

  return false
}
