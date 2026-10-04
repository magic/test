import type { TestResult } from '#src/types.js'
export declare const runSingleTestFromFileInWorker: (
  tests: unknown,
  testIndex: number,
  testPkg: string,
  testParent: string,
  testName: string,
) => Promise<TestResult>
