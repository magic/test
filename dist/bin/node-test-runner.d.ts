#!/usr/bin/env node
import type { WrappedTest, TestHooks, TestItem } from '../types.js'
/**
 * Internal suite type for node-test-runner
 */
export interface RunnerSuite {
  name: string
  tests: TestItem[]
  hooks: TestHooks | Record<string, unknown>
}
declare const discoveredFiles: string[]
export declare const scanDir: (dir: string) => Promise<void>
export declare const extractExport: (filePath: string) => Promise<Record<string, unknown> | null>
export declare const getTestName: (testObj: WrappedTest, filePath: string, index: number) => string
export declare const convertTest: (
  testObj: WrappedTest,
  filePath: string,
  index: number,
) => Promise<TestItem>
export declare const convertSuite: (tests: unknown, filePath: string) => Promise<TestItem[]>
export declare const processFile: (filePath: string) => Promise<RunnerSuite[]>
declare const main: () => Promise<void>
export { discoveredFiles }
export default main
