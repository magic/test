import is from '@magic/types'
import { walkTests } from './analysis/testWalker.ts'
import type { Test, TestCollection, TestObject } from '../types.ts'

const GLOBAL_MODIFICATION_RE = /(?:globalThis|window|global|self|process\.env)/

export const functionModifiesGlobals = (fn: unknown): boolean => {
  if (!is.fn(fn)) {
    return false
  }
  return GLOBAL_MODIFICATION_RE.test(fn.toString())
}

export const testModifiesGlobals = (test: Test): boolean => {
  return [test.before, test.after, test.fn, test.expect].some(functionModifiesGlobals)
}

export const suiteModifiesGlobals = (tests: TestCollection | TestObject): boolean => {
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
