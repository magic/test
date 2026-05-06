import type { WrappedTest } from '../../types.ts'
/**
 * Type guard to check if an object has test properties (fn or tests).
 */
export declare const hasTestProperties: (obj: unknown) => obj is WrappedTest
