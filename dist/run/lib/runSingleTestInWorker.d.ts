import type { WrappedTest, TestResult } from '../../types.ts'
export declare const runSingleTestInWorker: (
  test: WrappedTest,
  testKey: string,
  testPkg: string,
  testParent: string,
  testName: string,
) => Promise<TestResult>
