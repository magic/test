import path from 'node:path'
import { pathToFileURL } from 'node:url'

import error from '@magic/error'
import log from '@magic/log'
import is from '@magic/types'

import { runTest } from './test.js'
import {
  getFNS,
  getTestKey,
  cleanError,
  stats,
  suiteNeedsIsolation,
  testModifiesGlobals,
  suiteModifiesGlobals,
  testImportsMutableModuleState,
  testUsesFixedPorts,
  testUsesSharedFiles,
  ERRORS,
} from '../lib/index.js'
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
 * Check if suite has a beforeAll hook
 * @param {TestCollection} tests
 * @returns {boolean}
 */
const suiteHasBeforeAll = tests => {
  if (
    tests &&
    is.object(tests) &&
    !is.arr(tests) &&
    'beforeAll' in tests &&
    is.fn(tests.beforeAll)
  ) {
    return true
  }
  return false
}

/**
 * Handle suite-level beforeAll and afterAll hooks
 * @param {TestCollection} tests
 * @returns {Promise<CleanupResult>}
 */
const handleSuiteHooks = async tests => {
  /** @type {CleanupFunction} */
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
 * @param {boolean} needsIsolation - Whether tests have before/after hooks
 * @param {string} name - Suite name
 * @param {string} parent - Parent name
 * @param {string} pkg - Package name
 * @param {Store} store - The store instance
 * @param {string} testFileUrl - URL of the test file (for worker imports)
 * @param {boolean} useWorkers - Whether to use worker threads for parallel isolated execution
 * @param {Snapshot} [suiteSnapshot=undefined] - Snapshot from beforeAll (if any)
 * @returns {Promise<(TestResult | Suite)[]>}
 */
const runTestArray = async (
  tests,
  needsIsolation,
  name,
  parent,
  pkg,
  store,
  testFileUrl,
  useWorkers,
  suiteSnapshot = undefined,
) => {
  if (needsIsolation && useWorkers) {
    // Run tests in parallel using worker threads
    const promises = tests.map((t, i) => {
      /** @type {Test} */
      const testToRun = {
        ...t,
        name: t.name || name,
        parent: t.parent || parent,
        pkg: t.pkg || pkg,
      }

      // Component tests require DOM, can't run in workers (happy-dom singleton)
      if (t.component) {
        return runTest(testToRun, store)
      }

      const keyForResult =
        testToRun.key || getTestKey(testToRun.pkg, testToRun.parent, testToRun.name)
      return isolation
        .executeInWorker({
          testFileUrl,
          testIndex: i,
          testPkg: testToRun.pkg,
          testParent: testToRun.parent,
          testName: testToRun.name,
          suiteSnapshot,
        })
        .then(
          result => {
            // Manually update stats (workers don't have store access)
            if (result && result.pass !== undefined) {
              stats.test(
                { parent: result.parent, name: result.name, pass: result.pass, pkg: result.pkg },
                store,
              )
            }
            return result
          },
          err => {
            // Worker failed; create a failing TestResult
            log.error(ERRORS.E_TEST_FN, {
              testKey: testToRun.key || getTestKey(testToRun.pkg, testToRun.parent, testToRun.name),
              testName: testToRun.name,
              parent: testToRun.parent,
              error: cleanError(err),
            })
            return {
              result: undefined,
              msg: '',
              pass: false,
              parent: testToRun.parent || '',
              name: testToRun.name,
              expect: undefined,
              expString: undefined,
              key: testToRun.key || getTestKey(testToRun.pkg, testToRun.parent, testToRun.name),
              info: testToRun.info || '',
              pkg: testToRun.pkg,
            }
          },
        )
    })

    const resolved = await Promise.all(promises)
    return resolved.filter(r => !!r)
  }

  // No isolation needed: run in parallel without isolation
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
 * @returns {Promise<Suite | undefined>}
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
    const hasBeforeAll = suiteHasBeforeAll(tests)
    const modifiesGlobals = suiteModifiesGlobals(tests)

    const executeSuite = async () => {
      const { afterAllCleanup } = await handleSuiteHooks(tests)

      // Compute test file URL for potential worker usage
      const testFileUrl = pathToFileURL(path.join(process.cwd(), 'test', pkg)).href
      const testFilePath = testFileUrl ? new URL(testFileUrl).pathname : ''

      // Check for module import mutations
      const usesModuleMutation = testFilePath
        ? await testImportsMutableModuleState(tests, testFilePath)
        : false

      // Check for fixed port usage
      const usesFixedPorts = testUsesFixedPorts(tests)

      // Check for shared file usage
      const usesSharedFiles = testUsesSharedFiles(tests)

      // Use workers ONLY for tests that modify globals OR imported module state OR use fixed ports/files
      // Each worker has its own globalThis and fresh module imports, providing better isolation
      // Tests with hooks but no global modification run in main thread for better performance
      let useWorkers = false
      let suiteSnapshot
      if (needsIsolation) {
        if (modifiesGlobals || usesModuleMutation || usesFixedPorts || usesSharedFiles) {
          useWorkers = true
          if (hasBeforeAll) {
            const beforeAllFn = /** @type {TestsWithHooks} */ (tests).beforeAll
            const beforeAllModifiesGlobal =
              beforeAllFn && /globalThis|^global\b/.test(beforeAllFn.toString())
            if (beforeAllModifiesGlobal) {
              suiteSnapshot = isolation.buildSnapshot()
              try {
                structuredClone(suiteSnapshot)
              } catch {
                // Snapshot not cloneable, workers still work without snapshot
              }
            }
          }
        }
      }

      if (is.array(tests)) {
        results = await runTestArray(
          tests,
          needsIsolation,
          name,
          parent,
          pkg,
          store,
          testFileUrl,
          useWorkers,
          suiteSnapshot,
        )
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

  return
}
