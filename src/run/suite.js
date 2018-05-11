import is from '@magic/types'
import log from '@magic/log'

import runTest from './test'

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

const runSuite = async suite => {
  const { parent, name, key, tests, pkg } = suite

  let results

  // this is a single test, do not loop
  // is a list of unnamed tests
  if (tests && (is.array(tests) || is.function(tests.beforeAll))) {
    const resolvedTests = is.function(tests.beforeAll) ? tests.tests : tests

    let afterAll
    if (is.function(tests.beforeAll)) {
      afterAll = await tests.beforeAll()
    }

    results = await Promise.all(
      resolvedTests.map(async t => {
        try {
          const test = Object.assign({}, t, { name, key, parent, pkg })
          return runTest(test)
        } catch (e) {
          log.error('runSuite: runTest call errored', suite, e)
        }
      }),
    )

    if (is.function(afterAll)) {
      afterAll()
    }

    if (is.function(tests.afterAll)) {
      tests.afterAll()
    }
  } else if (is.object(tests)) {
    // is an object expect to contain arrays of tests for modules
    if (is.function(tests.fn)) {
      const fns = getFNS()
      if (fns.indexOf(name) === -1) {
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

export default runSuite
