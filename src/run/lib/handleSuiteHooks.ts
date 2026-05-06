import is from '@magic/types'

import type { TestCollection, CleanupResult } from '../../types.ts'

/**
 * Handle suite-level beforeAll and afterAll hooks
 */
export const handleSuiteHooks = async (tests: TestCollection): Promise<CleanupResult> => {
  let afterAllCleanup: () => unknown = () => {}

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
        afterAllCleanup = beforeResult as () => unknown
      }
    }
  }

  return { afterAllCleanup }
}
