import type { WrappedTest, TestResult } from '../../types.ts'
export declare const handleWorkerError: (
  testToRun: WrappedTest,
  error: unknown,
  rawResults: TestResult[],
  logger?: (error: string | Error, ...msg: unknown[]) => boolean,
) => TestResult
