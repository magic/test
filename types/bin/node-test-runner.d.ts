#!/usr/bin/env node
export default run
/**
 * Internal suite type for node-test-runner
 * Uses TestSuite hooks but with TestHooks interface
 */
export type RunnerSuite = {
  name: string
  tests: TestItem[]
  hooks: TestHooks
}
declare function run(): Promise<void>
//# sourceMappingURL=node-test-runner.d.ts.map
