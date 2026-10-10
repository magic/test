/* ---------------------------------------------------------------------------
 * Worker-thread execution for isolated tests.
 *
 * Spawns a worker (src/run/worker.ts) to run one test or a batch of tests in
 * a fresh V8 context. Active workers are tracked via the provided Set so the
 * owning Isolation instance can terminate them all on shutdown.
 * -------------------------------------------------------------------------- */

import { Worker } from 'node:worker_threads'

import type { Snapshot, TestResult } from '../../../types.ts'

/**
 * Create a worker promise with shared error/signal handling.
 */
const createWorkerPromise = <T>(
  worker: Worker,
  transform: (result: unknown) => T,
  activeWorkers: Set<Worker>,
  rejectOnNonZero = false,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    activeWorkers.add(worker)

    let settled = false
    const cleanup = () => {
      activeWorkers.delete(worker)
      worker.terminate()
    }

    worker.on('message', result => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      resolve(transform(result))
    })

    worker.on('error', err => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      reject(err)
    })

    worker.on('exit', code => {
      if (settled) {
        return
      }
      if (code !== 0 && rejectOnNonZero) {
        settled = true
        cleanup()
        reject(new Error(`Worker exited with code ${code}`))
      }
    })
  })
}

/**
 * Run a single test in a worker thread for true isolation.
 */
export const executeInWorker = (
  options: {
    testFileUrl: string
    testIndex: number
    testPkg: string
    testParent: string
    testName: string
    suiteSnapshot?: Snapshot
  },
  activeWorkers: Set<Worker>,
): Promise<TestResult> => {
  const worker = new Worker(new URL('../../worker.js', import.meta.url), {
    workerData: {
      testFileUrl: options.testFileUrl,
      testIndex: options.testIndex,
      testPkg: options.testPkg,
      testParent: options.testParent,
      testName: options.testName,
      suiteSnapshot: options.suiteSnapshot,
    },
  })

  return createWorkerPromise(worker, r => r as TestResult, activeWorkers, true)
}

/**
 * Run multiple tests in a single worker for better performance.
 */
export const executeBatchInWorker = (
  options: {
    testFileUrl: string
    testIndices: number[]
    testPkg: string
    testParent: string
    testNames: string[]
    suiteSnapshot?: Snapshot
  },
  activeWorkers: Set<Worker>,
): Promise<TestResult[]> => {
  const worker = new Worker(new URL('../../worker.js', import.meta.url), {
    workerData: {
      testFileUrl: options.testFileUrl,
      testIndices: options.testIndices,
      testPkg: options.testPkg,
      testParent: options.testParent,
      testNames: options.testNames,
      suiteSnapshot: options.suiteSnapshot,
      batchMode: true,
    },
  })

  return createWorkerPromise(worker, r => r as TestResult[], activeWorkers, false)
}
