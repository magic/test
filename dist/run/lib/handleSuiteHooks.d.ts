import type { TestCollection, CleanupResult } from '#src/types.js'
/**
 * Handle suite-level beforeAll and afterAll hooks
 */
export declare const handleSuiteHooks: (tests: TestCollection) => Promise<CleanupResult>
