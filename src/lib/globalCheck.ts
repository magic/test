import is from '@magic/types'
import type { TestCollection, TestObject } from '../types.ts'

const GLOBAL_MODIFICATION_RE = /(?:globalThis|window|global|self|process\.env)/

interface HasTestHooks {
  before?: { toString(): string }
  after?: { toString(): string }
}

export const testModifiesGlobals = (test: HasTestHooks): boolean => {
  if (is.function(test.before)) {
    const beforeStr = test.before.toString()
    if (GLOBAL_MODIFICATION_RE.test(beforeStr)) {
      return true
    }
  }

  if (is.function(test.after)) {
    const afterStr = test.after.toString()
    if (GLOBAL_MODIFICATION_RE.test(afterStr)) {
      return true
    }
  }

  return false
}

export const suiteModifiesGlobals = (tests: TestCollection | TestObject): boolean => {
  if (is.array(tests)) {
    return tests.some(test => testModifiesGlobals(test))
  } else {
    if (tests.beforeAll) {
      const beforeAllStr = tests.beforeAll.toString()
      if (GLOBAL_MODIFICATION_RE.test(beforeAllStr)) {
        return true
      }
    }
    if (tests.afterAll) {
      const afterAllStr = tests.afterAll.toString()
      if (GLOBAL_MODIFICATION_RE.test(afterAllStr)) {
        return true
      }
    }
    if (tests.tests) {
      return suiteModifiesGlobals(tests.tests)
    }
  }

  return false
}

export const suiteBeforeAllModifiesGlobals = (tests: TestCollection | TestObject): boolean => {
  if (is.objectNative(tests)) {
    const t = tests as TestObject
    if (is.function(t.beforeAll)) {
      const beforeAllStr = t.beforeAll.toString()
      return GLOBAL_MODIFICATION_RE.test(beforeAllStr)
    }
  }
  return false
}

export const suiteAfterAllModifiesGlobals = (tests: TestCollection | TestObject): boolean => {
  if (is.objectNative(tests)) {
    const t = tests as TestObject
    if (is.function(t.afterAll)) {
      const afterAllStr = t.afterAll.toString()
      return GLOBAL_MODIFICATION_RE.test(afterAllStr)
    }
  }
  return false
}
