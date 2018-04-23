const path = require('path')

const is = require('@magic/types')
const log = require('@magic/log')

const stats = require('./stats')
const store = require('./store')

const { cleanFunctionString } = require('./lib')

const runSuite = require('./run/suite')

const run = async tests => {
  if (is.function(tests)) {
    tests = tests()
  }

  if (!is.object(tests)) {
    log.error('NO TEST SUITES', tests)
    return new Error('No Test Suites')
  }

  const suiteNames = Object.keys(tests)

  const pkg = require(path.join(process.cwd(), 'package.json'))

  store.set({ module: pkg.name })

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
