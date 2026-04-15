/**
 * Classify import type
 */
export const classifyImport = importPath => {
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
