/**
 * Canonical global hook file names (beforeAll/afterAll variants).
 *
 * Single source of truth — used by `run.ts` (execution order),
 * `bin/node-test-runner.ts` (file discovery), and `types.ts` (TestSuites keys).
 * The order within each list is the execution order.
 */
export const BEFORE_ALL_KEYS = [
  '/beforeAll.js',
  '/beforeall.js',
  '/beforeAll.ts',
  '/beforeall.ts',
  '/beforeAll.mjs',
  '/beforeall.mjs',
]
export const AFTER_ALL_KEYS = [
  '/afterAll.js',
  '/afterall.js',
  '/afterAll.ts',
  '/afterall.ts',
  '/afterAll.mjs',
  '/afterall.mjs',
]
/** Basenames of beforeAll hook files, in execution order. */
export const beforeAllFileNames = BEFORE_ALL_KEYS.map(k => k.slice(1))
/** Basenames of afterAll hook files, in execution order. */
export const afterAllFileNames = AFTER_ALL_KEYS.map(k => k.slice(1))
export const isBeforeAllFile = basename => beforeAllFileNames.includes(basename)
export const isAfterAllFile = basename => afterAllFileNames.includes(basename)
//# sourceMappingURL=hookFiles.js.map
