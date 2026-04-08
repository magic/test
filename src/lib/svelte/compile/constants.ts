export let TMP_DIR = 'test/.tmp'

export const SVELTE_IMPORT_REGEX =
  /import\s+((?:\{[^}]*\}|\* as \w+|\w+))\s+from\s+['"]([^'"]+)['"]/g

export const setTmpDir = (dir: string) => {
  TMP_DIR = dir
}
