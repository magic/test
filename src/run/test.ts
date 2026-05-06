import is from '@magic/types'
import log from '@magic/log'

import { cleanError, cleanFunctionString, getTestKey, ERRORS } from '../lib/index.js'
import { Store } from '../lib/store.js'
import { isolation } from './isolation.js'
import { runSuite } from './suite.js'
import {
  evaluateTestResult,
  executeTest,
  getTestTimeout,
  prepareTest,
  withTimeout,
} from './lib/index.js'
import type { WrappedTest, TestResult, Suite } from '../types.js'

/**
 * Run a test or delegate to a suite.
 *
 * - If `test.fn` exists → executes the test and returns a `TestResult`.
 * - If only `test.tests` exists → delegates to {@link runSuite}, which returns a `Suite`.
 */
export const runTest = async (
  test: WrappedTest,
  store: Store,
  rawResults?: TestResult[],
): Promise<TestResult | Suite | undefined> => {
  const testKey = test.key || ''
  const testName = test.name || ''
  const testParent = test.parent || ''

  const { componentFile, componentProps } = prepareTest(test)

  try {
    const { fn, name, pkg, before, parent, expect, runs = 1, tests, info, timeout } = test

    // Determine timeout: per-test override takes precedence, then env var
    const timeoutMs = getTestTimeout(timeout)

    if (!is.ownProp(test, 'fn')) {
      if (is.object(test) && is.object(tests)) {
        return await runSuite({
          pkg,
          parent: name,
          name,
          tests,
          store,
          rawResults: rawResults ?? [],
        })
      }

      log.error(ERRORS.E_TEST_NO_FN!, {
        testKey: test.key,
        testName: name,
        parent: parent || '',
        pkg: pkg || '',
        info: test.info || '',
      })
      return
    }

    const msg = cleanFunctionString(fn)
    const key = test.key || getTestKey(pkg, parent, name)

    const isolatedResult = await isolation.executeIsolated(key, async () => {
      let afterCleanup

      if (is.function(before)) {
        try {
          const result = await before(test)
          if (is.function(result)) {
            afterCleanup = result as () => void | Promise<void>
          }
        } catch (e) {
          log.error(ERRORS.E_TEST_BEFORE!, {
            testKey: key,
            testName: name,
            parent,
            error: cleanError(is.error(e) ? e : new Error(String(e))),
          })
        }
      }

      let result
      let exp
      let expString
      let pass

      const results: { res: unknown; pass: boolean; exp?: unknown; expString?: unknown }[] = []
      for (let i = 0; i < runs; i++) {
        let res
        try {
          const testPromise = executeTest(
            fn,
            key,
            componentFile,
            componentProps as Record<string, unknown> | undefined,
          )
          res = await withTimeout(testPromise, timeoutMs, key)
        } catch (e) {
          log.error(ERRORS.E_TEST_FN!, {
            testKey: key,
            testName: name,
            parent,
            component: componentFile,
            error: cleanError(is.error(e) ? e : new Error(String(e))),
          })
          results.push({ res, pass: false })
          continue
        }

        try {
          const evalResult = await evaluateTestResult(res, expect)
          const runPass = evalResult.pass

          results.push({ res, pass: runPass, exp: evalResult.exp, expString: evalResult.expString })

          if (!runPass) {
            pass = false
            result = res
            exp = evalResult.exp
            expString = evalResult.expString
          }
        } catch (e) {
          log.error(ERRORS.E_TEST_EXPECT!, {
            testKey: key,
            testName: name,
            parent,
            error: cleanError(is.error(e) ? e : new Error(String(e))),
          })
          results.push({ res, pass: false })
        }
      }

      pass = results.every(r => r.pass)
      if (pass && results.length > 0) {
        result = runs > 1 ? results.map(r => r.res) : results[0]!.res
        const lastExp = results[results.length - 1]
        if (lastExp) {
          exp = lastExp.exp
          expString = lastExp.expString
        }
      }

      let afterError = null
      if (is.function(test.after)) {
        try {
          await test.after()
        } catch (e) {
          afterError = cleanError(is.error(e) ? e : new Error(String(e)))
          log.error(ERRORS.E_TEST_AFTER!, {
            testKey: key,
            testName: name,
            parent,
            error: afterError,
          })
        }
      }

      return { result, pass, exp, expString, afterCleanup, afterError }
    })

    if (is.function(isolatedResult.afterCleanup)) {
      try {
        await isolatedResult.afterCleanup()
      } catch (e) {
        log.error(ERRORS.E_TEST_AFTER!, {
          testKey: key,
          testName: name,
          parent,
          error: cleanError(is.error(e) ? e : new Error(String(e))),
        })
      }
    }

    if (!isolatedResult.pass) {
      let testName = name
      if (parent && parent !== name) {
        testName = `${parent}.${name}`
      }
      if (pkg !== parent && pkg !== name) {
        testName = `${pkg}.${testName}`
      }
      log.error('FAIL', testName, info)
    }

    const testResult: TestResult = {
      result: isolatedResult.result,
      msg,
      pass: isolatedResult.pass,
      parent: parent || '',
      name,
      expect: isolatedResult.exp,
      expString: isolatedResult.expString,
      key,
      info,
    }

    rawResults?.push(testResult)

    return testResult
  } catch (e) {
    log.error(ERRORS.E_TEST_FN!, {
      testKey: testKey,
      testName: testName,
      parent: testParent,
      component: componentFile,
      error: cleanError(is.error(e) ? e : new Error(String(e))),
    })
  }

  return
}
