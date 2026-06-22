import is from '@magic/types'
import { walkTests } from './analysis/testWalker.js'
/**
 * Check if any test in the suite needs isolation (has before/after hooks OR modifies globals)
 */
export const suiteNeedsIsolation = tests => {
  return walkTests(tests, test => {
    if (
      is.function(test.before) ||
      is.function(test.after) ||
      is.function(test.beforeEach) ||
      is.function(test.afterEach)
    ) {
      return true
    }
    return false
  })
}
