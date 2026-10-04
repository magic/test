import log from '@magic/log'
import type { TestResult } from '#src/types.js'
export declare const processWorkerResults: (
  results: TestResult[],
  rawResults: TestResult[],
  logger?: typeof log.warn,
) => TestResult[]
