import is from '@magic/types'
import { default as log } from '@magic/log'

import runTest from './test.mjs'
// import { stats } from '../lib/index.mjs'

const getFNS = () => {
  let { FN = '' } = process.env

  if (FN) {
    if (FN.includes(' ')) {
      FN = FN.split(' ')

      if (FN.includes(',')) {
        FN = FN.split(',')
      }
    }
  }

  return FN
}

const runSuite = async suite => {
  const { parent, name, tests, pkg } = suite

  // const startTime = new Date().getTime()

  let results

  if (is.empty(tests)) {
    if (name.includes('index.mjs')) {
      // we assume the user wants to keep us from indexing this directory.
      return
    }
    const errHeader = 'Error running Suite:'
    const errMsg = 'invalid/missing tests'
    log.error(errHeader, suite, errMsg)
    return new Error(`${errHeader} ${suite.parent}/${suite.name} ${errMsg}`)
  }

  // execute beforeAll if it exists.
  // cache afterAll callback function if it gets returned by beforeAll
  let afterAll
  if (is.function(tests.beforeAll)) {
    afterAll = await tests.beforeAll()
  }

  if (is.array(tests)) {
    // gather the test results by running each of the tests
    results = await Promise.all(
      tests.map(async t => {
        try {
          const test = Object.assign({}, t, { name, parent, pkg })
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
      if (!fns.includes(name)) {
        return
      }

      const test = Object.assign({}, tests, { name, parent, pkg })
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
  }

  // if beforeAll returned a function, we execute it here
  if (is.function(afterAll)) {
    await afterAll()
  }

  // if the module.exports of the suite includes the afterAll key,
  // we execute this function last.
  if (is.function(tests.afterAll)) {
    await tests.afterAll()
  }

  // const endTime = new Date().getTime()
  // stats.suite({ ...suite, duration: endTime - startTime })

  return {
    [name]: results,
  }
}

export default runSuite
