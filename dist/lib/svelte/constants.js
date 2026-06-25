// Shared regex patterns for Svelte compilation pipeline
// Pre-compiled with /u flag for unicode safety
// NOTE: Most patterns moved to AST functions in astParse.ts for better reliability
// SVELTE_RUNE_REGEX, SVELTE_COMPILED_REGEX, SVELTE_REEXPORT_REGEX, SVELTE_DEFAULT_REEXPORT_REGEX,
// EXPORT_STAR_REGEX, EXPORT_NAMED_REGEX are now in astParse.ts
export const SVELTE_IMPORT_REGEX =
  /import\s+((?:\{[^}]*\}|\* as \w+|\w+))\s+from\s+['"]([^'"]+)['"]/gu
