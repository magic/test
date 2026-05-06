import is from '@magic/types'
import type { Test, TestCollection, TestObject } from '../types.ts'

const GLOBAL_MODIFICATION_RE = /(?:globalThis|window|global|self|process\.env)/

export const functionModifiesGlobals = (fn: unknown) => {
  if (!is.fn(fn)) {
    return false
  }

  const str = fn.toString()
  if (GLOBAL_MODIFICATION_RE.test(str)) {
    return true
  }

  return false
}

export const testModifiesGlobals = (test: Test): boolean => {
  if (functionModifiesGlobals(test.before)) {
    return true
  }
  if (functionModifiesGlobals(test.after)) {
    return true
  }

  if (functionModifiesGlobals(test.fn)) {
    return true
  }
  if (functionModifiesGlobals(test.expect)) {
    return true
  }

  return false
}

export const suiteModifiesGlobals = (tests: TestCollection | TestObject): boolean => {
  if (is.array(tests)) {
    return tests.some(test => testModifiesGlobals(test))
  } else if (is.objectNative(tests)) {
    if (functionModifiesGlobals(tests.beforeAll)) {
      return true
    }
    if (functionModifiesGlobals(tests.afterAll)) {
      return true
    }

    if (tests.tests && is.objectNative(tests.tests)) {
      return suiteModifiesGlobals(tests.tests)
    }
  }

  return false
}
