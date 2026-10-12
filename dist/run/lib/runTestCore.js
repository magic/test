import is from '@magic/types'
import { toCleanError, ERRORS } from '../../lib/index.js'
import { withSvelteKitStore } from '../../lib/sveltekit.js'
import { evaluateTestResult } from './evaluateTestResult.js'
import { getTestTimeout } from './getTestTimeout.js'
import { withTimeout } from './withTimeout.js'
/**
 * Shared test-execution core: the `runs` loop, expectation evaluation,
 * timeout, and after-hook handling used by BOTH the main-thread path
 * (run/test.ts) and the worker path (runTestFnInWorker.ts).
 *
 * Keeping this in one place ensures the two paths can't diverge.
 */
export const runTestCore = async options => {
  const { key, test, invoke, logError } = options
  const { after, expect, runs = 1, timeout } = test
  const timeoutMs = getTestTimeout(timeout)
  let result
  let exp
  let expString
  const results = []
  for (let i = 0; i < runs; i++) {
    let res
    try {
      // when the tested project has SvelteKit, run the test inside a mocked
      // request store so server hooks (sequence, error, getEvent, ...) work
      res = await withTimeout(Promise.resolve(withSvelteKitStore(invoke)), timeoutMs, key)
    } catch (e) {
      logError?.(ERRORS.E_TEST_FN, {
        testKey: key,
        testName: test.name,
        parent: test.parent,
        error: toCleanError(e),
      })
      results.push({ res, pass: false })
      continue
    }
    try {
      const evalResult = await evaluateTestResult(res, expect)
      const runPass = evalResult.pass
      results.push({ res, pass: runPass, exp: evalResult.exp, expString: evalResult.expString })
      if (!runPass) {
        result = res
        exp = evalResult.exp
        expString = evalResult.expString
      }
    } catch (e) {
      logError?.(ERRORS.E_TEST_EXPECT, {
        testKey: key,
        testName: test.name,
        parent: test.parent,
        error: toCleanError(e),
      })
      results.push({ res, pass: false })
    }
  }
  const pass = results.every(r => r.pass)
  if (pass && results.length > 0) {
    result = runs > 1 ? results.map(r => r.res) : results[0].res
    const lastExp = results[results.length - 1]
    exp = lastExp?.exp
    expString = lastExp?.expString
  }
  let afterError = null
  if (is.function(after)) {
    try {
      await after()
    } catch (e) {
      afterError = toCleanError(e)
      logError?.(ERRORS.E_TEST_AFTER, {
        testKey: key,
        testName: test.name,
        parent: test.parent,
        error: afterError,
      })
    }
  }
  return { result, pass, exp, expString, afterError }
}
//# sourceMappingURL=runTestCore.js.map
