/**
 * Look up a cached transformation.
 * Returns the transformed code, or `code` itself when the cached result was
 * "no change", or null on a miss.
 */
export declare const getResolveTransform: (
  code: string,
  sourceDir: string,
) => Promise<string | null>
/**
 * Store a transformation result. Fire-and-forget: callers must not await this
 * on hot paths. Safe to call with transformed === code (stores a sentinel).
 */
export declare const recordResolveTransform: (
  code: string,
  sourceDir: string,
  transformed: string,
) => void
/**
 * Remove all cached transformations (used by clearCache).
 */
export declare const clearResolveTransformCache: () => Promise<void>
