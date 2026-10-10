import type { WrappedTest } from '../../types.js'
type RunTestCoreOptions = {
  /** Unique test key (for timeout + logging). */
  key: string
  /** The test to run (fn, expect, runs, timeout, after are read from it). */
  test: WrappedTest
  /** Runs fn once and returns its result (handles component mounting, etc.). */
  invoke: () => Promise<unknown>
  /**
   * Error logger. Optional because worker threads have no visible output —
   * the main thread passes a real logger, workers pass nothing.
   */
  logError?: (code: string, info: Record<string, unknown>) => void
}
type RunTestCoreResult = {
  result: unknown
  pass: boolean
  exp: unknown
  expString: unknown
  afterError?: unknown
}
/**
 * Shared test-execution core: the `runs` loop, expectation evaluation,
 * timeout, and after-hook handling used by BOTH the main-thread path
 * (run/test.ts) and the worker path (runTestFnInWorker.ts).
 *
 * Keeping this in one place ensures the two paths can't diverge.
 */
export declare const runTestCore: (options: RunTestCoreOptions) => Promise<RunTestCoreResult>
export {}
