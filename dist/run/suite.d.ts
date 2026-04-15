import { Store } from '../lib/store.js'
import type { Suite, TestResult, SuiteInput } from '../types.ts'
/**
 * Run a suite of tests (recursively).
 */
export declare const runSuite: (
  props: SuiteInput & {
    store: Store
    rawResults?: TestResult[]
  },
) => Promise<Suite | undefined>
