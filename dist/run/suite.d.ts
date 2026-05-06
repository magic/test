import type { Suite, SuiteInput } from '../types.ts'
/**
 * Run a suite of tests (recursively).
 */
export declare const runSuite: (props: SuiteInput) => Promise<Suite | undefined>
