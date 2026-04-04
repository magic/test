import is from '@magic/types'
import type { TestCollection } from '../types.ts'

/**
 * Check if any test in the suite needs isolation (has before/after hooks)
 */
export const suiteNeedsIsolation = (tests: TestCollection): boolean => {
  if (is.array(tests)) {
    return tests.some(test => is.function((test as any).before) || is.function((test as any).after))
  } else if (is.objectNative(tests)) {
    return Object.values(tests).some(test => {
      if (
        is.objectNative(test) &&
        (is.function((test as any).before) || is.function((test as any).after))
      ) {
        return true
      }

      if (is.objectNative(test) && (test as any).tests) {
        return suiteNeedsIsolation((test as any).tests as TestCollection)
      }

      return false
    })
  }

  return false
}
