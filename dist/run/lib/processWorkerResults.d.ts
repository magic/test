import type { TestResult } from '../../types.js'

import log from '@magic/log'
export declare const processWorkerResults: (
  results: TestResult[],
  rawResults: TestResult[],
  logger?: typeof log.warn,
) => TestResult[]
