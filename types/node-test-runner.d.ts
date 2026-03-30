#!/usr/bin/env node
export default run
/**
 * Internal test item type for node-test-runner
 */
export type TestItem = {
  name: string
  fn: () => Promise<void>
  before?: HookFunction | undefined
  after?: HookFunction | undefined
}
/**
 * Internal test item type for node-test-runner
 */
export type HookFunction = () => void | Promise<void>
/**
 * Internal suite type for node-test-runner
 */
export type RunnerSuite = {
  name: string
  tests: TestItem[]
  hooks: TestHooks
}
declare function run(): Promise<void>
//# sourceMappingURL=node-test-runner.d.ts.map
