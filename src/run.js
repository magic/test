const { isUndefinedOrNull, isObject, isFunction, isArray, isEmpty } = require('types')

const stats = require('./stats')
const log = require('./log')

const pr = g => new Promise(r => r(g))

const cleanFunctionString = fn => {
  if (isUndefinedOrNull(fn.toString)) {
    return fn
  }

  return fn.toString()
    .replace('async t => await ', '')
    .replace('async () => await ', '')
    .replace('async (t) => await ', '')
    .replace('t => ', '')
    .replace('(t) => ', '')
    .replace('() => ', '')
}

const runTest = async (test) => {
  try {
    const { fn, expect, name, before, items, parent } = test

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
    let msg
    let exp
    let expString

    const key = name ? `${parent}.${name}` : `${parent}`

    result = await fn(test)
    msg = cleanFunctionString(fn)

    const p = isFunction(expect)

    if (isFunction(expect)) {
      const expectRes = await expect(result)
      exp = await pr(expectRes)
      expString = cleanFunctionString(expect)
    }
    else {
      exp = expect
      expString = expect
    }

    const pass = isFunction(expect) ? exp === true : exp === result

    stats.test(Object.assign({}, test, { expect: exp, pass, msg, result, expString }))

    if (after && isFunction(after.fn)) {
      await after.fn()
    }

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
  const { parent, name, key, tests } = suite

  let results

  // this is a test, do not loop
  if (isFunction(tests.fn)) {
    return await runTest(Object.assign({}, tests, { name, key, parent }))
  }
  // is a list of unnamed tests
  else if (isArray(tests)) {
    results = await Promise.all(tests.map(async test => {
      const fullTest = Object.assign({}, test, { name, key, parent })
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

  await Promise.all(suiteNames.map(async name => {
    return await runSuite({ parent: name, name, tests: tests[name] })
  }))

  stats.info()
}

module.exports = run
