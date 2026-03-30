/**
 * @typedef {Record<string, unknown>} TestSuitesRecord
 */
/** @type {boolean} */
export let aborted: boolean
export function abort(): Promise<void>
export function resetAbort(): void
export function run(
  tests: TestSuites | (() => TestSuites),
  options?: RunOptions,
): Promise<Error | void>
export type TestSuitesRecord = Record<string, unknown>
export type RunOptions = {
  /**
   * - Number of shards to split tests into
   */
  shards?: number | undefined
  /**
   * - Which shard to run (0-indexed)
   */
  shardId?: number | undefined
}
//# sourceMappingURL=run.d.ts.map
