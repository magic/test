import is from '@magic/types'
import { toCleanError } from '#src/lib/index.js'
import { isolation } from '../isolation.js'
import { runTestCore } from './runTestCore.js'
/**
 * Worker-side test execution: runs `before`, the shared runTestCore (fn +
 * expectation + timeout + after), and `afterCleanup` outside the isolation
 * scope. No error logging — worker output is not visible in the parent.
 */
export const runTestFnInWorker = async (test, key) => {
  const { before } = test
  let afterCleanupError = null
  const isolatedResult = await isolation.executeIsolated(key, async () => {
    let afterCleanup
    let innerAfterCleanupError = null
    if (is.function(before) || is.promise(before)) {
      try {
        const result = is.function(before) ? await before(test) : await before
        if (is.function(result)) {
          afterCleanup = result
        }
      } catch (e) {
        innerAfterCleanupError = toCleanError(e)
      }
    }
    const core = await runTestCore({
      key,
      test,
      invoke: () =>
        is.function(test.fn) ? Promise.resolve(test.fn({})) : Promise.resolve(test.fn),
    })
    return {
      result: core.result,
      pass: core.pass,
      exp: core.exp,
      expString: core.expString,
      afterCleanup,
      afterCleanupError: innerAfterCleanupError,
      afterError: core.afterError,
    }
  })
  if (isolatedResult.afterCleanup) {
    try {
      await isolatedResult.afterCleanup()
    } catch (e) {
      afterCleanupError = toCleanError(e)
    }
  }
  return {
    result: isolatedResult.result,
    pass: isolatedResult.pass,
    exp: isolatedResult.exp,
    expString: isolatedResult.expString,
    afterCleanupError: isolatedResult.afterCleanupError || afterCleanupError,
    afterError: isolatedResult.afterError,
  }
}
//# sourceMappingURL=runTestFnInWorker.js.map
