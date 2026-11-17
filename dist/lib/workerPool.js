import os from 'node:os'
const MAX_QUEUE_SIZE = 1000
/**
 * Cap for the AUTO worker count. Every worker is a full V8 isolate
 * (loader + happy-dom + Svelte compilation), and the suite is
 * compile/DOM-bound rather than CPU-bound: beyond 4 concurrent workers the
 * wall-time gain is small while the machine pegs all cores and becomes
 * unresponsive. Explicit limits (--workers / MAGIC_TEST_WORKERS) bypass
 * this cap.
 */
export const DEFAULT_WORKER_CAP = 4
/** How often the load-adaptive limit re-checks the 1-minute load average. */
const ADAPTIVE_CHECK_MS = 5_000
export const computeDefaultWorkerLimit = cores =>
  Math.max(1, Math.min(cores - 2, DEFAULT_WORKER_CAP))
/**
 * Load-adaptive scaling of the auto (shared pool) limit, based on the
 * 1-minute load average:
 *   load <= cores          -> configured (full limit)
 *   cores < load <= 2*cores -> half (min 1)
 *   load >  2*cores        -> 1
 */
export const computeAdaptiveLimit = (configured, load1, cores) => {
  if (load1 <= cores) {
    return configured
  }
  if (load1 <= cores * 2) {
    return Math.max(1, Math.ceil(configured / 2))
  }
  return 1
}
const getEffectiveLimit = override => {
  if (override !== undefined) {
    return Math.max(1, override)
  }
  const envLimit = process.env.MAGIC_TEST_WORKERS
  if (envLimit) {
    const parsed = Number(envLimit)
    if (!Number.isNaN(parsed)) {
      return Math.max(1, Math.floor(parsed))
    }
  }
  return computeDefaultWorkerLimit(os.availableParallelism())
}
export const WORKER_LIMIT = getEffectiveLimit()
export const getEffectiveWorkerLimit = getEffectiveLimit
/**
 * Load-adaptive throttling of the shared pool: when the system is loaded
 * beyond its core count the shared pool shrinks so the suite leaves CPU for
 * whatever else is running (a frozen dev machine is worse than a slower
 * suite). Disabled with MAGIC_TEST_ADAPTIVE=0 and on CI (dedicated machine:
 * slowing down under load is pure waste).
 */
const adaptiveDisabled = () => process.env.MAGIC_TEST_ADAPTIVE === '0' || Boolean(process.env.CI)
let loadSampler = () => os.loadavg()[1] ?? 0
/** Test hook: replace the load-average source (pass undefined to restore). */
export const setLoadSampler = fn => {
  loadSampler = fn ?? (() => os.loadavg()[1] ?? 0)
}
let sharedConfigured = null
let sharedCurrent = null
let sharedPool = null
let timer = null
/** Test hook: current effective shared-pool limit (0 if never initialized). */
export const getSharedPoolLimitForTests = () => sharedCurrent ?? 0
const sharedLimitFn = () => {
  if (sharedCurrent !== null) {
    return sharedCurrent
  }
  sharedConfigured ??= getEffectiveLimit()
  return sharedConfigured
}
const updateAdaptiveLimit = () => {
  if (adaptiveDisabled()) {
    return sharedLimitFn()
  }
  sharedConfigured ??= getEffectiveLimit()
  const next = computeAdaptiveLimit(sharedConfigured, loadSampler(), os.availableParallelism())
  if (next !== sharedCurrent) {
    sharedCurrent = next
    sharedPool?.wake()
  }
  return sharedCurrent
}
/** Test hook: run one adaptive-limit update cycle immediately. */
export const tickAdaptiveLimitForTests = () => updateAdaptiveLimit()
const startTimer = () => {
  if (timer) {
    return
  }
  updateAdaptiveLimit()
  timer = setInterval(updateAdaptiveLimit, ADAPTIVE_CHECK_MS)
  timer.unref()
}
/**
 * Get a worker pool.
 *
 * Pools requested without an explicit limit share one process-wide pool, so
 * concurrently-running suites cannot multiply the worker count
 * (N suites × limit). Explicit limits get a dedicated pool.
 *
 * The shared pool's limit is load-adaptive (see updateAdaptiveLimit);
 * dedicated pools are static.
 */
export const getWorkerPool = limit => {
  if (limit === undefined) {
    if (!sharedPool) {
      sharedPool = createWorkerPool(sharedLimitFn)
      startTimer()
    }
    return sharedPool
  }
  return createWorkerPool(() => Math.max(1, limit))
}
const createWorkerPool = getLimit => {
  let running = 0
  const waitQueue = []
  const wake = () => {
    while (waitQueue.length > 0 && running < getLimit()) {
      const next = waitQueue.shift()
      running++
      next()
    }
  }
  const pool = async fn => {
    if (running < getLimit()) {
      running++
      return fn().finally(() => {
        running--
        wake()
      })
    }
    // Reject if queue is full to prevent unbounded memory growth
    if (waitQueue.length >= MAX_QUEUE_SIZE) {
      return Promise.reject(new Error(`Worker pool queue full (${MAX_QUEUE_SIZE} pending tasks)`))
    }
    return new Promise(resolve => {
      waitQueue.push(() => {
        resolve(
          fn().finally(() => {
            running--
            wake()
          }),
        )
      })
    })
  }
  return Object.assign(pool, { wake })
}
//# sourceMappingURL=workerPool.js.map
