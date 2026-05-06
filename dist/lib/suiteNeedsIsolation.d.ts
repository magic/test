import type { TestCollection } from '../types.ts'
/**
 * Check if any test in the suite needs isolation (has before/after hooks)
 */
export declare const suiteNeedsIsolation: (tests: TestCollection) => boolean
