import type { TestCollection } from '../types.ts'
/**
 * Check if any test in the suite needs isolation (has before/after hooks OR modifies globals)
 */
export declare const suiteNeedsIsolation: (tests: TestCollection) => boolean
export declare const suiteBeforeAllModifiesGlobalState: (tests: TestCollection) => boolean
