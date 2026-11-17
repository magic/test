/**
 * Cap for the AUTO worker count. Every worker is a full V8 isolate
 * (loader + happy-dom + Svelte compilation), and the suite is
 * compile/DOM-bound rather than CPU-bound: beyond 4 concurrent workers the
 * wall-time gain is small while the machine pegs all cores and becomes
 * unresponsive. Explicit limits (--workers / MAGIC_TEST_WORKERS) bypass
 * this cap.
 */
export declare const DEFAULT_WORKER_CAP = 4
export declare const computeDefaultWorkerLimit: (cores: number) => number
/**
 * Load-adaptive scaling of the auto (shared pool) limit, based on the
 * 1-minute load average:
 *   load <= cores          -> configured (full limit)
 *   cores < load <= 2*cores -> half (min 1)
 *   load >  2*cores        -> 1
 */
export declare const computeAdaptiveLimit: (
  configured: number,
  load1: number,
  cores: number,
) => number
export declare const WORKER_LIMIT: number
export declare const getEffectiveWorkerLimit: (override?: number) => number
/** Test hook: replace the load-average source (pass undefined to restore). */
export declare const setLoadSampler: (fn?: () => number) => void
/** Test hook: current effective shared-pool limit (0 if never initialized). */
export declare const getSharedPoolLimitForTests: () => number
/** Test hook: run one adaptive-limit update cycle immediately. */
export declare const tickAdaptiveLimitForTests: () => number
type WorkerPool = (<T>(fn: () => Promise<T>) => Promise<T>) & {
  wake: () => void
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
export declare const getWorkerPool: (limit?: number) => WorkerPool
export {}
