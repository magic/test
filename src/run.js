const path = require('path')

const is = require('@magic/types')
const log = require('@magic/log')

const stats = require('./stats')
const storage = require('./storage')

const { cleanFunctionString } = require('./lib')

const getFNS = () => {
  let { FN = '' } = process.env

  if (!FN) {
    return FN
  }

  if (FN.indexOf(' ') > -1) {
    FN = FN.split(' ')

    if (FN.indexOf(',') > -1) {
      FN = FN.split(',')
    }
  }

  return FN
}

const getKey = (pkg, parent, name) => {
  let key = ''
  if (parent && parent !== pkg) {
    key = `${pkg}.`
  }
  if (parent && parent !== name) {
    key += `${parent}.`
  }
  if (name) {
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

  if (typeof fn !== 'function') {
    if (is.object(test) && is.object(test.tests)) {
      const testNames = Object.keys(test.tests)
      return Promise.all(
        testNames.map(async key => {
          try {
            await runSuite({
              parent: name,
              name: key,
              tests: test[key],
            })
          } catch (e) {
            log.error('Error in test suite', e)
          }
        }),
      )
    }

    log.error('AAAAAAAAAAAAAAAAAA')
    log.error('runTest: test.fn is not a function', test)
  }

  let after
  if (typeof before === 'function') {
    try {
      after = await before(test)
    } catch (e) {
      log.error(e)
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
      res = await fn()
    } catch (e) {
      log.error(e)
    }

    if (typeof expect === 'function') {
      try {
        const combinedRes = [].concat(res)
        if (combinedRes.length > 1) {
          res = combinedRes
        }

        exp = await expect(res)
        expString = cleanFunctionString(expect)
        pass = exp
      } catch (e) {
        log.error(e)
      }
    } else {
      exp = expect
      expString = expect
      pass = exp === res
    }

    if (!pass) {
      result = res
      break
    }

    // loop is done
    if (i >= runs - 1) {
      pass = true
      result = res
    }
  }

  if (typeof after === 'function') {
    try {
      await after()
    } catch (e) {
      log.error(e)
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

const runSuite = async suite => {
  const { parent, name, key, tests, pkg } = suite

  let results

  // this is a single test, do not loop
  // is a list of unnamed tests
  if (Array.isArray(tests)) {
    results = await Promise.all(
      tests.map(async t => {
        try {
          const test = Object.assign({}, t, { name, key, parent, pkg })
          return runTest(test)
        } catch (e) {
          log.error(e)
        }
      }),
    )
  } else if (typeof tests === 'object' && tests !== null) {
    // is an object expect to contain arrays of tests for modules
    if (typeof tests.fn === 'function') {
      if (getFNS().indexOf(name) === -1) {
        return
      }

      const test = Object.assign({}, tests, { name, key, parent, pkg })
      return runTest(test)
    }

    const suiteNames = Object.keys(tests)

    results = await Promise.all(
      suiteNames.map(async suiteName => {
        const suite = await runSuite({
          parent: name,
          name: suiteName,
          key: `${name}.${suiteName}`,
          tests: tests[suiteName],
          pkg,
        })

        return suite
      }),
    )
  } else {
    log.error('runSuite:', 'invalid tests', tests)
    return new Error('Invalid tests')
  }

  return {
    [key]: results,
  }
}

const run = async tests => {
  if (typeof tests === 'function') {
    tests = tests()
  }

  if (typeof tests !== 'object') {
    log.error('NO TEST SUITES', tests)
    return new Error('No Test Suites')
  }

  const suiteNames = Object.keys(tests)

  const pkg = require(path.join(process.cwd(), 'package.json'))

  storage.set('module', pkg.name)

  await Promise.all(
    suiteNames.map(async name =>
      runSuite({
        pkg: pkg.name,
        parent: pkg.name,
        name,
        tests: tests[name],
      }),
    ),
  )

  stats.info()
}

module.exports = run
