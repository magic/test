import type { TestCollection, CleanupResult } from '../../types.ts'
/**
 * Handle suite-level beforeAll and afterAll hooks
 */
export declare const handleSuiteHooks: (tests: TestCollection) => Promise<CleanupResult>
