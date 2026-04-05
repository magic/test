/**
 * Classify import type
 */
export const classifyImport = (
  importPath: string,
): 'relative' | 'scoped' | 'vite-alias' | 'bare' => {
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return 'relative'
  }
  if (importPath.startsWith('@')) {
    return 'scoped'
  }
  if (importPath.startsWith('$')) {
    return 'vite-alias'
  }
  return 'bare'
}
