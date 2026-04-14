import type { TestObject } from '../src/types.js'

interface TestGlobals {
  beforeAllTS?: boolean
  testsBeforeAllTS?: TestObject
}

export default (tests: TestObject): (() => void) => {
  const g = globalThis as TestGlobals
  g.beforeAllTS = true
  g.testsBeforeAllTS = tests

  return () => {
    delete g.beforeAllTS
    delete g.testsBeforeAllTS
  }
}
