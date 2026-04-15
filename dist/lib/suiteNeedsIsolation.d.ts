import type { TestCollection } from '../types.js'
/**
 * Check if any test in the suite needs isolation (has before/after hooks)
 */
export declare const suiteNeedsIsolation: (tests: TestCollection) => boolean
