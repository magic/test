import type { TestResult } from '../../types.ts'
export declare const runSingleTestFromFileInWorker: (
  tests: unknown,
  testIndex: number,
  testPkg: string,
  testParent: string,
  testName: string,
) => Promise<TestResult>
