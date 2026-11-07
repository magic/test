import { parentPort, workerData } from 'node:worker_threads'
import is from '@magic/types'
import { restoreFromSnapshot } from './isolation.js'
import { createFailResult } from './lib/index.js'
import { runSingleTestFromFileInWorker, importFileInWorker, makeSafeClone } from './lib/index.js'
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
const main = async () => {
  const batchMode = workerData.batchMode === true
  if (batchMode) {
    await runBatchMode()
  } else {
    await runSingleMode()
  }
}
const runSingleMode = async () => {
  const { testIndex, testPkg, testParent, testName, suiteSnapshot } = workerData
  try {
    const { tests, afterAllCleanup } = await setupSuite(suiteSnapshot)
    let result
    try {
      result = await runWithHooks(tests, () =>
        runSingleTestFromFileInWorker(tests, testIndex, testPkg, testParent, testName),
      )
    } finally {
      await cleanupSuite(tests, afterAllCleanup)
    }
    const payload = {
      ...result,
      result: makeSafeClone(result?.result),
    }
    if (parentPort) {
      parentPort.postMessage(payload)
    }
  } catch (e) {
    if (parentPort) {
      parentPort.postMessage(makeErrorResult(testName, e))
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
        const result = await runWithHooks(tests, () =>
          runSingleTestFromFileInWorker(tests, testIndex, testPkg, testParent, testName),
        )
        results.push({
          ...result,
          result: makeSafeClone(result.result),
        })
      }
    } finally {
      await cleanupSuite(tests, afterAllCleanup)
    }
    if (parentPort) {
      parentPort.postMessage(results)
    }
  } catch (e) {
    if (parentPort) {
      const results = testNames.map(name => makeErrorResult(name, e))
      parentPort.postMessage(results)
    }
  }
}
main()
//# sourceMappingURL=worker.js.map
