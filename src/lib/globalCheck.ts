import is from '@magic/types'

const GLOBAL_MODIFICATION_RE = /(?:globalThis|window|global|self|process\.env)/

export const testModifiesGlobals = (test: {
  before?: (...args: unknown[]) => unknown
  after?: (...args: unknown[]) => unknown
}): boolean => {
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

export const suiteModifiesGlobals = (tests: unknown): boolean => {
  const t = tests as {
    beforeAll?: (...args: unknown[]) => unknown
    afterAll?: (...args: unknown[]) => unknown
    before?: (...args: unknown[]) => unknown
    after?: (...args: unknown[]) => unknown
    tests?: unknown
  }

  if (t.beforeAll) {
    const beforeAllStr = t.beforeAll.toString()
    if (GLOBAL_MODIFICATION_RE.test(beforeAllStr)) {
      return true
    }
  }

  if (t.afterAll) {
    const afterAllStr = t.afterAll.toString()
    if (GLOBAL_MODIFICATION_RE.test(afterAllStr)) {
      return true
    }
  }

  if (is.array(tests)) {
    return tests.some(test =>
      testModifiesGlobals(
        test as {
          before?: (...args: unknown[]) => unknown
          after?: (...args: unknown[]) => unknown
        },
      ),
    )
  }

  if (is.objectNative(tests)) {
    return Object.values(tests as Record<string, unknown>).some(test => {
      if (
        is.objectNative(test) &&
        testModifiesGlobals(
          test as {
            before?: (...args: unknown[]) => unknown
            after?: (...args: unknown[]) => unknown
          },
        )
      ) {
        return true
      }
      if (is.objectNative(test) && test.tests) {
        return suiteModifiesGlobals(test.tests)
      }
      return false
    })
  }

  return false
}

export const suiteBeforeAllModifiesGlobals = (tests: unknown): boolean => {
  const t = tests
  if (is.objectNative(t) && is.function(t.beforeAll)) {
    const beforeAllStr = t.beforeAll.toString()
    return GLOBAL_MODIFICATION_RE.test(beforeAllStr)
  }
  return false
}

export const suiteAfterAllModifiesGlobals = (tests: unknown): boolean => {
  const t = tests
  if (is.objectNative(t) && is.function(t.afterAll)) {
    const afterAllStr = t.afterAll.toString()
    return GLOBAL_MODIFICATION_RE.test(afterAllStr)
  }
  return false
}
