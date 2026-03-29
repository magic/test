import error from '@magic/error'
import log from '@magic/log'
import is from '@magic/types'

import { runTest } from './test.js'
import { getFNS, suiteNeedsIsolation, ERRORS } from '../lib/index.js'
import { Store } from '../lib/store.js'
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
 * @param {TestCollection} tests
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
    const testsWithHooks = /** @type {TestObject} */ (tests)
    const beforeAllFn = testsWithHooks.beforeAll
    if (is.fn(beforeAllFn)) {
      const beforeResult = await beforeAllFn()
      if (is.function(beforeResult)) {
        afterAllCleanup = beforeResult
      }
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
 * @param {Store} store - The store instance
 * @returns {Promise<(TestResult | Suite)[]>}
 */
const runTestArray = async (tests, needsIsolation, name, parent, pkg, store) => {
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
      const res = await runTest(testToRun, store)
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
    return runTest(testToRun, store)
  })
  const resolved = await Promise.all(promises)
  return resolved.filter(r => !!r)
}

/**
 * Run object-based tests
 * @param {TestObject} testsObj
 * @param {string} name - Suite name
 * @param {string} parent - Parent name
 * @param {string} pkg - Package name
 * @param {Store} store - The store instance
 * @returns {Promise<(TestResult | Suite)[]>}
 */
const runTestObject = async (testsObj, name, parent, pkg, store) => {
  if (is.function(testsObj.fn)) {
    const fns = getFNS()
    if (!fns.includes(name)) return []

    /** @type {Test} */
    const test = { ...testsObj, name, parent, pkg }
    const result = await runTest(test, store)
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
      tests: /** @type {TestCollection} */ (nestedTests),
      pkg,
      store,
    }),
  )
  const resolved = await Promise.all(promises)
  return resolved.filter(r => !!r)
}

/**
 * Run a suite of tests (recursively).
 *
 * @param {SuiteInput & {store?: Store}} props
 * @returns {Promise<Suite|void|undefined>}
 */
export const runSuite = async props => {
  const store = props.store ?? new Store()

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

      let suiteName = suite.name
      if (suite.parent !== suite.name) {
        suiteName = `${suite.parent}/${suite.name}`
      }

      throw error(`Error running Suite: ${suiteName} is not exporting tests.`, ERRORS.E_EMPTY_SUITE)
    }

    const suiteKey = `${pkg}.${parent}.${name}`
    const needsIsolation = suiteNeedsIsolation(tests)

    const executeSuite = async () => {
      const { afterAllCleanup } = await handleSuiteHooks(tests)

      if (is.array(tests)) {
        results = await runTestArray(tests, needsIsolation, name, parent, pkg, store)
      } else if (is.objectNative(tests)) {
        results = await runTestObject(
          /** @type {TestObject} */ (tests),
          name,
          parent,
          pkg,
          /** @type {Store} */ (store),
        )
      }

      if (!is.undefined(results)) {
        suite.tests = results
      }

      // Run cleanup from beforeAll's returned function FIRST
      if (is.function(afterAllCleanup)) {
        const cleanupResult = afterAllCleanup()
        // If the cleanup returns a Promise, await it; otherwise continue synchronously
        if (cleanupResult && is.promise(cleanupResult)) {
          await cleanupResult
        }
      }

      // Then run afterAll hook
      if (is.objectNative(tests) && is.function(tests.afterAll)) {
        if (is.fn(tests.afterAll)) {
          await tests.afterAll()
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

    const startTime = store?.get('startTime')
    suite.duration = log.timeTaken(/** @type {[number, number]} */ (startTime), { log: false })

    return suite
  } catch (e) {
    const err = /** @type {CustomError} */ (e)
    if (err.code === ERRORS.E_EMPTY_SUITE) {
      log.error(err.code, err.message)
    } else {
      log.error(ERRORS.E_RUN_SUITE_UNKNOWN, { suite: name, error: e })
    }
  }
}
