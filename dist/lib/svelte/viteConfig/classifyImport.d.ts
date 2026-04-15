/**
 * Classify import type
 */
export declare const classifyImport: (
  importPath: string,
) => 'relative' | 'scoped' | 'vite-alias' | 'bare'
