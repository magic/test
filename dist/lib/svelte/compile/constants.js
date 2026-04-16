import path from 'node:path'
export let TMP_DIR = path.join(process.cwd(), 'test', '.tmp')
export const SVELTE_IMPORT_REGEX =
  /import\s+((?:\{[^}]*\}|\* as \w+|\w+))\s+from\s+['"]([^'"]+)['"]/g
export const setTmpDir = dir => {
  TMP_DIR = dir
}
