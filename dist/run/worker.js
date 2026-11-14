import { parentPort, workerData } from 'node:worker_threads'
import is from '@magic/types'
import { restoreFromSnapshot } from './isolation.js'
import { createFailResult } from './lib/index.js'
import { runSingleTestFromFileInWorker, importFileInWorker, makeSafeClone } from './lib/index.js'
import { beginTimerScope } from '../lib/dom/globals.js'
import { prewarmWorkerModules } from './lib/prewarmWorkerModules.js'
import '../bin/lib/registerLoader.js'
const setupSuite = async suiteSnapshot => {
  if (suiteSnapshot && typeof suiteSnapshot === 'object' && 'props' in suiteSnapshot) {
    restoreFromSnapshot(suiteSnapshot)
  }
  const tests = await importFileInWorker(workerData.testFileUrl)
  let afterAllCleanup
  if (is.objectNative(tests) && is.function(tests.beforeAll)) {
    const result = await tests.beforeAll()
    if (is.function(result)) {
      afterAllCleanup = result
    }
  }
  return { tests, afterAllCleanup }
}
const runWithHooks = async (tests, fn) => {
  let started = false
  try {
    if (is.objectNative(tests) && is.function(tests.beforeEach)) {
      await tests.beforeEach()
    }
    started = true
    const result = await fn()
    if (is.objectNative(tests) && is.function(tests.afterEach)) {
      await tests.afterEach()
    }
    return result
  } catch (e) {
    // Only run afterEach when the test actually started (beforeEach succeeded).
    // Swallow afterEach errors so they don't mask the original error.
    if (started && is.objectNative(tests) && is.function(tests.afterEach)) {
      try {
        await tests.afterEach()
      } catch {
        // don't mask the original error
      }
    }
    throw e
  }
}
const cleanupSuite = async (tests, afterAllCleanup) => {
  if (afterAllCleanup) {
    await afterAllCleanup()
  }
  if (is.objectNative(tests) && is.function(tests.afterAll)) {
    await tests.afterAll()
  }
}
const makeErrorResult = (testName, error) =>
  createFailResult(
    {
      name: testName,
      parent: workerData.testParent || '',
      pkg: workerData.testPkg,
    },
    error,
  )
/**
 * Reduce every payload field that may carry non-cloneable values (functions
 * in result/expect/expString, hook errors) before postMessage; a single
 * unclonable value would throw DataCloneError and kill the worker mid-batch.
 */
const safeResult = r => ({
  ...r,
  result: makeSafeClone(r.result),
  expect: makeSafeClone(r.expect),
  expString: makeSafeClone(r.expString),
  afterCleanupError:
    r.afterCleanupError !== undefined ? makeSafeClone(r.afterCleanupError) : undefined,
  afterError: r.afterError !== undefined ? makeSafeClone(r.afterError) : undefined,
})
const main = async () => {
  const batchMode = workerData.batchMode === true
  // Worker-lifetime (suite) scope: beforeAll/afterAll timers die with the
  // worker's suite; per-test scopes (below) die per test. The worker is
  // terminated right after, so this is also the in-worker guarantee that no
  // test's timers leak into the next batch item or outlive the suite.
  const suiteScope = beginTimerScope()
  try {
    await suiteScope.run(() => (batchMode ? runBatchMode() : runSingleMode()))
  } finally {
    suiteScope.end()
  }
}
const runSingleMode = async () => {
  const { testIndex, testPkg, testParent, testName, suiteSnapshot } = workerData
  try {
    const { tests, afterAllCleanup } = await setupSuite(suiteSnapshot)
    let result
    const testScope = beginTimerScope()
    try {
      result = await testScope.run(() =>
        runWithHooks(tests, () =>
          runSingleTestFromFileInWorker(tests, testIndex, testPkg, testParent, testName),
        ),
      )
    } finally {
      testScope.end()
      await cleanupSuite(tests, afterAllCleanup)
    }
    const payload = safeResult(result)
    if (parentPort) {
      parentPort.postMessage(payload)
    }
  } catch (e) {
    if (parentPort) {
      parentPort.postMessage(safeResult(makeErrorResult(testName, e)))
    }
  }
}
const runBatchMode = async () => {
  const { testIndices, testPkg, testParent, testNames, suiteSnapshot } = workerData
  try {
    const { tests, afterAllCleanup } = await setupSuite(suiteSnapshot)
    // Move the one-time worker cost (component graph import/compile) out of
    // the first test's timeout budget: in a shared worker the first test
    // would otherwise carry it, and under load that is what flakes.
    await prewarmWorkerModules(tests)
    const results = []
    try {
      for (let i = 0; i < testIndices.length; i++) {
        const testIndex = testIndices[i]
        const testName = testNames[i]
        // Per-test scope: a batched test's timers never survive into the
        // next test in the same worker (same globalThis).
        const testScope = beginTimerScope()
        let result
        try {
          result = await testScope.run(() =>
            runWithHooks(tests, () =>
              runSingleTestFromFileInWorker(tests, testIndex, testPkg, testParent, testName),
            ),
          )
        } finally {
          testScope.end()
        }
        results.push(safeResult(result))
      }
    } finally {
      await cleanupSuite(tests, afterAllCleanup)
    }
    if (parentPort) {
      parentPort.postMessage(results)
    }
  } catch (e) {
    if (parentPort) {
      const results = testNames.map(name => safeResult(makeErrorResult(name, e)))
      parentPort.postMessage(results)
    }
  }
}
main()
//# sourceMappingURL=worker.js.map
