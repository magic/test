import is from '@magic/types'
import { default as log } from '@magic/log'
import tags from '@magic/tags'

import { cleanError, cleanFunctionString, getTestKey, stats } from '../lib/index.mjs'

const runTest = async test => {
  // could be undefined, we expect true to provide a default
  if (!test.hasOwnProperty('expect')) {
    test.expect = true
  }

  const { fn, name, pkg, before, html, parent, expect, runs = 1 } = test

  if (!test.hasOwnProperty('fn')) {
    if (is.object(test) && is.object(test.tests)) {
      const testNames = Object.keys(test.tests)
      return Promise.all(
        Object.entries(test.tests).map(async ([key, tests]) => {
          try {
            await runSuite({
              parent: name,
              name: key,
              tests,
            })
          } catch (e) {
            log.error('Suite:', key, ...cleanError(e))
            process.exit(1)
          }
        }),
      )
    }

    log.error('test.fn is not a function', test.key, test.info || '')
  }

  if (html) {
    tags.map(tag => {
      global[tag] = (...args) => [tag, ...args]
    })

    global.CHECK_PROPS = () => {}
  }

  let after
  if (is.function(before)) {
    try {
      after = await before(test)
    } catch (e) {
      log.error('test.before', test.before, e)
      process.exit(1)
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
      process.exit(1)
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
        } else if (typeof exp === typeof res) {
          pass = is.deep.equal(exp, res)
        }
      }

      if (!pass) {
        result = res
        break
      }
    } catch (e) {
      log.error('test.expect', key, e)
      process.exit(1)
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
      process.exit(1)
    }
  }

  if (is.function(test.after)) {
    try {
      await test.after()
    } catch (e) {
      log.error('test.after', key, e)
      process.exit(1)
    }
  }

  const stat = Object.assign({}, test, {
    pkg,
    key,
    expect: exp,
    pass,
    msg,
    result,
    expString,
  })

  stats.test(stat)

  return {
    result,
    msg,
    pass,
    parent,
    name,
    expect: exp,
  }
}

export default runTest
