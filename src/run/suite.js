const is = require('@magic/types')
const log = require('@magic/log')

const runTest = require('./test')

const getFNS = () => {
  let { FN = '' } = process.env

  if (!FN) {
    return FN
  }

  if (FN.includes(' ')) {
    FN = FN.split(' ')

    if (FN.includes(',')) {
      FN = FN.split(',')
    }
  }

  return FN
}

const runSuite = async suite => {
  const { parent, name, key, tests, pkg } = suite

  let results

  if (is.empty(tests)) {
    if (name.includes('index.js')) {
      // we assume the user wants to keep us from indexing this directory.
      return
    }
    const errHeader = 'Error running Suite:'
    const errMsg = 'invalid/missing tests'
    const err = [errHeader, suite, errMsg]
    log.error(errHeader, suite, errMsg)
    return new Error(`${errHeader} ${suite.parent}/${suite.name} ${errMsg}`)
  }

  if (is.array(tests)) {
    // gather the test results by running each of the tests
    results = await Promise.all(
      tests.map(async t => {
        try {
          const test = Object.assign({}, t, { name, key, parent, pkg })
          return runTest(test)
        } catch (e) {
          log.error('runSuite: runTest call errored', suite, e)
        }
      }),
    )
  } else if (is.object(tests)) {
    // is an object expected to contain arrays of tests for modules
    if (is.function(tests.fn)) {
      const fns = getFNS()
      if (fns.includes(name)) {
        return
      }

      const test = Object.assign({}, tests, { name, key, parent, pkg })
      return runTest(test)
    }

    // execute beforeAll if it exists.
    // cache afterAll callback function if it gets returned by beforeAll
    let afterAll
    if (is.function(tests.beforeAll)) {
      afterAll = await tests.beforeAll()
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

    // if beforeAll returned a function, we execute it here
    if (is.function(afterAll)) {
      await afterAll()
    }

    // if the module.exports of the suite includes the afterAll key,
    // we execute this function last.
    if (is.function(tests.afterAll)) {
      await tests.afterAll()
    }
  }

  return {
    [key]: results,
  }
}

module.exports = runSuite
