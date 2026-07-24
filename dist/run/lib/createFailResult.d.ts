import type { WrappedTest, TestResult } from '../../types.ts'
/**
 * Create a failure result. Optionally attach a cleaned error.
 */
export declare const createFailResult: (
  testToRun: WrappedTest,
  errorArg?: unknown,
) => TestResult & {
  error?: unknown
}
