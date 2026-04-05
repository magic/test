import type { TestObject } from '../src/types.js'
export default (tests: TestObject) => {
  const g = globalThis as any
  g.beforeallTS = true
  g.testsBeforeallTS = tests
  return () => {
    delete g.beforeallTS
    delete g.testsBeforeallTS
  }
}
