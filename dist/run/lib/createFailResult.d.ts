import type { WrappedTest, TestResult } from '#src/types.js'
/**
 * Create a failure result. Optionally attach a cleaned error.
 */
export declare const createFailResult: (
  testToRun: WrappedTest,
  errorArg?: unknown,
) => TestResult & {
  error?: unknown
}
