import error from '@magic/error'
import log from '@magic/log'
import is from '@magic/types'

import runTest from './test.js'
import store from '../lib/store.js'

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

const defaultSuite = {
  pass: 0,
  fail: 0,
  all: 0,
}

const runSuite = async (props = {}) => {
  const suite = { ...defaultSuite, ...props }
  const { parent = '', name = '', pkg = '' } = suite
  let { tests } = suite

  let results = []

  try {
    if (is.empty(tests)) {
      if (name && (name.includes('index.js') || name.includes('index.js'))) {
        // we assume the user wants to keep us from indexing this directory.
        return
      }

      const errHeader = 'Error running Suite:\n'
      const errMsg = '\nis not exporting tests.'

      let suiteName = suite.name
      if (suite.parent !== suite.name) {
        suiteName = `${suite.parent}/${suite.name}`
      }

      throw error(`${errHeader} ${suiteName} ${errMsg}`, 'E_EMPTY_SUITE')
    }

    // execute beforeAll if it exists.
    // cache afterAll callback function if it gets returned by beforeAll
    let afterAll
    if (is.function(tests.beforeAll)) {
      afterAll = await tests.beforeAll()
    }

    if (is.array(tests)) {
      results = tests.map(t => runTest({ ...t, name, parent, pkg }))
    } else if (is.objectNative(tests)) {
      // if we get a single test, check if this test is requested using env variables
      if (is.function(tests.fn)) {
        const fns = getFNS()
        if (!fns.includes(name)) {
          return
        }

        const test = { ...tests, name, parent, pkg }
        results = [runTest(test)]
      }

      results = Object.entries(tests).map(([suiteName, tests]) =>
        runSuite({
          parent: name,
          name: suiteName,
          key: `${name}.${suiteName}`,
          tests,
          pkg,
        }),
      )
    }

    suite.tests = await Promise.all(results)

    // if beforeAll returned a function, we execute it here
    if (is.function(afterAll)) {
      await afterAll()
    }

    // if the module.exports of the suite includes the afterAll key,
    // we execute this function last.
    if (is.function(tests.afterAll)) {
      await tests.afterAll()
    }

    const startTime = store.get('startTime')
    suite.duration = log.timeTaken(startTime, { log: false })

    return suite
  } catch (e) {
    if (e.code === 'E_EMPTY_SUITE') {
      log.error(e.code, e.msg)
    } else {
      log.error('E_RUN_SUITE_UNKNOWN', name, e)
    }
  }
}

export default runSuite
