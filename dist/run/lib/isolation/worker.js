/* ---------------------------------------------------------------------------
 * Worker-thread execution for isolated tests.
 *
 * Spawns a worker (src/run/worker.ts) to run one test or a batch of tests in
 * a fresh V8 context. Active workers are tracked via the provided Set so the
 * owning Isolation instance can terminate them all on shutdown.
 * -------------------------------------------------------------------------- */
import { Worker } from 'node:worker_threads'
/**
 * Create a worker promise with shared error/signal handling.
 */
const createWorkerPromise = (worker, transform, activeWorkers) => {
  const WORKER_TIMEOUT_MS = parseInt(process.env.MAGIC_TEST_WORKER_TIMEOUT_MS || '120000', 10)
  return new Promise((resolve, reject) => {
    activeWorkers.add(worker)
    let settled = false
    let timeout
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
      void worker.terminate()
      reject(new Error(`Worker round-trip timed out after ${WORKER_TIMEOUT_MS} ms`))
    }, WORKER_TIMEOUT_MS)
    worker.on('message', result => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      void worker.terminate()
      resolve(transform(result))
    })
    worker.on('error', err => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      void worker.terminate()
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
export const executeInWorker = (options, activeWorkers) => {
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
  return createWorkerPromise(worker, r => r, activeWorkers)
}
/**
 * Run multiple tests in a single worker for better performance.
 */
export const executeBatchInWorker = (options, activeWorkers) => {
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
  return createWorkerPromise(worker, r => r, activeWorkers)
}
//# sourceMappingURL=worker.js.map
