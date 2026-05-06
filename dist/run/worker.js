import { parentPort, workerData } from 'node:worker_threads'
import is from '@magic/types'
import { cleanError, getTestKey } from '../lib/index.js'
import { restoreFromSnapshot } from './isolation.js'
import { runSingleTestFromFileInWorker, importFileInWorker, makeSafeClone } from './lib/index.js'
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
    let afterAllCleanup
    if (is.objectNative(tests) && is.function(tests.beforeAll)) {
      const result = await tests.beforeAll()
      if (is.function(result)) {
        afterAllCleanup = result
      }
    }
    let result
    try {
      result = await runSingleTestFromFileInWorker(tests, testIndex, testPkg, testParent, testName)
    } finally {
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
    let afterAllCleanup
    if (is.objectNative(tests) && is.function(tests.beforeAll)) {
      const result = await tests.beforeAll()
      if (is.function(result)) {
        afterAllCleanup = result
      }
    }
    const results = []
    try {
      for (let i = 0; i < testIndices.length; i++) {
        const testIndex = testIndices[i]
        const testName = testNames[i]
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
      const results = testNames.map(testName => ({
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
