import { readRecursive as readRecursiveFn, resetVisitedDirs } from './readRecursive.ts'
import { maybeInjectMagic } from './maybeInjectMagic.ts'

export { resetVisitedDirs, maybeInjectMagic }

// Re-export with explicit type for the progress callback parameter
export const readRecursive: typeof readRecursiveFn = readRecursiveFn
