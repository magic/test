import type { CssObject } from './types.ts'
export interface CompileSvelteReturn {
  js: string
  css: CssObject | null
  map?: string
}
/**
 * Pure compilation function - caching handled by CacheManager in tsLoader
 * Uses pendingPromises for deduplication
 */
export declare const compileSvelte: (filePath: string) => Promise<CompileSvelteReturn>
