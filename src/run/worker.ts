import { parentPort, workerData } from 'node:worker_threads'

import is from '@magic/types'

import { cleanError, getTestKey } from '../lib/index.ts'
import { restoreFromSnapshot } from './isolation.ts'
import type { TestResult } from '../types.ts'

import { runSingleTestFromFileInWorker, importFileInWorker, makeSafeClone } from './lib/index.ts'

import '../bin/lib/registerLoader.js'

const main = async () => {
  const batchMode = workerData.batchMode === true

  if (batchMode) {
    await runBatchMode()
  } else {
    await runSingleMode()
  }
}

const runSingleMode = async () => {
  const { testFileUrl, testIndex, testPkg, testParent, testName, suiteSnapshot } = workerData

  try {
    if (suiteSnapshot) {
      restoreFromSnapshot(suiteSnapshot)
    }

    const tests = await importFileInWorker(testFileUrl)

    let afterAllCleanup: (() => void | Promise<void>) | undefined
    if (is.objectNative(tests) && is.function(tests.beforeAll)) {
      const result = await tests.beforeAll()
      if (is.function(result)) {
        afterAllCleanup = result
      }
    }

    let result: TestResult | undefined
    try {
      if (is.objectNative(tests) && is.function(tests.beforeEach)) {
        await tests.beforeEach()
      }
      result = await runSingleTestFromFileInWorker(tests, testIndex, testPkg, testParent, testName)
    } finally {
      if (is.objectNative(tests) && is.function(tests.afterEach)) {
        await tests.afterEach()
      }
      if (afterAllCleanup) {
        await afterAllCleanup()
      }
      if (is.objectNative(tests) && is.function(tests.afterAll)) {
        await tests.afterAll()
      }
    }

    const payload = {
      ...result,
      result: makeSafeClone(result.result),
    }
    if (parentPort) {
      parentPort.postMessage(payload)
    }
  } catch (e) {
    if (parentPort) {
      parentPort.postMessage({
        result: undefined,
        msg: '',
        pass: false,
        parent: testParent || '',
        name: testName,
        expect: undefined,
        expString: undefined,
        key: getTestKey(testPkg, testParent, testName),
        info: '',
        pkg: testPkg,
        error: cleanError(is.error(e) ? e : new Error(String(e))),
      })
    }
  }
}

const runBatchMode = async () => {
  const { testFileUrl, testIndices, testPkg, testParent, testNames, suiteSnapshot } = workerData

  try {
    if (suiteSnapshot) {
      restoreFromSnapshot(suiteSnapshot)
    }

    const tests = await importFileInWorker(testFileUrl)

    let afterAllCleanup: (() => void | Promise<void>) | undefined
    if (is.objectNative(tests) && is.function(tests.beforeAll)) {
      const result = await tests.beforeAll()
      if (is.function(result)) {
        afterAllCleanup = result
      }
    }

    const results: TestResult[] = []
    try {
      for (let i = 0; i < testIndices.length; i++) {
        const testIndex = testIndices[i]
        const testName = testNames[i]

        if (is.objectNative(tests) && is.function(tests.beforeEach)) {
          await tests.beforeEach()
        }

        const result = await runSingleTestFromFileInWorker(
          tests,
          testIndex,
          testPkg,
          testParent,
          testName,
        )
        results.push({
          ...result,
          result: makeSafeClone(result.result),
        })

        if (is.objectNative(tests) && is.function(tests.afterEach)) {
          await tests.afterEach()
        }
      }
    } finally {
      if (afterAllCleanup) {
        await afterAllCleanup()
      }
      if (is.objectNative(tests) && is.function(tests.afterAll)) {
        await tests.afterAll()
      }
    }

    if (parentPort) {
      parentPort.postMessage(results)
    }
  } catch (e) {
    if (parentPort) {
      const results: TestResult[] = testNames.map((testName: string) => ({
        result: undefined,
        msg: '',
        pass: false,
        parent: testParent || '',
        name: testName,
        expect: undefined,
        expString: undefined,
        key: getTestKey(testPkg, testParent, testName),
        info: '',
        pkg: testPkg,
        error: cleanError(is.error(e) ? e : new Error(String(e))),
      }))
      parentPort.postMessage(results)
    }
  }
}

main()
