/**
 * Convert a file path to a forward-slash import path.
 * Handles both Windows (\) and POSIX (/) separators.
 * Uses literal backslash replacement for cross-platform correctness.
 */
export const toImportPath = p => p.replace(/\\/g, '/')
/**
 * Normalize a path by replacing all path separators with forward slashes.
 * Pure function: no I/O, deterministic.
 * Alias of toImportPath for readability.
 */
export const normalizeImportPath = toImportPath
/**
 * Check if a path string appears to use Windows-style separators.
 * Pure function: string-only check.
 */
export const usesWindowsSeparators = p => p.includes('\\')
/**
 * Build a normalized file path for cross-platform import resolution.
 * Pure function: only path manipulation.
 */
export const ensureForwardSlashes = p => toImportPath(p)
//# sourceMappingURL=pathTransform.js.map
