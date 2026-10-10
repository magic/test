import { Store } from '../lib/store.js'
import type { WrappedTest, TestResult, Suite } from '../types.js'
/**
 * Run a test or delegate to a suite.
 *
 * - If `test.fn` exists → executes the test and returns a `TestResult`.
 * - If only `test.tests` exists → delegates to {@link runSuite}, which returns a `Suite`.
 */
export declare const runTest: (
  test: WrappedTest,
  store: Store,
  rawResults?: TestResult[],
) => Promise<TestResult | Suite | undefined>
