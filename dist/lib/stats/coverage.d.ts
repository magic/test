import type { CoverageOptions } from '../coverage/types.js'
export type { CoverageOptions }
/**
 * Prints the text coverage report from the V8 coverage data in opts.tempDir.
 *
 * Must run in the parent of the instrumented process: Node flushes
 * NODE_V8_COVERAGE at process exit, so the child that ran the tests cannot
 * read its own coverage.
 */
export declare const coverage: (opts: CoverageOptions) => Promise<void>
