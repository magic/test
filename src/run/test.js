import is from '@magic/types'
import log from '@magic/log'

import {
  cleanError,
  cleanFunctionString,
  getTestKey,
  stats,
  createStore,
  ERRORS,
} from '../lib/index.js'
import { Store } from '../lib/store.js'
import { isolation } from './isolation.js'
import { runSuite } from './suite.js'

const DEFAULT_TEST_TIMEOUT = 10000

/**
 * Wrap a promise with a timeout
 * @param {Promise<unknown>} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} testKey - Test key for error message
 * @returns {Promise<unknown>}
 */
const withTimeout = (promise, timeoutMs, testKey) => {
  if (!timeoutMs || timeoutMs <= 0) {
    return promise
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Test timed out after ${timeoutMs}ms: ${testKey}`))
    }, timeoutMs)

    promise
      .then(result => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch(err => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

/**
 * Prepare test by setting defaults and extracting component props
 * @param {Test} test - The test definition
 * @returns {{ componentFile?: string, componentProps?: ComponentProps }}
 */
const prepareTest = test => {
  if (!is.ownProp(test, 'expect')) {
    if (is.ownProp(test, 'is')) {
      test.expect = test.is
    } else {
      test.expect = true
    }
  }

  const { component: componentProp, props: explicitProps } = test

  if (!componentProp) {
    return {}
  }

  if (is.string(componentProp)) {
    return {
      componentFile: componentProp,
      componentProps: explicitProps || /** @type {ComponentProps} */ ({}),
    }
  }

  if (is.array(componentProp)) {
    return {
      componentFile: componentProp[0],
      componentProps: componentProp[1] || /** @type {ComponentProps} */ ({}),
    }
  }

  throw new Error('component must be a string or [string, props]')
}

/**
 * Execute a single test function with proper isolation
 * @param {Function | Promise<unknown> | unknown} fn - Test function or value
 * @param {string} key - Test key for isolation
 * @param {string} [componentFile] - Svelte component path
 * @param {Record<string, unknown>} [componentProps] - Props for Svelte component
 * @returns {Promise<unknown>}
 */
const executeTest = async (fn, key, componentFile, componentProps) => {
  if (componentFile) {
    const { mount } = await import('../lib/svelte/mount.js')
    const {
      target,
      component: instance,
      unmount,
    } = await mount(componentFile, { props: componentProps })

    try {
      if (is.function(fn)) {
        return await fn({ target, component: instance, unmount })
      }
    } finally {
      await unmount()
      target.remove()
    }
  }

  if (is.function(fn) || is.promise(fn)) {
    return await isolation.executeIsolated(key, async () => {
      if (is.function(fn)) {
        return await fn()
      }
      if (is.promise(fn)) {
        return await fn
      }
    })
  }

  return fn
}

/**
 * Evaluate test result against expected value
 * @param {unknown} res - Actual result
 * @param {unknown} expect - Expected value (can be function, promise, or value)
 * @returns {Promise<EvaluateResult>}
 */
const evaluateResult = async (res, expect) => {
  let exp
  let expString
  let pass = false

  if (is.function(expect)) {
    const combinedRes = [res]
    if (combinedRes.length > 1) {
      res = combinedRes
    }
    exp = await expect(res)
    expString = cleanFunctionString(expect)
    if (res !== true) {
      pass = exp === res || exp === true
    }
  } else if (is.promise(expect)) {
    exp = await expect
    expString = expect
  } else {
    exp = expect
    expString = expect
  }

  if (!pass) {
    if (is.undefined(exp)) {
      pass = exp === res
    } else if (is.sameType(exp, res)) {
      pass = is.deep.equal(exp, res)
    }
  }

  return { pass, exp, expString }
}

/**
 * Run a test or delegate to a suite.
 *
 * - If `test.fn` exists → executes the test and returns a `TestResult`.
 * - If only `test.tests` exists → delegates to {@link runSuite}, which returns a `Suite`.
 *
 * @param {Test} test - The test definition.
 * @param {Store} [store] - The store instance.
 * @returns {Promise<TestResult | Suite | undefined>} The result object or undefined on error.
 */
export const runTest = async (test, store = createStore()) => {
  const testKey = test.key || ''
  const testName = test.name || ''
  const testParent = test.parent || ''
  const testPkg = test.pkg || ''

  try {
    const { componentFile, componentProps } = prepareTest(test)

    const { fn, name, pkg, before, parent, expect, runs = 1, tests, info, timeout } = test

    // Determine timeout: per-test override takes precedence
    const timeoutMs = timeout ? timeout > 0 ? timeout : DEFAULT_TEST_TIMEOUT : DEFAULT_TEST_TIMEOUT

    if (!is.ownProp(test, 'fn')) {
      if (is.object(test) && is.object(tests)) {
        return await runSuite({
          pkg,
          parent: name,
          name,
          tests,
          store,
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

    /** @type {(() => (void | Promise<void>)) | void | undefined} */
    let afterCleanup
    if (is.function(before)) {
      try {
        const result = await before(test)
        if (is.function(result)) {
          afterCleanup = /** @type {() => (void | Promise<void>)} */ (result)
        }
      } catch (e) {
        log.error(ERRORS.E_TEST_BEFORE, {
          testKey: key,
          testName: name,
          parent,
          error: cleanError(/** @type {Error} */ (e)),
        })
      }
    }

    let result
    let exp
    let expString
    let pass = false

    const results = []
    for (let i = 0; i < runs; i++) {
      let res
      try {
        const testPromise = executeTest(
          fn,
          key,
          componentFile,
          /** @type {Record<string, unknown> | undefined} */ (componentProps),
        )
        res = await withTimeout(testPromise, timeoutMs, key)
      } catch (e) {
        log.error(ERRORS.E_TEST_FN, {
          testKey: key,
          testName: name,
          parent,
          error: cleanError(/** @type {Error} */ (e)),
        })
        results.push({ res, pass: false })
        continue
      }

      try {
        const evalResult = await evaluateResult(res, expect)
        const runPass = evalResult.pass

        results.push({ res, pass: runPass, exp: evalResult.exp, expString: evalResult.expString })

        if (!runPass) {
          pass = false
          result = res
          exp = evalResult.exp
          expString = evalResult.expString
        }
      } catch (e) {
        log.error(ERRORS.E_TEST_EXPECT, {
          testKey: key,
          testName: name,
          parent,
          error: cleanError(/** @type {Error} */ (e)),
        })
        results.push({ res, pass: false })
      }
    }

    pass = results.every(r => r.pass)
    if (pass) {
      result = runs > 1 ? results.map(r => r.res) : results[0].res
      const lastExp = results[results.length - 1]
      exp = lastExp.exp
      expString = lastExp.expString
    }

    if (is.function(afterCleanup)) {
      try {
        await afterCleanup()
      } catch (e) {
        log.error(ERRORS.E_TEST_AFTER, {
          testKey: key,
          testName: name,
          parent,
          error: cleanError(/** @type {Error} */ (e)),
        })
      }
    }

    if (is.function(test.after)) {
      try {
        await test.after()
      } catch (e) {
        log.error(ERRORS.E_TEST_AFTER, {
          testKey: key,
          testName: name,
          parent,
          error: cleanError(/** @type {Error} */ (e)),
        })
      }
    }

    if (!pass) {
      let testName = name
      if (parent && parent !== name) {
        testName = `${parent}.${name}`
      }
      if (pkg !== parent && pkg !== name) {
        testName = `${pkg}.${testName}`
      }
      log.error('FAIL', testName, info)
    }

    stats.test(
      {
        parent,
        name,
        pass,
        pkg,
      },
      store,
    )

    return {
      result,
      msg,
      pass,
      parent: parent || '',
      name,
      expect: exp,
      expString,
      key,
      info,
    }
  } catch (e) {
    log.error(ERRORS.E_TEST_FN, {
      testKey: testKey,
      testName: testName,
      parent: testParent,
      error: cleanError(/** @type {Error} */ (e)),
    })
  }

  return
}
