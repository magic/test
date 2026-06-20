import type { TestSuites } from '../../types.ts'
/**
 * Reset visitedDirs between test runs to prevent stale symlink cycle detection
 */
export declare const resetVisitedDirs: () => void
export declare const readRecursive: (dir?: string) => Promise<TestSuites>
