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
} from '../lib/index.ts'
import { Store } from '../lib/store.js'
import { isolation } from './isolation.js'
import type {
  Suite,
  TestCollection,
  WrappedTest,
  CleanupResult,
  Snapshot,
  TestResult,
  SuiteInput,
  TestObject,
} from '../types.ts'

const GLOBAL_MODIFICATION_RE = /(?:globalThis|window|global|self|process\.env)/

const testNeedsIsolation = (test: WrappedTest): boolean => {
  if (test.component) return true
  if (test.before || test.after) return true
  if (test.fn) {
    const fnStr = test.fn.toString()
    if (GLOBAL_MODIFICATION_RE.test(fnStr)) return true
  }
  return false
}

const suiteHasBeforeAllOrAfterAll = (tests: TestCollection): boolean => {
  if (is.object(tests) && !is.arr(tests)) {
    const hasBefore = 'beforeAll' in tests && is.fn(tests.beforeAll)
    const hasAfter = 'afterAll' in tests && is.fn(tests.afterAll)
    return hasBefore || hasAfter
  }
  return false
}

/**
 * Type guard to check if an Error has a `code` property.
 */
const hasErrorCode = (err: Error): err is Error & { code?: string } => {
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
 * Handle suite-level beforeAll and afterAll hooks
 */
const handleSuiteHooks = async (tests: TestCollection): Promise<CleanupResult> => {
  let afterAllCleanup = () => {}

  if (
    tests &&
    is.object(tests) &&
    !is.arr(tests) &&
    'beforeAll' in tests &&
    is.function(tests.beforeAll)
  ) {
    if (is.fn(tests.beforeAll)) {
      const beforeResult = await tests.beforeAll()
      if (is.function(beforeResult)) {
        afterAllCleanup = beforeResult
      }
    }
  }

  return { afterAllCleanup }
}

const createFailResult = (testToRun: WrappedTest): TestResult => {
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
}

const processWorkerResults = (results: TestResult[], rawResults: TestResult[]): TestResult[] => {
  for (const r of results) {
    rawResults.push(r)
    if (r.afterCleanupError) {
      log.warn('afterCleanup error in', r.name, r.afterCleanupError)
    }
    if (r.afterError) {
      log.warn('after error in', r.name, r.afterError)
    }
  }
  return results
}

const handleWorkerError = (
  testToRun: WrappedTest,
  error: unknown,
  rawResults: TestResult[],
): TestResult => {
  log.error(ERRORS.E_TEST_FN!, {
    testKey: testToRun.key || getTestKey(testToRun.pkg, testToRun.parent, testToRun.name),
    testName: testToRun.name,
    parent: testToRun.parent,
    error: cleanError(error),
  })
  const failResult = createFailResult(testToRun)
  rawResults.push(failResult)
  return failResult
}

/**
 * Run an array of tests
 */
const runTestArray = async (
  tests: WrappedTest[],
  needsIsolation: boolean,
  name: string,
  parent: string,
  pkg: string,
  store: Store,
  rawResults: TestResult[] = [],
  testFileUrl: string,
  useWorkers: boolean,
  hasBeforeAll: boolean,
  beforeAll?: () => unknown | Promise<unknown>,
  afterAll?: () => unknown | Promise<unknown>,
  suiteSnapshot?: Snapshot,
): Promise<(TestResult | Suite)[]> => {
  if (needsIsolation && useWorkers) {
    const allResults: TestResult[] = []
    const testsWithHooks: { test: WrappedTest; index: number }[] = []
    const testsWithoutHooks: { test: WrappedTest; index: number }[] = []

    tests.forEach((t, i) => {
      const testToRun = {
        ...t,
        name: t.name || name,
        parent: t.parent || parent,
        pkg: t.pkg || pkg,
      }

      if (testNeedsIsolation(t)) {
        testsWithHooks.push({ test: testToRun, index: i })
      } else {
        testsWithoutHooks.push({ test: testToRun, index: i })
      }
    })

    // Rule 1 & 3: hasBeforeAll → batch in one worker
    if (hasBeforeAll && testsWithoutHooks.length > 0) {
      try {
        const batchResults = await isolation.executeBatchInWorker({
          testFileUrl,
          testIndices: testsWithoutHooks.map(t => t.index),
          testPkg: pkg,
          testParent: parent,
          testNames: testsWithoutHooks.map(t => t.test.name),
          suiteSnapshot,
          beforeAll: beforeAll?.toString(),
          afterAll: afterAll?.toString(),
        })
        allResults.push(...processWorkerResults(batchResults, rawResults))
      } catch (err) {
        for (const { test } of testsWithoutHooks) {
          allResults.push(handleWorkerError(test, err, rawResults))
        }
      }
    }

    // Rule 2: no beforeAll → parallel on main thread
    if (!hasBeforeAll && testsWithoutHooks.length > 0) {
      const promises = testsWithoutHooks.map(t => runTest(t.test, store, rawResults))
      const resolved = await Promise.all(promises)
      const testResults = resolved.filter((r): r is TestResult => !!r && 'pass' in r)
      allResults.push(...testResults)
    }

    // Rules 2 & 3: tests with hooks → individual workers
    if (testsWithHooks.length > 0) {
      const individualPromises = testsWithHooks.map(({ test, index }) => {
        if (test.component) {
          return runTest(test, store, rawResults).then(r => ({ result: r, index }))
        }
        return isolation
          .executeInWorker({
            testFileUrl,
            testIndex: index,
            testPkg: test.pkg,
            testParent: test.parent,
            testName: test.name,
            suiteSnapshot,
            beforeAll: beforeAll?.toString(),
            afterAll: afterAll?.toString(),
          })
          .then(
            result => ({ result: result as TestResult, index }),
            err => ({ result: handleWorkerError(test, err, rawResults), index }),
          )
      })

      const individualResults = await Promise.all(individualPromises)
      const resultsMap = new Map<number, TestResult>(
        individualResults.map(r => [r.index, r.result as TestResult]),
      )
      for (let i = 0; i < tests.length; i++) {
        const r = resultsMap.get(i)
        if (r) allResults.push(r)
      }
    }

    return allResults
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
const runTestObject = async (
  testsObj: TestObject,
  name: string,
  parent: string,
  pkg: string,
  store: Store,
  rawResults: TestResult[] = [],
): Promise<(TestResult | Suite)[]> => {
  if (is.function(testsObj.fn)) {
    const fns = getFNS()
    if (!fns.includes(name)) return []

    const test = { ...testsObj, name, parent, pkg }
    const result = await runTest(test, store, rawResults)
    return result ? [result] : []
  }

  // Check if this is a test object with a tests array (e.g., { beforeAll, tests: [...] })
  // In this case, we need to run the hooks and then run the tests directly
  if (is.arr(testsObj.tests)) {
    const testArray = testsObj.tests as WrappedTest[]
    const needsIsolation = suiteNeedsIsolation(testArray)
    const hasBeforeAll = suiteHasBeforeAllOrAfterAll(testsObj)
    const modifiesGlobals = suiteModifiesGlobals(testsObj)
    const { afterAllCleanup } = await handleSuiteHooks(testsObj)

    // Compute test file URL for worker
    const testFileUrl = pathToFileURL(path.join(process.cwd(), 'test', pkg)).href

    // Determine if workers needed
    let useWorkers = false
    let suiteSnapshot
    if (needsIsolation && modifiesGlobals) {
      useWorkers = true
      const beforeAllModifiesGlobal = /globalThis|^global\b/.test(
        testsObj.beforeAll?.toString() || '',
      )
      if (beforeAllModifiesGlobal) {
        suiteSnapshot = isolation.buildSnapshot()
      }
    }

    const results = await runTestArray(
      testArray,
      needsIsolation,
      name,
      parent,
      pkg,
      store,
      rawResults,
      testFileUrl,
      useWorkers,
      hasBeforeAll,
      testsObj.beforeAll,
      testsObj.afterAll,
      suiteSnapshot,
    )

    // Run afterAll cleanup
    if (is.function(afterAllCleanup)) {
      const cleanupResult = afterAllCleanup()
      if (cleanupResult && is.promise(cleanupResult)) {
        await cleanupResult
      }
    }

    // Run afterAll hook
    if (is.objectNative(testsObj) && is.function(testsObj.afterAll)) {
      await testsObj.afterAll()
    }

    return results
  }

  const entries = Object.entries(testsObj).filter(
    ([key]) => key !== 'beforeAll' && key !== 'afterAll' && key !== 'fn' && key !== 'tests',
  )

  const promises = entries.map(([suiteName, nestedTests]) =>
    runSuite({
      parent: name,
      name: suiteName,
      key: `${name}.${suiteName}`,
      tests: nestedTests as TestCollection,
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
export const runSuite = async (
  props: SuiteInput & { store: Store; rawResults?: TestResult[] },
): Promise<Suite | undefined> => {
  const store = props.store ?? new Store()
  const rawResults = props.rawResults ?? []

  const suite: Suite = {
    ...defaultSuite,
    name: props.name || '',
    parent: props.parent || '',
    pkg: props.pkg || '',
    key: props.key,
    tests: [],
  }

  const { parent = '', name = '', pkg = '' } = suite
  const { tests } = props

  let results: (TestResult | Suite)[] = []

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
    const hasBeforeAll = suiteHasBeforeAllOrAfterAll(tests)
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
            const testObj = tests as TestObject
            const beforeAllFn = testObj.beforeAll
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
          rawResults,
          testFileUrl,
          useWorkers,
          hasBeforeAll,
          undefined,
          undefined,
          suiteSnapshot,
        )
      } else if (is.objectNative(tests)) {
        results = await runTestObject(
          tests as TestObject,
          name,
          parent,
          pkg,
          store as Store,
          rawResults,
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

    const startTime = store?.get<[number, number]>('startTime')
    if (startTime) {
      suite.duration = log.timeTaken(startTime, { log: false })
    } else {
      suite.duration = ''
    }

    return suite
  } catch (e: unknown) {
    if (e instanceof Error && hasErrorCode(e)) {
      if (e.code && e.code === ERRORS.E_EMPTY_SUITE) {
        log.error(e.code, e.message)
      } else if (e.code) {
        log.error(ERRORS.E_RUN_SUITE_UNKNOWN!, { suite: name, error: e })
      } else {
        log.error(ERRORS.E_RUN_SUITE_UNKNOWN!, { suite: name, error: e })
      }
    } else {
      log.error(ERRORS.E_RUN_SUITE_UNKNOWN!, { suite: name, error: e })
    }
  }

  return
}
