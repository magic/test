import type { TestObject } from '../src/types.js'

export default (tests: TestObject): (() => void) => {
  ;(globalThis as any).before = true
  ;(globalThis as any).tests = tests

  return () => {
    delete (globalThis as any).before
    delete (globalThis as any).tests
  }
}
