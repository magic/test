import error from '@magic/error'
import log from '@magic/log'
import is from '@magic/types'

import { runTest } from './test.js'
import { store, getFNS, suiteNeedsIsolation } from '../lib/index.js'
import { isolation } from './isolation.js'

/** @type {Suite} */
const defaultSuite = {
  pass: 0,
  fail: 0,
  all: 0,
  name: '',
  parent: '',
  pkg: '',
  tests: [],
}

/**
 * Handle suite-level beforeAll and afterAll hooks
 * @param {Test[] | (Record<string, unknown> & TestsWithHooks)} tests
 * @returns {Promise<{ beforeAllCleanup?: () => void | Promise<void>, afterAllCleanup?: () => void | Promise<void> }>}
 */
const handleSuiteHooks = async tests => {
  /** @type {(() => (void | Promise<void>)) | void} */
  let afterAllCleanup = () => {}

  if (
    tests &&
    is.object(tests) &&
    !is.arr(tests) &&
    'beforeAll' in tests &&
    is.function(tests.beforeAll)
  ) {
    const testsWithHooks = /** @type {Record<string, unknown> & TestsWithHooks} */ (tests)
    const result = is.fn(testsWithHooks.beforeAll) && (await testsWithHooks.beforeAll())
    if (is.function(result)) {
      afterAllCleanup = result
    }
  }

  return { afterAllCleanup }
}

/**
 * Run an array of tests
 * @param {Test[]} tests - Array of tests
 * @param {boolean} needsIsolation - Whether to run tests sequentially
 * @param {string} name - Suite name
 * @param {string} parent - Parent name
 * @param {string} pkg - Package name
 * @returns {Promise<(TestResult | Suite)[]>}
 */
const runTestArray = async (tests, needsIsolation, name, parent, pkg) => {
  if (needsIsolation) {
    const results = []
    for (const t of tests) {
      /** @type {Test} */
      const testToRun = {
        ...t,
        name: t.name || name,
        parent: t.parent || parent,
        pkg: t.pkg || pkg,
      }
      const res = await runTest(testToRun)
      if (res) results.push(res)
    }
    return results
  }

  const promises = tests.map(t => {
    /** @type {Test} */
    const testToRun = {
      ...t,
      name: t.name || name,
      parent: t.parent || parent,
      pkg: t.pkg || pkg,
    }
    return runTest(testToRun)
  })
  const resolved = await Promise.all(promises)
  return resolved.filter(r => !!r)
}

/**
 * Run object-based tests
 * @param {Record<string, unknown> & TestsWithHooks} testsObj
 * @param {string} name - Suite name
 * @param {string} parent - Parent name
 * @param {string} pkg - Package name
 * @returns {Promise<(TestResult | Suite)[]>}
 */
const runTestObject = async (testsObj, name, parent, pkg) => {
  if (is.function(testsObj.fn)) {
    const fns = getFNS()
    if (!fns.includes(name)) return []

    /** @type {Test} */
    const test = { ...testsObj, name, parent, pkg }
    const result = await runTest(test)
    return result ? [result] : []
  }

  const entries = Object.entries(testsObj).filter(
    ([key]) => key !== 'beforeAll' && key !== 'afterAll' && key !== 'fn',
  )

  const promises = entries.map(([suiteName, nestedTests]) =>
    runSuite({
      parent: name,
      name: suiteName,
      key: `${name}.${suiteName}`,
      tests: /** @type {Test[] | (Record<string, unknown> & TestsWithHooks)} */ (nestedTests),
      pkg,
    }),
  )
  const resolved = await Promise.all(promises)
  return resolved.filter(r => !!r)
}

/**
 * Run a suite of tests (recursively).
 *
 * @param {SuiteInput} props
 * @returns {Promise<Suite|void|undefined>}
 */
export const runSuite = async props => {
  /** @type {Suite} */
  const suite = {
    ...defaultSuite,
    name: props.name || '',
    parent: props.parent || '',
    pkg: props.pkg || '',
    key: props.key,
    tests: [],
  }

  const { parent = '', name = '', pkg = '' } = suite
  let { tests } = props

  /** @type {(TestResult | Suite)[]} */
  let results = []

  try {
    if (is.empty(tests)) {
      if (name && (name.includes('index.mjs') || name.includes('index.js'))) {
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

    const suiteKey = `${pkg}.${parent}.${name}`
    const needsIsolation = suiteNeedsIsolation(tests)

    const executeSuite = async () => {
      const { afterAllCleanup } = await handleSuiteHooks(tests)

      if (is.array(tests)) {
        results = await runTestArray(tests, needsIsolation, name, parent, pkg)
      } else if (is.objectNative(tests)) {
        results = await runTestObject(
          /** @type {Record<string, unknown> & TestsWithHooks} */ (tests),
          name,
          parent,
          pkg,
        )
      }

      if (!is.undefined(results)) {
        suite.tests = results
      }

      if (is.function(afterAllCleanup)) {
        await afterAllCleanup()
      }

      if (
        tests &&
        is.object(tests) &&
        !is.arr(tests) &&
        'afterAll' in tests &&
        is.function(tests.afterAll)
      ) {
        const testsWithHooks = /** @type {Record<string, unknown> & TestsWithHooks} */ (tests)
        if (is.fn(testsWithHooks.afterAll)) {
          await testsWithHooks.afterAll()
        }
      }

      return suite
    }

    if (needsIsolation) {
      isolation.captureSuiteSnapshot(suiteKey)
      try {
        await executeSuite()
      } finally {
        isolation.restoreSuiteSnapshot(suiteKey)
      }
    } else {
      await executeSuite()
    }

    const startTime = store.get('startTime')
    suite.duration = log.timeTaken(startTime, { log: false })

    return suite
  } catch (e) {
    const err = /** @type {import('@magic/error').CustomError} */ (e)
    if (err.code === 'E_EMPTY_SUITE') {
      log.error(err.code, err.msg)
    } else {
      log.error('E_RUN_SUITE_UNKNOWN', name, e)
    }
  }
}
