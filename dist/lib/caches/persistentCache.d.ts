interface SourceEntry {
  mtime: number
  hash: string
}
interface CacheManifest {
  version: number
  svelteVersion: string
  sources: Record<string, SourceEntry>
}
export declare const writeAtomic: (filePath: string, content: string) => Promise<void>
export declare const loadManifest: () => Promise<CacheManifest | null>
export declare const saveManifest: (manifest?: CacheManifest) => Promise<void>
export declare const getCachedCompile: (sourcePath: string) => Promise<{
  js: string
  css: unknown
} | null>
export declare const recordCompile: (sourcePath: string, compiledJs: string) => Promise<void>
export declare const clearCache: () => Promise<void>
export declare const getCacheDir: () => string
export {}
