export function runTest(test: Test, store?: Store): Promise<TestResult | Suite | undefined>
/**
 * Prepare test by setting defaults and extracting component props
 */
export type ComponentProps = Record<string, unknown>
/**
 * Evaluate test result against expected value
 */
export type EvaluateResult = {
  pass: boolean
  exp: unknown
  expString: unknown
}
import { Store } from '../lib/store.js'
//# sourceMappingURL=test.d.ts.map
