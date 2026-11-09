#!/usr/bin/env node
export interface BuildUnitCommandProps {
  isProd: boolean
  cwd: string
  name: string
  include: string[]
  exclude: string[] | null
  /** run via `node --test node-test-runner.js` instead of `node unit.js` */
  native?: boolean
}
/** coverage runtime options, applied by t.ts around the unit.js child */
export interface CoverageRuntimeOptions {
  /** directory V8 coverage data is written to (NODE_V8_COVERAGE) */
  tempDir: string
  /** reports output directory */
  reportsDir: string
  include: string[]
  exclude: string[]
  extensions: string[]
  all: boolean
  excludeAfterRemap: boolean
}
export interface UnitCommand {
  cmd: string
  argv: string[]
  coverage: CoverageRuntimeOptions | null
}
/**
 * Build the child command for the unit.js runner:
 *   prod:     node unit.js (no coverage)
 *   coverage: node unit.js, with t.ts setting NODE_V8_COVERAGE and running
 *             the local coverage report (src/lib/coverage) after exit.
 *
 * Pure helper, exported for testing.
 */
export declare const buildUnitCommand: ({
  isProd,
  cwd,
  name,
  include,
  exclude,
  native,
}: BuildUnitCommandProps) => UnitCommand
declare const _default: {
  run: () => Promise<void>
  buildUnitCommand: ({
    isProd,
    cwd,
    name,
    include,
    exclude,
    native,
  }: BuildUnitCommandProps) => UnitCommand
}
export default _default
