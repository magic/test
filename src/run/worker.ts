import { parentPort, workerData } from 'node:worker_threads'

import is from '@magic/types'

import { restoreFromSnapshot } from './isolation.js'
import { createFailResult } from './lib/index.js'
import type { TestResult } from '../types.js'

import { runSingleTestFromFileInWorker, importFileInWorker, makeSafeClone } from './lib/index.js'

import '../bin/lib/registerLoader.js'

type SuiteSetup = {
  tests: unknown
  afterAllCleanup?: () => void | Promise<void>
}

const setupSuite = async (suiteSnapshot?: unknown): Promise<SuiteSetup> => {
  if (suiteSnapshot && typeof suiteSnapshot === 'object' && 'props' in suiteSnapshot) {
    restoreFromSnapshot(suiteSnapshot as import('../types.ts').Snapshot)
  }
  const tests = await importFileInWorker(workerData.testFileUrl)

  let afterAllCleanup: (() => void | Promise<void>) | undefined
  if (is.objectNative(tests) && is.function(tests.beforeAll)) {
    const result = await tests.beforeAll()
    if (is.function(result)) {
      afterAllCleanup = result
    }
  }

  return { tests, afterAllCleanup }
}

const runWithHooks = async <T>(tests: unknown, fn: () => Promise<T>): Promise<T> => {
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

const cleanupSuite = async (
  tests: unknown,
  afterAllCleanup?: () => void | Promise<void>,
): Promise<void> => {
  if (afterAllCleanup) {
    await afterAllCleanup()
  }
  if (is.objectNative(tests) && is.function(tests.afterAll)) {
    await tests.afterAll()
  }
}

const makeErrorResult = (testName: string, error: unknown): TestResult =>
  createFailResult(
    {
      name: testName,
      parent: workerData.testParent || '',
      pkg: workerData.testPkg,
    },
    error,
  ) as TestResult

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

    let result: TestResult | undefined
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

    const results: TestResult[] = []
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
      const results: TestResult[] = testNames.map((name: string) => makeErrorResult(name, e))
      parentPort.postMessage(results)
    }
  }
}

main()
