import type { WrappedTest } from '../../types.ts'

export const testNeedsIsolation = (test: WrappedTest): boolean => {
  if (test.before || test.after) {
    return true
  }
  if (
    Object.hasOwn(test, '__isolate') &&
    (test as unknown as Record<string, unknown>).__isolate === true
  ) {
    return true
  }
  if (test.component) {
    return true
  }
  return false
}
