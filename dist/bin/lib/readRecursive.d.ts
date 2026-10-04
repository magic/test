import type { TestSuites } from '#src/types.js'
/**
 * Reset visitedDirs between test runs to prevent stale symlink cycle detection
 */
export declare const resetVisitedDirs: () => void
type ProgressCallback = (count: number) => void
export declare const readRecursive: (
  dir?: string,
  onProgress?: ProgressCallback,
) => Promise<TestSuites>
export {}
