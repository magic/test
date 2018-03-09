const { isObject, isFunction, isArray, isEmpty } = require('types')

const argv = require('argv')

const stats = require('./stats')

const log = require('./log')

// const count = require('./count')

const t = require('./t')

// TODO 'calculate coverage')
// TODO 'calculate fail/pass percentages here')

const runTest = ({ parent, test }) => {
  const { fn, expect, name, before, items } = test

  if (!isFunction(fn)) {
    if (isObject(test)) {
      return Object.keys(test).map(key => runSuite({
        parent: name,
        name: key,
        key: `${key}.${name}`,
        tests: test[key],
      }))
    }

    log.error('AAAAAAAAAAAAAAAAAAR')
    log.error('runTest: test.fn is not a function', test)
  }

  let after
  if (isFunction(before)) {
    after = before()
  }

  const result = fn()
  const msg = fn.toString().replace('() => ', '')

  const exp = isFunction(expect) ? expect(result) : expect
  const pass = isFunction(expect) ? exp : exp === result

  if (!pass) {
    stats.add(parent, { fail: 1, all: 1 })
    log.fail(msg, result, exp)
  }
  else {
    stats.add(parent, { pass: 1, all: 1 })
    log.pass(msg, result)
  }

  if (isFunction(after)) {
    after()
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

const mapTest = (run, tests) => {}

const runSuite = ({ parent, name, key, tests }) => {
  log.info(`\n------ Run: ${key}`)

  if (isFunction(tests)) {
    tests = tests(name, tests)
  }

  let results

  // this is a test, do not loop
  if (isFunction(tests.fn)) {
    tests.name = name
    tests.key = key

    return runTest({ parent, test: tests })
  }
  else if (isArray(tests)) {
    results = tests.map(test => runTest({ parent: name, key, test }))
  }
  else if (isObject(tests)) {
    const suiteNames = Object.keys(tests)

    results = suiteNames.map(suiteName => {
      const suite = runSuite({
        parent: name,
        name: suiteName,
        key: `${key}.${suiteName}`,
        tests: tests[suiteName],
      })

      return suite
    })
  }
  else {
    log.error('runSuite:', 'invalid tests', tests)
  }

  log.info(`----- Finish ${key}`)

  return {
    [key]: results,
  }
}

const run = (tests) => {
  const state = {}

  if (isFunction(tests)) {
    tests = tests()
  }

  if (!isObject(tests)) {
    log.error('NO TEST SUITES', tests)
    return
  }

  const suiteNames = Object.keys(tests)

  const results = suiteNames.map(name => {
    const stats = {}

    const result = runSuite({ name, key: name, tests: tests[name] })
    return result
  })

  stats.calculate()
}

module.exports = run
