/**
 * Convert a file path to a forward-slash import path.
 * Handles both Windows (\) and POSIX (/) separators.
 * Uses literal backslash replacement for cross-platform correctness.
 */
export declare const toImportPath: (p: string) => string
/**
 * Normalize a path by replacing all path separators with forward slashes.
 * Pure function: no I/O, deterministic.
 * Alias of toImportPath for readability.
 */
export declare const normalizeImportPath: (p: string) => string
/**
 * Check if a path string appears to use Windows-style separators.
 * Pure function: string-only check.
 */
export declare const usesWindowsSeparators: (p: string) => boolean
/**
 * Build a normalized file path for cross-platform import resolution.
 * Pure function: only path manipulation.
 */
export declare const ensureForwardSlashes: (p: string) => string
