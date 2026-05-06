import type { EvaluateResult } from '../../types.js'
export declare const evaluateWorkerResult: (
  res: unknown,
  expect: unknown,
) => Promise<EvaluateResult>
