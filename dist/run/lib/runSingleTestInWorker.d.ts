import type { WrappedTest, TestResult } from '#src/types.js'
export declare const runSingleTestInWorker: (
  test: WrappedTest,
  testKey: string,
  testPkg: string,
  testParent: string,
  testName: string,
) => Promise<TestResult>
