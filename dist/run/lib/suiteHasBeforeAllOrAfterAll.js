import is from '@magic/types'
export const suiteHasBeforeAllOrAfterAll = tests => {
  if (is.object(tests) && !is.arr(tests)) {
    const hasBefore = 'beforeAll' in tests && is.fn(tests.beforeAll)
    const hasAfter = 'afterAll' in tests && is.fn(tests.afterAll)
    return hasBefore || hasAfter
  }
  return false
}
