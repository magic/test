import is from '@magic/types'
import type { Test, TestCollection, TestObject } from '../types.ts'

/**
 * Check if any test in the suite needs isolation (has before/after hooks)
 */
export const suiteNeedsIsolation = (tests: TestCollection): boolean => {
  if (is.array(tests)) {
    return tests.some(test => is.function(test.before) || is.function(test.after))
  } else if (is.objectNative(tests)) {
    const testObj = tests as TestObject
    return Object.values(testObj).some(test => {
      if (
        is.objectNative(test) &&
        (is.function((test as Test).before) || is.function((test as Test).after))
      ) {
        return true
      }

      if (is.objectNative(test) && (test as Test).tests) {
        return suiteNeedsIsolation((test as Test).tests as TestCollection)
      }

      return false
    })
  }

  return false
}
