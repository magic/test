import path from 'node:path'
import { pathToFileURL } from 'node:url'

import error from '@magic/error'
import log from '@magic/log'
import is from '@magic/types'

import { runTest } from './test.js'
import {
  getFNS,
  ERRORS,
  suiteNeedsIsolation,
  suiteModifiesGlobals,
  testImportsMutableModuleState,
  testUsesFixedPorts,
  testUsesSharedFiles,
} from '../lib/index.js'
import { Store } from '../lib/store.js'
import { isolation } from './isolation.js'
import type {
  Suite,
  WrappedTest,
  Snapshot,
  TestResult,
  SuiteInput,
  TestObject,
  Test,
  TestCollection,
} from '../types.js'

import {
  handleSuiteHooks,
  suiteHasBeforeAllOrAfterAll,
  runIsolatedArray,
  runSequentialHooked,
  runParallelArray,
} from './lib/index.js'

/**
 * Type guard to check if an Error has a string `code` property.
 */
const hasErrorCode = (err: Error): err is Error & { code: string } =>
  typeof (err as { code?: unknown }).code === 'string'

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
 * Check whether a beforeAll hook references globals (globalThis/global).
 */
const beforeAllModifiesGlobal = (fn: unknown): boolean =>
  is.function(fn) && /globalThis|^global\b/.test(fn.toString())

/**
 * Isolation decision for a suite, computed once and shared by all execution paths.
 */
type SuiteAnalysis = {
  needsIsolation: boolean
  hasBeforeAll: boolean
  useWorkers: boolean
  suiteSnapshot?: Snapshot
}

/**
 * Single source of truth for suite isolation decisions.
 * Used for both array and object suites so behavior stays consistent.
 *
 * Uses workers ONLY for tests that modify globals OR imported module state
 * OR use fixed ports/files. Each worker has its own globalThis and fresh
 * module imports, providing better isolation. Tests with hooks but no
 * global modification run in the main thread for better performance.
 */
const analyzeSuite = async (
  tests: TestCollection,
  testFilePath: string,
): Promise<SuiteAnalysis> => {
  const needsIsolation = suiteNeedsIsolation(tests)
  const hasBeforeAll = suiteHasBeforeAllOrAfterAll(tests)
  const modifiesGlobals = suiteModifiesGlobals(tests)

  // Check for module import mutations
  const usesModuleMutation = testFilePath
    ? await testImportsMutableModuleState(tests, testFilePath)
    : false

  // Check for fixed port usage
  const usesFixedPorts = testUsesFixedPorts(tests)

  // Check for shared file usage
  const usesSharedFiles = testUsesSharedFiles(tests)

  let useWorkers = false
  let suiteSnapshot: Snapshot | undefined
  if (modifiesGlobals || usesModuleMutation || usesFixedPorts || usesSharedFiles) {
    useWorkers = true
    if (is.objectNative(tests) && beforeAllModifiesGlobal((tests as TestObject).beforeAll)) {
      suiteSnapshot = isolation.buildSnapshot()
      try {
        structuredClone(suiteSnapshot)
      } catch {
        // Snapshot not cloneable, workers still work without snapshot
      }
    }
  }

  return { needsIsolation, hasBeforeAll, useWorkers, suiteSnapshot }
}

/**
 * Count pass/fail across a suite's results, recursing into nested suites.
 */
const countTestResults = (items: (TestResult | Suite)[]): { pass: number; fail: number } => {
  let pass = 0
  let fail = 0
  for (const item of items) {
    if (!is.objectNative(item)) {
      continue
    }
    if (Array.isArray((item as Suite).tests)) {
      const sub = countTestResults((item as Suite).tests)
      pass += sub.pass
      fail += sub.fail
    } else if ((item as TestResult).pass) {
      pass++
    } else {
      fail++
    }
  }
  return { pass, fail }
}

/**
 * Run an array of tests. Thin dispatcher that picks one execution strategy:
 *
 * - isolated (workers) when the suite modifies globals / module state / ports / files
 * - sequential with hooks when the suite has beforeEach/afterEach
 * - plain parallel otherwise
 */
const runTestArray = async (
  tests: Test[],
  analysis: SuiteAnalysis,
  name: string,
  parent: string,
  pkg: string,
  store: Store,
  rawResults: TestResult[] = [],
  testFileUrl: string,
  suiteObj?: TestObject,
): Promise<(TestResult | Suite)[]> => {
  const { needsIsolation, useWorkers, hasBeforeAll, suiteSnapshot } = analysis

  if (needsIsolation && useWorkers) {
    return runIsolatedArray({
      tests,
      name,
      parent,
      pkg,
      store,
      rawResults,
      testFileUrl,
      suiteObj,
      suiteSnapshot,
      hasBeforeAll,
    })
  }

  if (needsIsolation && (suiteObj?.beforeEach || suiteObj?.afterEach)) {
    return runSequentialHooked({ tests, name, parent, pkg, store, rawResults, suiteObj })
  }

  return runParallelArray({ tests, name, parent, pkg, store, rawResults })
}

/**
 * Run object-based tests
 */
const runTestObject = async (
  testsObj: TestObject,
  analysis: SuiteAnalysis,
  name: string,
  parent: string,
  pkg: string,
  store: Store,
  rawResults: TestResult[] = [],
  testFileUrl: string,
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
  // Note: handleSuiteHooks is called in runSuite, not here, to avoid double execution
  if (is.arr(testsObj.tests)) {
    // Worker/snapshot decisions come from analyzeSuite (computed in runSuite)
    const results = await runTestArray(
      testsObj.tests,
      analysis,
      name,
      parent,
      pkg,
      store,
      rawResults,
      testFileUrl,
      testsObj,
    )

    // Note: afterAllCleanup and afterAll hooks are handled in runSuite.executeSuite
    // to ensure single execution point

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

    // Compute test file URL for potential worker usage
    const testFileUrl = pathToFileURL(path.join(process.cwd(), 'test', pkg)).href
    const testFilePath = testFileUrl ? new URL(testFileUrl).pathname : ''

    // Single source of truth for isolation decisions (array and object suites alike)
    const analysis = await analyzeSuite(tests, testFilePath)

    const executeSuite = async () => {
      const { afterAllCleanup } = await handleSuiteHooks(tests)

      if (is.array(tests)) {
        results = await runTestArray(
          tests as WrappedTest[],
          analysis,
          name,
          parent,
          pkg,
          store,
          rawResults,
          testFileUrl,
        )
      } else if (is.objectNative(tests)) {
        results = await runTestObject(
          tests as TestObject,
          analysis,
          name,
          parent,
          pkg,
          store as Store,
          rawResults,
          testFileUrl,
        )
      }

      if (!is.undefined(results)) {
        suite.tests = results
        const counts = countTestResults(results)
        suite.pass = counts.pass
        suite.fail = counts.fail
        suite.all = counts.pass + counts.fail
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
        await tests.afterAll()
      }

      return suite
    }

    if (analysis.needsIsolation) {
      await isolation.executeSuiteIsolated(suiteKey, executeSuite)
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
    if (is.error(e) && hasErrorCode(e) && e.code === ERRORS.E_EMPTY_SUITE) {
      log.error(e.code, e.message)
    } else {
      log.error(ERRORS.E_RUN_SUITE_UNKNOWN!, { suite: name, error: e })
    }
  }

  return
}
