/**
 * Canonical global hook file names (beforeAll/afterAll variants).
 *
 * Single source of truth — used by `run.ts` (execution order),
 * `bin/node-test-runner.ts` (file discovery), and `types.ts` (TestSuites keys).
 * The order within each list is the execution order.
 */
export declare const BEFORE_ALL_KEYS: readonly [
  '/beforeAll.js',
  '/beforeall.js',
  '/beforeAll.ts',
  '/beforeall.ts',
  '/beforeAll.mjs',
  '/beforeall.mjs',
]
export declare const AFTER_ALL_KEYS: readonly [
  '/afterAll.js',
  '/afterall.js',
  '/afterAll.ts',
  '/afterall.ts',
  '/afterAll.mjs',
  '/afterall.mjs',
]
export type BeforeAllKey = (typeof BEFORE_ALL_KEYS)[number]
export type AfterAllKey = (typeof AFTER_ALL_KEYS)[number]
/** Basenames of beforeAll hook files, in execution order. */
export declare const beforeAllFileNames: string[]
/** Basenames of afterAll hook files, in execution order. */
export declare const afterAllFileNames: string[]
export declare const isBeforeAllFile: (basename: string) => boolean
export declare const isAfterAllFile: (basename: string) => boolean
