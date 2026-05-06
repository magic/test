import is from '@magic/types'
import type { TestCollection } from '../../types.ts'

export const suiteHasBeforeAllOrAfterAll = (tests: TestCollection): boolean => {
  if (is.object(tests) && !is.arr(tests)) {
    const hasBefore = 'beforeAll' in tests && is.fn(tests.beforeAll)
    const hasAfter = 'afterAll' in tests && is.fn(tests.afterAll)
    return hasBefore || hasAfter
  }
  return false
}
