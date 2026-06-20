import type { CssObject } from './types.ts'
export interface CompileSvelteReturn {
  js: string
  css: CssObject | null
}
/**
 * Pure compilation function - caching handled by CacheManager in tsLoader
 * Uses pendingSvelteCompiles for deduplication
 */
export declare const compileSvelte: (filePath: string) => Promise<CompileSvelteReturn>
