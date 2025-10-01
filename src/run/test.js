import is from '@magic/types'
import log from '@magic/log'

import { cleanError, cleanFunctionString, getTestKey, stats } from '../lib/index.js'
import { isolation } from './isolation.js'
import { runSuite } from './suite.js'

/** @typedef {import('./suite.js').Suite} Suite */

/**
 * Definition of a single test (input before execution).
 *
 * @typedef {object} Test
 * @property {string} name - The test name.
 * @property {string} [pkg] - The package this test belongs to.
 * @property {string} [parent] - The parent suite/group name.
 * @property {string} [info] - Additional information about the test.
 * @property {string} [key] - A unique identifier for the test.
 *
 * @property {Function | Promise<unknown> | string | boolean | number | Record<string, unknown> | unknown[]} [fn] -
 *   The test function, a promise, or a direct value to evaluate.
 *
 * @property {Function | Promise<unknown> | unknown} [expect] -
 *   The expected value, or a function/promise that produces it.
 *
 * @property {Function | Promise<unknown> | unknown} [is] -
 *   Alias for `expect`.
 *
 * @property {number} [runs=1] - Number of times to run the test.
 *
 * @property {Record<string, Test> | Test[]} [tests] -
 *   Nested tests or child suites.
 *
 * @property {(test: Test) => (void | Function | Promise<void | Function>)} [before] -
 *   Hook executed before running the test.
 *   Can return a cleanup function.
 *
 * @property {() => (void | Promise<void>)} [after] -
 *   Hook executed after the test finishes.
 */

/**
 * @typedef {object} TestResult
 * @property {unknown} result - The actual output of the test.
 * @property {string} msg - Cleaned stringified version of the test function.
 * @property {boolean} pass - Whether the test passed.
 * @property {string} parent - The parent suite/group name.
 * @property {string} name - The test name.
 * @property {unknown} expect - The expected value (evaluated).
 * @property {string | unknown} expString - Stringified expectation.
 * @property {string} key - Unique test key.
 * @property {string} [info] - Extra metadata or documentation.
 */

/**
 * Run a test or delegate to a suite.
 *
 * - If `test.fn` exists → executes the test and returns a `TestResult`.
 * - If only `test.tests` exists → delegates to {@link runSuite}, which returns a `Suite`.
 *
 * @param {Test} test - The test definition.
 * @returns {Promise<TestResult | Suite | undefined | void>} The result object or undefined on error.
 */
export const runTest = async test => {
  try {
    // expect can be undefined, we set expect to true to provide a default for tests
    if (!is.ownProp(test, 'expect')) {
      // alternative name for expect
      if (is.ownProp(test, 'is')) {
        test.expect = test.is
      } else {
        test.expect = true
      }
    }

    const { fn, name, pkg, before, parent, expect, runs = 1, tests, info } = test

    if (!is.ownProp(test, 'fn')) {
      if (is.object(test) && is.object(tests)) {
        return await runSuite({
          pkg,
          parent: name,
          name,
          tests,
        })
      }

      log.error('test.fn is not a function', test.key, test.info || '')
      return
    }

    /** @type {(() => (void | Promise<void>)) | void | undefined} */
    let after
    if (is.function(before)) {
      try {
        const result = await before(test)
        if (is.function(result)) {
          after = /** @type {() => (void | Promise<void>)} */ (result)
        }
      } catch (e) {
        log.error('test.before', test.before, e)
      }
    }

    let result
    let exp
    let expString
    const msg = cleanFunctionString(fn)
    const key = getTestKey(pkg, parent, name)
    let pass = false
    let res

    for (let i = 0; i < runs; i++) {
      try {
        if (is.function(fn) || is.promise(fn)) {
          await isolation.executeIsolated(key, async () => {
            if (is.function(fn)) {
              res = await fn()
            } else {
              res = await fn
            }
          })
        } else {
          res = fn
        }
      } catch (e) {
        log.error('test.fn', key, cleanError(/** @type {Error} */ (e)))
      }

      try {
        if (is.function(expect)) {
          /** @type {unknown[]} */
          const combinedRes = [].concat(/** @type {any} */ (res))
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

        if (!pass) {
          result = res
          // abort the run loop if the first iteration fails
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

    if (is.function(after)) {
      try {
        await after()
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

    stats.test({
      parent,
      name,
      pass,
      pkg,
    })

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
