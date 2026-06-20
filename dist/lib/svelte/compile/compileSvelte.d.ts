import type { CssObject } from './types.ts'
export interface CompileSvelteReturn {
  js: string
  css: CssObject | null
}
/**
 * Pure compilation function - no caching logic here
 * Caching is handled by the CacheManager in tsLoader
 */
export declare const compileSvelte: (filePath: string) => Promise<CompileSvelteReturn>
