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
  ERRORS,
  suiteNeedsIsolation,
  suiteModifiesGlobals,
  testImportsMutableModuleState,
  testUsesFixedPorts,
  testUsesSharedFiles,
} from '../lib/index.js'
import { Store } from '../lib/store.js'
import { isolation } from './isolation.js'
/**
 * Type guard to check if an Error has a `code` property.
 */
const hasErrorCode = err => {
  return 'code' in err
}
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
 */
const handleSuiteHooks = async tests => {
  let afterAllCleanup = () => {}
  if (
    tests &&
    is.object(tests) &&
    !is.arr(tests) &&
    'beforeAll' in tests &&
    is.function(tests.beforeAll)
  ) {
    const testsWithHooks = tests
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
 * Check if any test needs individual isolation (has before/after hooks)
 */
const testsNeedIndividualIsolation = tests => {
  return tests.some(t => is.function(t.before) || is.function(t.after))
}
/**
 * Run an array of tests
 */
const runTestArray = async (
  tests,
  needsIsolation,
  name,
  parent,
  pkg,
  store,
  rawResults = [],
  testFileUrl,
  useWorkers,
  suiteSnapshot,
) => {
  if (needsIsolation && useWorkers) {
    const needsIndividualWorkers = testsNeedIndividualIsolation(tests)
    // If tests don't need individual isolation, run all in one worker
    if (!needsIndividualWorkers) {
      const testIndices = tests.map((_, i) => i)
      const firstTest = tests[0]
      return isolation
        .executeInWorker({
          testFileUrl,
          testIndices,
          testPkg: pkg,
          testParent: parent,
          testName: name,
          suiteSnapshot,
        })
        .then(
          results => {
            const r = Array.isArray(results) ? results : [results]
            for (const res of r) {
              rawResults.push(res)
              if (res.afterCleanupError) {
                log.warn('afterCleanup error in', res.name, res.afterCleanupError)
              }
              if (res.afterError) {
                log.warn('after error in', res.name, res.afterError)
              }
            }
            return r
          },
          err => {
            log.error(ERRORS.E_TEST_FN, {
              testKey: getTestKey(pkg, parent, name),
              testName: name,
              parent,
              error: cleanError(err),
            })
            const failResult = {
              result: undefined,
              msg: '',
              pass: false,
              parent: parent || '',
              name: firstTest?.name || name,
              expect: undefined,
              expString: undefined,
              key: getTestKey(pkg, parent, name),
              info: firstTest?.info || '',
              pkg,
            }
            return [failResult]
          },
        )
    }
    // Run tests in parallel using worker threads (one worker per test)
    const promises = tests.map((t, i) => {
      const testToRun = {
        ...t,
        name: t.name || name,
        parent: t.parent || parent,
        pkg: t.pkg || pkg,
      }
      // Component tests require DOM, can't run in workers (happy-dom singleton)
      if (t.component) {
        return runTest(testToRun, store, rawResults)
      }
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
            const r = result
            // Collect result for aggregation
            rawResults.push(r)
            // Log cleanup errors from worker
            if (r.afterCleanupError) {
              log.warn('afterCleanup error in', r.name || testToRun.name, r.afterCleanupError)
            }
            if (r.afterError) {
              log.warn('after error in', r.name || testToRun.name, r.afterError)
            }
            return r
          },
          err => {
            // Worker failed; create a failing TestResult
            log.error(ERRORS.E_TEST_FN, {
              testKey: testToRun.key || getTestKey(testToRun.pkg, testToRun.parent, testToRun.name),
              testName: testToRun.name,
              parent: testToRun.parent,
              error: cleanError(err),
            })
            const failResult = {
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
            rawResults.push(failResult)
            return failResult
          },
        )
    })
    const resolved = await Promise.all(promises)
    return resolved.filter(r => !!r)
  }
  // No isolation needed: run in parallel without isolation
  const promises = tests.map(t => {
    const testToRun = {
      ...t,
      name: t.name || name,
      parent: t.parent || parent,
      pkg: t.pkg || pkg,
    }
    return runTest(testToRun, store, rawResults)
  })
  const resolved = await Promise.all(promises)
  return resolved.filter(r => !!r)
}
/**
 * Run object-based tests
 */
const runTestObject = async (testsObj, name, parent, pkg, store, rawResults = []) => {
  if (is.function(testsObj.fn)) {
    const fns = getFNS()
    if (!fns.includes(name)) return []
    const test = { ...testsObj, name, parent, pkg }
    const result = await runTest(test, store, rawResults)
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
      tests: nestedTests,
      pkg,
      store,
      rawResults,
    }),
  )
  const resolved = await Promise.all(promises)
  return resolved.filter(r => !!r)
}
/**
 * Run a suite of tests (recursively).
 */
export const runSuite = async props => {
  const store = props.store ?? new Store()
  const rawResults = props.rawResults ?? []
  const suite = {
    ...defaultSuite,
    name: props.name || '',
    parent: props.parent || '',
    pkg: props.pkg || '',
    key: props.key,
    tests: [],
  }
  const { parent = '', name = '', pkg = '' } = suite
  const { tests } = props
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
            suiteSnapshot = isolation.buildSnapshot()
            try {
              structuredClone(suiteSnapshot)
            } catch {
              // Snapshot not cloneable, workers still work without snapshot
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
          rawResults,
          testFileUrl,
          useWorkers,
          suiteSnapshot,
        )
      } else if (is.objectNative(tests)) {
        results = await runTestObject(tests, name, parent, pkg, store, rawResults)
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
    if (startTime) {
      suite.duration = log.timeTaken(startTime, { log: false })
    } else {
      suite.duration = ''
    }
    return suite
  } catch (e) {
    if (e instanceof Error && hasErrorCode(e)) {
      if (e.code && e.code === ERRORS.E_EMPTY_SUITE) {
        log.error(e.code, e.message)
      } else if (e.code) {
        log.error(ERRORS.E_RUN_SUITE_UNKNOWN, { suite: name, error: e })
      } else {
        log.error(ERRORS.E_RUN_SUITE_UNKNOWN, { suite: name, error: e })
      }
    } else {
      log.error(ERRORS.E_RUN_SUITE_UNKNOWN, { suite: name, error: e })
    }
  }
  return
}
