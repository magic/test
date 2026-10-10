/* ---------------------------------------------------------------------------
 * Execution strategies for array suites.
 *
 * suite.ts decides which strategy applies (via analyzeSuite); these functions
 * implement one execution path each:
 *
 * - runIsolatedArray:    tests modify globals / module state / fixed ports or
 *                        files → workers give each test a fresh globalThis and
 *                        fresh module imports.
 * - runSequentialHooked: suite has beforeEach/afterEach → run sequentially on
 *                        the main thread so hook order is preserved.
 * - runParallelArray:    no isolation needed → plain parallel execution.
 * -------------------------------------------------------------------------- */

import is from '@magic/types'

import { runTest } from '../test.ts'
import { isolation } from '../isolation.ts'
import { getWorkerPool } from '../../lib/workerPool.ts'
import { wrapTest } from './wrapTest.ts'
import { handleWorkerError } from './handleWorkerError.ts'
import { processWorkerResults } from './processWorkerResults.ts'
import { testNeedsIsolation } from './testNeedsIsolation.ts'

import type { Suite, WrappedTest, Snapshot, TestResult, TestObject, Test } from '../../types.ts'

import type { Store } from '../../lib/store.ts'

type BaseStrategyArgs = {
  tests: Test[]
  name: string
  parent: string
  pkg: string
  store: Store
  rawResults: TestResult[]
  suiteObj?: TestObject
}

type IsolatedStrategyArgs = BaseStrategyArgs & {
  testFileUrl: string
  suiteSnapshot?: Snapshot
  hasBeforeAll: boolean
}

/**
 * Isolated execution: tests modify globals / imported module state / fixed
 * ports or files, so each runs in its own worker (fresh globalThis + module
 * imports). When the suite has a beforeAll, the unhooked tests are batched
 * into a single worker; otherwise they run in parallel on the main thread.
 * Hooked tests always get individual workers.
 */
export const runIsolatedArray = async (
  args: IsolatedStrategyArgs,
): Promise<(TestResult | Suite)[]> => {
  const {
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
  } = args

  // Results are collected by original test index so the final order matches
  // source order (hooked and unhooked tests interleaved as written).
  const resultsByIndex = new Map<number, TestResult>()
  const testsWithHooks: { test: WrappedTest; index: number }[] = []
  const testsWithoutHooks: { test: WrappedTest; index: number }[] = []

  tests.forEach((t, i) => {
    const test = wrapTest(t, name, parent, pkg)

    if (testNeedsIsolation(test, suiteObj)) {
      testsWithHooks.push({ test, index: i })
    } else {
      testsWithoutHooks.push({ test, index: i })
    }
  })

  // hasBeforeAll → batch the unhooked tests in one worker so they see the
  // same module state the hook set up
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
      const processed = processWorkerResults(batchResults, rawResults)
      testsWithoutHooks.forEach(({ index }, i) => {
        const r = processed[i]
        if (r) {
          resultsByIndex.set(index, r)
        }
      })
    } catch (err) {
      for (const { test, index } of testsWithoutHooks) {
        resultsByIndex.set(index, handleWorkerError(test, err, rawResults))
      }
    }
  }

  // No beforeAll → unhooked tests can run in parallel on the main thread
  if (!hasBeforeAll && testsWithoutHooks.length > 0) {
    const promises = testsWithoutHooks.map(t => runTest(t.test, store, rawResults))
    const resolved = await Promise.all(promises)
    testsWithoutHooks.forEach(({ index }, i) => {
      const r = resolved[i]
      if (r && 'pass' in r) {
        resultsByIndex.set(index, r as TestResult)
      }
    })
  }

  // Hooked tests → individual workers
  if (testsWithHooks.length > 0) {
    const pool = getWorkerPool()
    const individualPromises = testsWithHooks.map(({ test, index }) =>
      pool(() =>
        isolation
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
          ),
      ),
    )

    const individualResults = await Promise.all(individualPromises)
    for (const { result, index } of individualResults) {
      resultsByIndex.set(index, result)
    }
  }

  const allResults: TestResult[] = []
  for (let i = 0; i < tests.length; i++) {
    const r = resultsByIndex.get(i)
    if (r) {
      allResults.push(r)
    }
  }

  return allResults
}

/**
 * Sequential execution with per-test hooks: the suite has beforeEach or
 * afterEach, so tests must run one at a time on the main thread to preserve
 * hook ordering.
 */
export const runSequentialHooked = async (
  args: BaseStrategyArgs,
): Promise<(TestResult | Suite)[]> => {
  const { tests, name, parent, pkg, store, rawResults, suiteObj } = args

  const results: (TestResult | Suite)[] = []
  for (const t of tests) {
    const test = wrapTest(t, name, parent, pkg)

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

/**
 * Plain parallel execution: no isolation or hooks involved.
 */
export const runParallelArray = async (
  args: Pick<BaseStrategyArgs, 'tests' | 'name' | 'parent' | 'pkg' | 'store' | 'rawResults'>,
): Promise<(TestResult | Suite)[]> => {
  const { tests, name, parent, pkg, store, rawResults } = args

  const promises = tests.map(t => runTest(wrapTest(t, name, parent, pkg), store, rawResults))
  const resolved = await Promise.all(promises)
  return resolved.filter(r => !!r)
}
