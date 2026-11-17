interface SourceEntry {
  mtime: number
  /** File size at record time. Together with mtime this is a fast-path
   *  validator in getCachedCompile (stat instead of read+sha256); the hash
   *  remains the authoritative check and is always recorded. Old entries
   *  without size simply skip the fast path. */
  size?: number
  hash: string
}
interface CacheManifest {
  version: number
  svelteVersion: string
  sources: Record<string, SourceEntry>
}
export declare const getCacheRelPath: (sourcePath: string) => string
export declare const writeAtomic: (filePath: string, content: string) => Promise<void>
export declare const loadManifest: () => Promise<CacheManifest | null>
export declare const saveManifest: (manifest?: CacheManifest) => Promise<void>
export declare const getCachedCompile: (sourcePath: string) => Promise<{
  js: string
  css: unknown
} | null>
export declare const recordCompile: (sourcePath: string, compiledJs: string) => Promise<void>
export declare const clearCache: () => Promise<void>
/**
 * One-shot cleanup of manifest entries whose source no longer exists (e.g.
 * /tmp fixture packages created by test runs). Called at run start, best
 * effort — a failed sweep never affects the run. Individual stale entries
 * are also dropped lazily by getCachedCompile when it hits a missing source.
 */
export declare const sweepStaleManifest: () => Promise<number>
export declare const getCacheDir: () => string
export {}
