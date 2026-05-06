import is from '@magic/types'
import type { TestCollection } from '../types.ts'

/**
 * Check if any test in the suite needs isolation (has before/after hooks)
 */
export const suiteNeedsIsolation = (tests: TestCollection): boolean => {
  if (is.array(tests)) {
    return tests.some(test => is.function(test.before) || is.function(test.after))
  } else if (is.objectNative(tests)) {
    if (!is.objectNative(tests)) {
      return false
    }

    if (is.function(tests.before) || is.function(tests.after)) {
      return true
    }
    if (tests.tests && is.objectNative(tests.tests)) {
      return suiteNeedsIsolation(tests.tests)
    }
    if (tests.nested && is.objectNative(tests.nested)) {
      return suiteNeedsIsolation(tests.nested)
    }
  }

  return false
}
