import is from '@magic/types'
import type { TestCollection } from '../types.ts'

import { suiteModifiesGlobals } from './globalCheck.js'

/**
 * Check if any test in the suite needs isolation (has before/after hooks OR modifies globals)
 */
export const suiteNeedsIsolation = (tests: TestCollection): boolean => {
  if (is.array(tests)) {
    return tests.some(test => is.function(test.before) || is.function(test.after))
  } else if (is.objectNative(tests)) {
    if (!is.objectNative(tests)) {
      return false
    }

    if (
      is.function(tests.before) ||
      is.function(tests.after) ||
      is.function(tests.beforeEach) ||
      is.function(tests.beforeAll) ||
      is.function(tests.afterAll)
    ) {
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

export const suiteBeforeAllModifiesGlobalState = (tests: TestCollection): boolean => {
  if (is.objectNative(tests)) {
    const t = tests
    if (is.function(t.beforeAll) && suiteModifiesGlobals(t)) {
      return true
    }
    if (t.tests && is.objectNative(t.tests)) {
      return suiteBeforeAllModifiesGlobalState(t.tests)
    }
  }
  return false
}
