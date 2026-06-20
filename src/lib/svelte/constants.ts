// Shared regex patterns for Svelte compilation pipeline
// Pre-compiled with /u flag for unicode safety

export const SVELTE_IMPORT_REGEX =
  /import\s+((?:\{[^}]*\}|\* as \w+|\w+))\s+from\s+['"]([^'"]+)['"]/gu

// Svelte runes that appear in SOURCE files (e.g., $state, $derived)
// This matches rune declarations, not compiled output
export const SVELTE_RUNE_REGEX =
  /\$(?:state|derived|effect|props|bindable|state\.config|effect\.pre|effect\.post|derived\.by)\b/u

// Pattern to detect already-compiled Svelte output - these indicate the file doesn't need compilation
export const SVELTE_COMPILED_REGEX = /import\s+\*\s+as\s+\$\s+from\s+['"]svelte\/internal\//u

// Re-export patterns for detecting Svelte re-exports in JS files
export const SVELTE_REEXPORT_REGEX = /export\s+\{[^}]*\}\s+from\s+['"][^'"]*\.svelte['"]/gu
export const SVELTE_DEFAULT_REEXPORT_REGEX = /export\s+.*\s+from\s+['"][^'"]*\.svelte['"]/gu
export const EXPORT_STAR_REGEX = /export\s+\*\s+from\s+['"]([^'"]+)['"]/gu
export const EXPORT_NAMED_REGEX = /export\s+\{\s*\w[\w\s,]*\}\s+from\s+['"]([^'"]+)['"]/gu
