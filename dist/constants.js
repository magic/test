export let TMP_DIR = 'test/.tmp'
export const CWD = process.cwd()
export const SVELTE_IMPORT_REGEX =
  /import\s+((?:\{[^}]*\}|\* as \w+|\w+))\s+from\s+['"]([^'"]+)['"]/g
export const setTmpDir = dir => {
  TMP_DIR = dir
}
export const DEFAULT_TEST_TIMEOUT = 10_000
export const GLOBAL_MODIFICATION_RE = /(?:globalThis|window|global|self|process\.env)/
