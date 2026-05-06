import log from '@magic/log'
import type { TestResult } from '../../types.ts'
export declare const processWorkerResults: (
  results: TestResult[],
  rawResults: TestResult[],
  logger?: typeof log.warn,
) => TestResult[]
