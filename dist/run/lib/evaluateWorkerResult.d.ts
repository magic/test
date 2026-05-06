import type { EvaluateResult } from '../../types.ts'
export declare const evaluateWorkerResult: (
  res: unknown,
  expect: unknown,
) => Promise<EvaluateResult>
