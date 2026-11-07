export declare const WORKER_LIMIT: number
export declare const getEffectiveWorkerLimit: (override?: number) => number
/**
 * Get a worker pool.
 *
 * Pools requested without an explicit limit share one process-wide pool, so
 * concurrently-running suites cannot multiply the worker count
 * (N suites × limit). Explicit limits get a dedicated pool.
 */
export declare const getWorkerPool: (limit?: number) => <T>(fn: () => Promise<T>) => Promise<T>
