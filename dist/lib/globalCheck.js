import is from '@magic/types'
import { walkTests } from './analysis/testWalker.js'
const GLOBAL_MODIFICATION_RE = /(?:globalThis|window|global|self|process\.env)/
export const functionModifiesGlobals = fn => {
  if (!is.fn(fn)) {
    return false
  }
  return GLOBAL_MODIFICATION_RE.test(fn.toString())
}
export const testModifiesGlobals = test => {
  return [test.before, test.after, test.fn, test.expect].some(functionModifiesGlobals)
}
export const suiteModifiesGlobals = tests => {
  return walkTests(tests, test => {
    if (
      functionModifiesGlobals(test.before) ||
      functionModifiesGlobals(test.after) ||
      functionModifiesGlobals(test.fn)
    ) {
      return true
    }
    // Also check suite-level hooks
    if (functionModifiesGlobals(test.beforeAll) || functionModifiesGlobals(test.afterAll)) {
      return true
    }
    return false
  })
}
