/* ---------------------------------------------------------------------------
 * Worker-thread execution for isolated tests.
 *
 * Spawns a worker (src/run/worker.ts) to run one test or a batch of tests in
 * a fresh V8 context. Active workers are tracked via the provided Set so the
 * owning Isolation instance can terminate them all on shutdown.
 * -------------------------------------------------------------------------- */

import type { Snapshot, TestResult } from '../../../types.js'

import { Worker } from 'node:worker_threads'

/**
 * Terminations in flight: a settled round-trip calls worker.terminate(), but
 * the thread keeps running (and its ref'd handle keeps the main process
 * alive) until it actually exits. Track every terminate() promise so the end
 * of a run can wait for them — otherwise a slow teardown (large-heap GC,
 * loaded machine) delays process exit from milliseconds to minutes.
 */
const pendingWorkerExits = new Set<Promise<void>>()

const trackTermination = (worker: Worker): void => {
  // `const` works: the .finally closure only runs after the assignment has
  // completed, so the TDZ is never hit.
  const pending: Promise<void> = worker
    .terminate()
    .then(() => undefined)
    .catch(() => undefined) // already-exited / killed workers reject; ignore
    .finally(() => {
      pendingWorkerExits.delete(pending)
    })
  pendingWorkerExits.add(pending)
}

/**
 * Wait up to timeoutMs for all in-flight worker terminations to complete.
 * Resolves true when everything drained, false on timeout (the caller
 * decides — the CLI hard-exits, a library consumer can wait longer).
 * The timeout timer is unref'd: it never keeps the process alive on its own.
 */
export const drainIsolationWorkers = (timeoutMs = 15_000): Promise<boolean> =>
  new Promise(resolve => {
    let settled = false
    const finish = (drained: boolean): void => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      resolve(drained)
    }
    const timer = setTimeout(() => finish(false), timeoutMs)
    timer.unref()
    void (async () => {
      while (!settled && pendingWorkerExits.size > 0) {
        await Promise.all([...pendingWorkerExits])
      }
      if (!settled) {
        finish(pendingWorkerExits.size === 0)
      }
    })()
  })

/**
 * Create a worker promise with shared error/signal handling.
 */
const createWorkerPromise = <T>(
  worker: Worker,
  transform: (result: unknown) => T,
  activeWorkers: Set<Worker>,
): Promise<T> => {
  const WORKER_TIMEOUT_MS = parseInt(process.env.MAGIC_TEST_WORKER_TIMEOUT_MS || '120000', 10)

  return new Promise((resolve, reject) => {
    activeWorkers.add(worker)

    let settled = false
    let timeout: ReturnType<typeof setTimeout> | undefined

    const cleanup = () => {
      activeWorkers.delete(worker)
      if (timeout) {
        clearTimeout(timeout)
        timeout = undefined
      }
    }

    // Backstop for workers that are stuck but alive (e.g. a hung remote
    // fetch): the per-test withTimeout runs inside the worker and cannot
    // rescue a stalled worker, so bound the whole round-trip here.
    timeout = setTimeout(() => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      trackTermination(worker)
      reject(new Error(`Worker round-trip timed out after ${WORKER_TIMEOUT_MS} ms`))
    }, WORKER_TIMEOUT_MS)

    worker.on('message', result => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      trackTermination(worker)
      resolve(transform(result))
    })

    worker.on('error', err => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      trackTermination(worker)
      reject(err)
    })

    // Treat exit without a prior result message as a failure in ALL modes
    // (batch workers previously ignored every exit code; single-mode workers
    // only rejected non-zero exits) — a worker death must never leave the
    // promise pending forever.
    worker.on('exit', code => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      reject(new Error(`Worker exited with code ${code} without posting a result`))
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

  return createWorkerPromise(worker, r => r as TestResult, activeWorkers)
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

  return createWorkerPromise(worker, r => r as TestResult[], activeWorkers)
}
