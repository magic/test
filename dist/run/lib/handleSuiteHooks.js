import is from '@magic/types'
/**
 * Handle suite-level beforeAll and afterAll hooks
 */
export const handleSuiteHooks = async tests => {
  let afterAllCleanup = () => {}
  if (
    tests &&
    is.object(tests) &&
    !is.arr(tests) &&
    'beforeAll' in tests &&
    is.function(tests.beforeAll)
  ) {
    if (is.fn(tests.beforeAll)) {
      const beforeResult = await tests.beforeAll()
      if (is.function(beforeResult)) {
        afterAllCleanup = beforeResult
      }
    }
  }
  return { afterAllCleanup }
}
