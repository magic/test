interface SourceEntry {
  mtime: number
  hash: string
}
interface CacheManifest {
  version: number
  svelteVersion: string
  sources: Record<string, SourceEntry>
}
export declare function loadManifest(): Promise<CacheManifest | null>
export declare function saveManifest(manifest?: CacheManifest): Promise<void>
export declare function getCachedCompile(sourcePath: string): Promise<{
  js: string
  css: unknown
} | null>
export declare function recordCompile(sourcePath: string, compiledJs: string): Promise<void>
export declare function clearCache(): Promise<void>
export declare function getCacheDir(): string
export {}
