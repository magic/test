import type { Test } from '../../types.js'
/**
 * Suite key prefix for the virtual .d.ts test suites.
 *
 * The key is a path-like string with a leading slash (e.g. `/__dts__/src/app.d.ts`)
 * so it matches the convention of file-based suite keys (e.g. `/spec.ts`).
 * Every test in a d.ts suite shares the suite key, exactly like the tests of a
 * normal file suite share the file path - this is what makes the runner's final
 * failure summary (`* fail:` block, keyed on `test.key === suite.name`) print
 * the per-test detail for these virtual suites.
 */
export declare const DTS_SUITE_PREFIX = '/__dts__/'
/**
 * Build the full set of virtual .d.ts test suites for a project.
 *
 * Each .d.ts file becomes one virtual suite:
 * - a `file compiles` test (the declaration file is valid TypeScript)
 * - one test per declared symbol (interfaces, types, classes, enums,
 *   functions, values, ambient modules, globals)
 *
 * A failing test throws a message that names the declaration and the exact
 * TypeScript diagnostic(s), and carries the same message in its `info` so the
 * failure is still visible in the final summary.
 *
 * IMPORTANT: the test functions must stay free of source-level literals that
 * the suite heuristics pattern-match on (`globalThis`, `window`, `self`,
 * `process.env`, `fs.xxx('...')`) - otherwise the runner would route these
 * tests to workers, which re-import test files from disk and cannot see
 * virtual suites. All compiler work happens in `checkAll` (imported, and run
 * at collection time), never inside the test functions.
 */
export declare const buildDtsTestSuites: (root: string) => Promise<Record<string, Test[]>>
