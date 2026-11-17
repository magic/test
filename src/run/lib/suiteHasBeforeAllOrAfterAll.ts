import type { TestCollection } from '../../types.js'

import is from '@magic/types'

export const suiteHasBeforeAllOrAfterAll = (tests: TestCollection): boolean => {
  if (is.object(tests) && !is.arr(tests)) {
    return is.fn(tests.beforeAll) || is.fn(tests.afterAll)
  }
  return false
}
