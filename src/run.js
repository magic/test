const path = require('path')
const { isUndefinedOrNull, isObject, isFunction, isArray, isEmpty } = require('types')

let { RUNS = 1, FN } = process.env

if (FN && FN.indexOf(' ') > -1) {
  FN = FN.split(' ')

  if (FN.indexOf(',') > -1) {
    FN = FN.split(',')
  }
}

const stats = require('./stats')
const log = require('./log')
const { cleanFunctionString } = require('./lib')

const pr = g => new Promise(r => r(g))

const runTest = async (test) => {
  try {
    const { fn, expect, name, pkg, before, items, parent, runs = 1 } = test

    if (!isFunction(fn)) {
      if (isObject(test)) {
        const testNames = Object.keys(testNames)
        return await Promise.all(testNames.map(async key => await runSuite({
          parent: name,
          name: key,
          tests: test[key],
        })))
      }

      log.error('AAAAAAAAAAAAAAAAAAR')
      log.error('runTest: test.fn is not a function', test)
    }

    let after
    if (isFunction(before)) {
      after = await before()
    }

    let result
    let exp
    let expString

    const msg = cleanFunctionString(fn)
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


    let pass = false

    let res
    for (let i = 0; i < runs; i++) {
      res = await fn()

      if (isFunction(expect)) {
        exp = await expect(res)
        expString = cleanFunctionString(expect)
        pass = exp
      }
      else {
        exp = expect
        expString = expect
        pass = exp === res
      }

      if(!pass) {
        result = res
        break;
      }

      // loop is done
      if (i >= runs - 1) {
        pass = true
        result = res
      }
    }

    if (after && isFunction(after.fn)) {
      await after.fn()
    }

    const stat = Object.assign({}, test, { pkg, key, expect: exp, pass, msg, result, expString })
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
  catch(e) {
    throw e
  }
}

const runSuite = async (suite) => {
  const { parent, name, key, tests, pkg } = suite

  let results

  // this is a single test, do not loop
  if (isFunction(tests.fn)) {
    if (FN && FN.indexOf(name) === -1) {
      return
    }

    return await runTest(Object.assign({}, tests, { name, key, parent, pkg }))
  }
  // is a list of unnamed tests
  else if (isArray(tests)) {
    results = await Promise.all(tests.map(async test => {
      const fullTest = Object.assign({}, test, { name, key, parent, pkg })
      return await runTest(fullTest)
    }))
  }
  // is an object expect to contain arrays of tests for modules
  else if (isObject(tests)) {
    const suiteNames = Object.keys(tests)

    results = await Promise.all(suiteNames.map(async suiteName => {
      const suite = await runSuite({
        parent: name,
        name: suiteName,
        key: `${name}.${suiteName}`,
        tests: tests[suiteName],
        pkg,
      })

      return suite
    }))
  }
  else {
    log.error('runSuite:', 'invalid tests', tests)
  }

  return {
    [key]: results,
  }
}

const run = async (tests) => {
  const state = {}

  if (isFunction(tests)) {
    tests = tests()
  }

  if (!isObject(tests)) {
    log.error('NO TEST SUITES', tests)
    return
  }

  const suiteNames = Object.keys(tests)

  const pkg = require(path.join(process.cwd(), 'package.json'))

  stats.set('module', pkg.name)

  await Promise.all(suiteNames.map(async name => await runSuite({
    pkg: pkg.name,
    parent: pkg.name,
    name,
    tests: tests[name],
  })))

  stats.info()
}

module.exports = run
