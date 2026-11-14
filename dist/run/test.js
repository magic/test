import is from '@magic/types'
import log from '@magic/log'
import { toCleanError, cleanFunctionString, getTestKey, ERRORS } from '../lib/index.js'
import { Store } from '../lib/store.js'
import { isolation } from './isolation.js'
import { runSuite } from './suite.js'
import { executeTest, prepareTest, runTestCore, testNeedsIsolation } from './lib/index.js'
import { beginTimerScope } from '../lib/dom/globals.js'
/**
 * Main-thread test execution: shared runTestCore + svelte component mounting
 * via executeTest, with error logging (unavailable in workers).
 */
const executeTestNoIsolation = async (
  test,
  key,
  componentFile,
  componentProps,
  componentContext,
) => {
  const logError = (code, info) => {
    if (code === ERRORS.E_TEST_FN) {
      info.component = componentFile
    }
    log.error(code, info)
  }
  return runTestCore({
    key,
    test,
    invoke: () => executeTest(test.fn, key, componentFile, componentProps, componentContext),
    logError,
  })
}
/**
 * Run a test or delegate to a suite.
 *
 * - If `test.fn` exists → executes the test and returns a `TestResult`.
 * - If only `test.tests` exists → delegates to {@link runSuite}, which returns a `Suite`.
 */
export const runTest = async (test, store, rawResults) => {
  const testKey = test.key || ''
  const testName = test.name || ''
  const testParent = test.parent || ''
  const { componentFile, componentProps, componentContext } = prepareTest(test)
  try {
    const { fn, name, pkg, before, parent, tests, info } = test
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
      log.error(ERRORS.E_TEST_NO_FN, {
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
    const needsIsolation = testNeedsIsolation(test)
    let isolatedResult
    // Per-test timer scope: everything this test schedules (before/fn/after
    // hooks, component mount, the runner's own test timeout) is cleared when
    // the test is done — success or failure — so leftover callbacks can't
    // fire into later tests or keep the process alive.
    const timerScope = beginTimerScope()
    try {
      isolatedResult = await timerScope.run(async () => {
        if (needsIsolation) {
          return await isolation.executeIsolated(key, async () => {
            let afterCleanup
            if (is.function(before) || is.promise(before)) {
              try {
                const result = is.function(before) ? await before(test) : await before
                if (is.function(result)) {
                  afterCleanup = result
                }
              } catch (e) {
                log.error(ERRORS.E_TEST_BEFORE, {
                  testKey: key,
                  testName: name,
                  parent,
                  error: toCleanError(e),
                })
              }
            }
            const execResult = await executeTestNoIsolation(
              test,
              key,
              componentFile,
              componentProps,
              componentContext,
            )
            return { ...execResult, afterCleanup }
          })
        }
        return await executeTestNoIsolation(
          test,
          key,
          componentFile,
          componentProps,
          componentContext,
        )
      })
      const afterCleanup = isolatedResult.afterCleanup
      if (is.function(afterCleanup)) {
        await timerScope.run(async () => {
          try {
            await afterCleanup()
          } catch (e) {
            log.error(ERRORS.E_TEST_AFTER, {
              testKey: key,
              testName: name,
              parent,
              error: toCleanError(e),
            })
          }
        })
      }
    } finally {
      // The test is done (result evaluated, afterCleanup run): clear whatever
      // timers it left behind. finally so failed tests get swept too.
      timerScope.end()
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
    const testResult = {
      result: isolatedResult.result,
      msg,
      pass: isolatedResult.pass,
      parent: parent || '',
      name,
      expect: isolatedResult.exp,
      expString: isolatedResult.expString,
      key,
      info,
      duration: isolatedResult.duration,
    }
    rawResults?.push(testResult)
    return testResult
  } catch (e) {
    log.error(ERRORS.E_TEST_FN, {
      testKey: testKey,
      testName: testName,
      parent: testParent,
      component: componentFile,
      error: toCleanError(e),
    })
  }
  return
}
//# sourceMappingURL=test.js.map
