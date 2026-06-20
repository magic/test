export let TMP_DIR = 'test/.tmp'

export const CWD = process.cwd()

export const setTmpDir = (dir: string) => {
  TMP_DIR = dir
}

export const DEFAULT_TEST_TIMEOUT = 30_000

export const GLOBAL_MODIFICATION_RE = /(?:globalThis|window|global|self|process\.env)/
