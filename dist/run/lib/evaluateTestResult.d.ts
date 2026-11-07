import type { EvaluateResult } from '../../types.js'
/**
 * Evaluate test result against expected value
 */
export declare const evaluateTestResult: (res: unknown, expect: unknown) => Promise<EvaluateResult>
