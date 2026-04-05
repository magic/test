import type { TestObject } from '../src/types.js'

export default (tests: TestObject): (() => void) => {
  const g = globalThis as any
  g.beforeAllTS = true
  g.testsBeforeAllTS = tests

  return () => {
    delete g.beforeAllTS
    delete g.testsBeforeAllTS
  }
}
