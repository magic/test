import is from '@magic/types'
import type { TestCollection } from '#src/types.js'

export const suiteHasBeforeAllOrAfterAll = (tests: TestCollection): boolean => {
  if (is.object(tests) && !is.arr(tests)) {
    return is.fn(tests.beforeAll) || is.fn(tests.afterAll)
  }
  return false
}
