import { maybeInjectMagic } from './maybeInjectMagic.js'
import { readRecursive as readRecursiveFn, resetVisitedDirs } from './readRecursive.js'

export { resetVisitedDirs, maybeInjectMagic }

// Re-export with explicit type for the progress callback parameter
export const readRecursive: typeof readRecursiveFn = readRecursiveFn
