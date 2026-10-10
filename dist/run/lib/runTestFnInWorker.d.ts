import type { WrappedTest } from '#src/types.js'
type RunFnResult = {
  result: unknown
  pass: boolean
  exp: unknown
  expString: unknown
  afterCleanupError: unknown
  afterError: unknown
}
/**
 * Worker-side test execution: runs `before`, the shared runTestCore (fn +
 * expectation + timeout + after), and `afterCleanup` outside the isolation
 * scope. No error logging — worker output is not visible in the parent.
 */
export declare const runTestFnInWorker: (test: WrappedTest, key: string) => Promise<RunFnResult>
export {}
