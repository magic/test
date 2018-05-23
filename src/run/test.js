const is = require('@magic/types')
const log = require('@magic/log')

const { cleanError, cleanFunctionString, stats } = require('../lib')

const getKey = (pkg, parent, name) => {
  let key = ''
  if (parent && parent !== pkg) {
    key = `${pkg}`
  }
  if (parent && parent !== name) {
    if (parent.indexOf('/') !== 0 && parent !== pkg) {
      parent = `.${parent}`
    }
    key += `${parent}`
  }

  if (name) {
    if (parent && parent !== name && parent !== pkg && name.indexOf('/') !== 0) {
      key += '#'
    } else if (name.indexOf('/') !== 0) {
      name = `/${name}`
    }

    key += name
  }
  return key
}

const runTest = async test => {
  // could be undefined but set
  if (!test.hasOwnProperty('expect')) {
    test.expect = true
  }

  const { fn, name, pkg, before, parent, expect, runs = 1 } = test

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
          }
        }),
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

  const key = getKey(pkg, parent, name)

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
        if (
          exp &&
          res &&
          typeof exp.toString === 'function' &&
          typeof res.toString === 'function'
        ) {
          pass = exp.toString() === res.toString()
        } else {
          pass = exp === res
        }
      }
      if (!pass) {
        result = res
        break
      }
    } catch (e) {
      log.error('test.expect', key, e)
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

module.exports = runTest
