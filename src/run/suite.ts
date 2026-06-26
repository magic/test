import path from 'node:path'
import { pathToFileURL } from 'node:url'

import error from '@magic/error'
import log from '@magic/log'
import is from '@magic/types'

import { runTest } from './test.ts'
import {
  getFNS,
  ERRORS,
  suiteNeedsIsolation,
  suiteModifiesGlobals,
  testImportsMutableModuleState,
  testUsesFixedPorts,
  testUsesSharedFiles,
} from '../lib/index.ts'
import { Store } from '../lib/store.ts'
import { isolation } from './isolation.ts'
import { getWorkerPool } from '../lib/workerPool.ts'
import type {
  Suite,
  WrappedTest,
  Snapshot,
  TestResult,
  SuiteInput,
  TestObject,
  Test,
} from '../types.ts'

import {
  handleSuiteHooks,
  handleWorkerError,
  processWorkerResults,
  suiteHasBeforeAllOrAfterAll,
  testNeedsIsolation,
} from './lib/index.ts'

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
 * Run an array of tests
 */
const runTestArray = async (
  tests: Test[],
  needsIsolation: boolean,
  name: string,
  parent: string,
  pkg: string,
  store: Store,
  rawResults: TestResult[] = [],
  testFileUrl: string,
  useWorkers: boolean,
  hasBeforeAll: boolean,
  suiteSnapshot?: Snapshot,
  suiteObj?: TestObject,
): Promise<(TestResult | Suite)[]> => {
  if (needsIsolation && useWorkers) {
    const allResults: TestResult[] = []
    const testsWithHooks: { test: WrappedTest; index: number }[] = []
    const testsWithoutHooks: { test: WrappedTest; index: number }[] = []

    tests.forEach((t, i) => {
      const test = {
        ...t,
        name,
        parent,
        pkg,
      }

      if (testNeedsIsolation(test, suiteObj)) {
        testsWithHooks.push({ test: test, index: i })
      } else {
        testsWithoutHooks.push({ test: test, index: i })
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
      const pool = getWorkerPool()
      const individualPromises = testsWithHooks.map(({ test, index }) =>
        pool(() => {
          if (test.component && !needsIsolation) {
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
            })
            .then(
              result => {
                rawResults.push(result as TestResult)
                return { result: result as TestResult, index }
              },
              err => ({ result: handleWorkerError(test, err, rawResults), index }),
            )
        }),
      )

      const individualResults = await Promise.all(individualPromises)
      const resultsMap = new Map<number, TestResult>(
        individualResults.map(r => [r.index, r.result as TestResult]),
      )
      for (let i = 0; i < tests.length; i++) {
        const r = resultsMap.get(i)
        if (r) {
          allResults.push(r)
        }
      }
    }

    return allResults
  }

  // No isolation needed: run in parallel without isolation
  // But when needsIsolation is true, run sequentially to ensure proper hook execution
  if (needsIsolation && (suiteObj?.beforeEach || suiteObj?.afterEach)) {
    const results: (TestResult | Suite)[] = []
    for (const t of tests) {
      const test = {
        ...t,
        name,
        parent,
        pkg,
      }

      if (suiteObj && is.function(suiteObj.beforeEach)) {
        await suiteObj.beforeEach()
      }

      const result = await runTest(test, store, rawResults)
      if (result) {
        results.push(result)
      }

      if (suiteObj && is.function(suiteObj.afterEach)) {
        await suiteObj.afterEach()
      }
    }
    return results
  }

  const promises = tests.map(t => {
    const test = {
      ...t,
      name,
      parent,
      pkg,
    }
    return runTest(test, store, rawResults)
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
    if (!fns.includes(name)) {
      return []
    }

    const test: WrappedTest = { ...testsObj, name, parent, pkg }
    const result = await runTest(test, store, rawResults)
    return result ? [result] : []
  }

  // Check if this is a test object with a tests array (e.g., { beforeAll, tests: [...] })
  // In this case, we need to run the hooks and then run the tests directly
  if (is.arr(testsObj.tests)) {
    const testArray = testsObj.tests
    const needsIsolation = suiteNeedsIsolation(testArray)
    const hasBeforeAll = suiteHasBeforeAllOrAfterAll(testsObj)
    const modifiesGlobals = suiteModifiesGlobals(testsObj)
    const { afterAllCleanup } = await handleSuiteHooks(testsObj)

    // Compute test file URL for worker
    const testFileUrl = pathToFileURL(path.join(process.cwd(), 'test', pkg)).href

    // Determine if workers needed
    let useWorkers = false
    let suiteSnapshot
    if (modifiesGlobals) {
      useWorkers = true
      if (needsIsolation && testsObj.beforeAll) {
        const beforeAllModifiesGlobal = /globalThis|^global\b/.test(
          testsObj.beforeAll?.toString() || '',
        )
        if (beforeAllModifiesGlobal) {
          suiteSnapshot = isolation.buildSnapshot()
        }
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
      suiteSnapshot,
      testsObj,
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
      tests: nestedTests as WrappedTest[],
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
export const runSuite = async (props: SuiteInput): Promise<Suite | undefined> => {
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
      if (modifiesGlobals || usesModuleMutation || usesFixedPorts || usesSharedFiles) {
        useWorkers = true
        if (is.objectNative(tests) && hasBeforeAll) {
          const beforeAllFn = tests.beforeAll
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

      if (is.array(tests)) {
        results = await runTestArray(
          tests as WrappedTest[],
          needsIsolation,
          name,
          parent,
          pkg,
          store,
          rawResults,
          testFileUrl,
          useWorkers,
          hasBeforeAll,
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
    if (is.error(e) && hasErrorCode(e)) {
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
