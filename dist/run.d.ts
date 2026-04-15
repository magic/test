import type { TestSuites } from './types.js'
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
 * @returns {Promise<Error | void>}
 */
export declare const run: (
  tests: TestSuites | (() => TestSuites),
  options?: RunOptions,
) => Promise<Error | void>
export {}
