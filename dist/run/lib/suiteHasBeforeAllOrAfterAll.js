import is from '@magic/types'
export const suiteHasBeforeAllOrAfterAll = tests => {
  if (is.object(tests) && !is.arr(tests)) {
    return is.fn(tests.beforeAll) || is.fn(tests.afterAll)
  }
  return false
}
