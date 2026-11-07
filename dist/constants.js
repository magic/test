// Persistent disk cache for compiled Svelte files
export const CACHE_DIR = 'node_modules/.magic-test-cache'
/**
 * Current working directory, read lazily so process.chdir() is respected.
 */
export const getCwd = () => process.cwd()
export const DEFAULT_TEST_TIMEOUT = 30_000
//# sourceMappingURL=constants.js.map
