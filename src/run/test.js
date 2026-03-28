import is from '@magic/types'
import log from '@magic/log'

import { cleanError, cleanFunctionString, getTestKey, stats, createStore } from '../lib/index.js'
import { Store } from '../lib/store.js'
import { isolation } from './isolation.js'
import { runSuite } from './suite.js'

/**
 * Prepare test by setting defaults and extracting component props
 * @param {Test} test - The test definition
 * @returns {{ componentFile?: string, componentProps?: Record<string, unknown> }}
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
      componentProps: explicitProps || /** @type {Record<string, unknown>} */ ({}),
    }
  }

  if (is.array(componentProp)) {
    return {
      componentFile: componentProp[0],
      componentProps: componentProp[1] || /** @type {Record<string, unknown>} */ ({}),
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
      return await /** @type {Function} */ (fn)({ target, component: instance, unmount })
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
 * @returns {Promise<{ pass: boolean, exp: unknown, expString: unknown }>}
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
 * @returns {Promise<TestResult | Suite | undefined | void>} The result object or undefined on error.
 */
export const runTest = async (test, store = createStore()) => {
  try {
    const { componentFile, componentProps } = prepareTest(test)

    const { fn, name, pkg, before, parent, expect, runs = 1, tests, info } = test

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

      log.error('test.fn is not a function', test.key, test.info || '')
      return
    }

    const msg = cleanFunctionString(fn)
    const key = getTestKey(pkg, parent, name)

    /** @type {(() => (void | Promise<void>)) | void | undefined} */
    let afterCleanup
    if (is.function(before)) {
      try {
        const result = await before(test)
        if (is.function(result)) {
          afterCleanup = /** @type {() => (void | Promise<void>)} */ (result)
        }
      } catch (e) {
        log.error('test.before', test.before, e)
      }
    }

    let result
    let exp
    let expString
    let pass = false
    let res

    for (let i = 0; i < runs; i++) {
      try {
        res = await executeTest(
          fn,
          key,
          componentFile,
          /** @type {Record<string, unknown> | undefined} */ (componentProps),
        )
      } catch (e) {
        log.error('test.fn', key, cleanError(/** @type {Error} */ (e)))
      }

      try {
        const evalResult = await evaluateResult(res, expect)
        pass = evalResult.pass
        exp = evalResult.exp
        expString = evalResult.expString

        if (!pass) {
          result = res
          break
        }
      } catch (e) {
        log.error('E_TEST_EXPECT', key, e)
      }

      if (i >= runs - 1) {
        pass = true
        result = res
      }
    }

    if (is.function(afterCleanup)) {
      try {
        await afterCleanup()
      } catch (e) {
        log.error('test.after', key, e)
      }
    }

    if (is.function(test.after)) {
      try {
        await test.after()
      } catch (e) {
        log.error('test.after', key, e)
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
    log.error('test error', e)
  }
}
