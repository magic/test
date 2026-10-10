import type { TestSuites } from './types.ts'
/**
 * @typedef {Record<string, unknown>} TestSuitesRecord
 */
/** @type {boolean} */
export declare let aborted: boolean
/**
 * Abort the current test run and clean up temp directories
 */
export declare const abort: () => Promise<void>
/**
 * Reset abort flag
 */
export declare const resetAbort: () => void
type RunOptions = {
  shards?: number
  shardId?: number
  workers?: number
  clearCache?: boolean
  globalStartTime?: [number, number]
}
/**
 * Outcome of a completed test run.
 */
export type RunResult = {
  /** true if any test failed */
  failed: boolean
}
/**
 * @typedef {Object} RunOptions
 * @property {number} [shards] - Number of shards to split tests into
 * @property {number} [shardId] - Which shard to run (0-indexed)
 */
/**
 * Run all test suites
 * @param {TestSuites | (() => TestSuites)} tests - Test suites object or function that returns one
 * @param {RunOptions} [options] - Run options including sharding
 * @returns {Promise<RunResult | Error | void>} - Run result, an error if no tests were found, or void if aborted
 */
export declare const run: (
  tests: TestSuites | (() => TestSuites),
  options?: RunOptions,
) => Promise<RunResult | Error | void>
export {}
