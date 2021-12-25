import is from '@magic/types'
import log from '@magic/log'

import { cleanError, cleanFunctionString, getTestKey, stats } from '../lib/index.mjs'

const runTest = async test => {
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
        return await Promise.all(
          Object.entries(tests).map(
            async ([key, tests]) =>
              await runSuite({
                pkg,
                parent: name,
                name: key,
                tests,
              }),
          ),
        )
      }

      log.error('test.fn is not a function', test.key, test.info || '')
    }

    let after
    if (is.function(before)) {
      try {
        after = await before(test)
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
        if (is.function(fn)) {
          res = await fn()
        } else if (is.promise(fn)) {
          res = await fn
        } else {
          res = fn
        }
      } catch (e) {
        log.error('test.fn', key, ...cleanError(e))
      }

      try {
        if (is.function(expect)) {
          const combinedRes = [].concat(res)
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

      // loop is done
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
      if (parent !== name) {
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
      parent,
      name,
      expect: exp,
    }
  } catch (e) {
    log.error('test error', e)
  }
}

export default runTest
