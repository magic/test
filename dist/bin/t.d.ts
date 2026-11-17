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
 * Effective CPU nice value for the unit.js child process: --nice flag /
 * MAGIC_TEST_NICE env, else 10. POSIX only - Node has no priority API and
 * Windows has no `nice` binary, so there the value is ignored (see
 * wrapWithNice).
 */
export declare const getEffectiveNice: () => number
/**
 * Whether the suite should yield CPU to other work: when the machine is
 * already busy (1-min load average above half the core count) the test run
 * is wrapped in `nice` so the user's own work stays responsive; on an idle
 * machine it runs at full speed.
 */
export declare const shouldYieldCpu: (load1: number, cores: number) => boolean
/** Per-file discovery/import budget: stock 30 s → 120 s when busy. */
export declare const discoveryTimeoutMs: (
  load1: number,
  cores: number,
  envValue?: string,
) => string | undefined
/** Per-test budget: stock 30 s → 300 s when busy. */
export declare const testTimeoutMs: (
  load1: number,
  cores: number,
  envValue?: string,
) => string | undefined
/** Worker round-trip backstop: stock 120 s → 600 s when busy (a batch of
 * starved tests may legitimately outlast the per-test budget). */
export declare const workerTimeoutMs: (
  load1: number,
  cores: number,
  envValue?: string,
) => string | undefined
/**
 * Wrap the runner command in `nice -n <value>` on POSIX so the whole test
 * process tree (main thread, worker threads, tsc type-checks, prewarm) runs
 * below user work and the machine stays responsive. No-op for value 0 and
 * on Windows. Pure helper, exported for testing.
 */
export declare const wrapWithNice: (command: UnitCommand, nice: number) => UnitCommand
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
