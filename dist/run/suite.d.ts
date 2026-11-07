import type { Suite, SuiteInput } from '../types.js'
/**
 * Run a suite of tests (recursively).
 */
export declare const runSuite: (props: SuiteInput) => Promise<Suite | undefined>
