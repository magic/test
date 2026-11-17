#!/usr/bin/env node
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import cli from '@magic/cli'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'
import { abort } from '../run.js'
import { isolation } from '../run/isolation.js'
import * as stats from '../lib/stats/index.js'
import { RESULTS_FILE_ENV } from '../lib/stats/resultsFile.js'
const cwd = process.cwd()
let childProcess = null
let shutdownInProgress = false
const res = cli({
  options: [
    ['--verbose', '--loud', '--l', '-l'],
    ['--include', '--inc', '--i', '-i'],
    ['--exclude', '--e', '-e'],
    ['--shards', '--shard-count'],
    ['--shard-id'],
    ['--error-length'],
    ['--timeout', '--to', '-t'],
    ['--slow', '--timing', '-s'],
    ['--workers', '--w', '-w'],
    ['--nice'],
    ['--production', '--prod', '--p', '-p'],
    ['--native'],
  ],
  // env: [[['--production', '--prod', '--p', '-p'], 'NODE_ENV', 'production']],
  help: {
    name: '@magic/test t',
    options: {
      '--help': 'this help text',
      '--verbose': 'more output',
      '--include': 'files to include in coverage',
      '--exclude': 'files to exclude from coverage and .d.ts type tests',
      '--shards': 'total number of shards',
      '--shard-id': 'shard id (0-indexed)',
      '--error-length': 'max length for error strings (default 70, 0 = no limit)',
      '--timeout': 'test timeout in ms (default: 30000)',
      '--slow': 'show slowest tests (alias: --timing, -s)',
      '--timing': 'show slowest tests (alias: --slow, -s)',
      '--workers': 'max parallel workers (default: auto, env: MAGIC_TEST_WORKERS)',
      '--nice':
        'CPU nice value 0-19 for the test process (default 10 on macOS/Linux: keeps the machine responsive; 0 = no throttling, env: MAGIC_TEST_NICE)',
      '--native': 'use the Node.js native test runner (node --test) instead of the unit runner',
    },
    header: `
simple unit testing. runs all tests found in {cwd}/test/
see https://github.com/magic/test for info
`.trim(),
    example: `
Usage:
t -p => run tests without coverage
t    => run tests with coverage
t --native => run tests with the native node --test runner (with coverage)
t -s => show slowest tests
t -h => this help text

npm example:
"scripts": {
  "test": "t -p",
  "cover": "t",
  "slow": "t -s"
}
`.trim(),
  },
})
/**
 * Effective CPU nice value for the unit.js child process: --nice flag /
 * MAGIC_TEST_NICE env, else 10. POSIX only - Node has no priority API and
 * Windows has no `nice` binary, so there the value is ignored (see
 * wrapWithNice).
 */
export const getEffectiveNice = () => {
  const raw = process.env.MAGIC_TEST_NICE
  if (raw !== undefined) {
    const parsed = Number(raw)
    if (!Number.isNaN(parsed)) {
      return Math.min(19, Math.max(0, Math.floor(parsed)))
    }
  }
  return 10
}
/**
 * Whether the suite should yield CPU to other work: when the machine is
 * already busy (1-min load average above half the core count) the test run
 * is wrapped in `nice` so the user's own work stays responsive; on an idle
 * machine it runs at full speed.
 */
export const shouldYieldCpu = (load1, cores) => load1 > cores / 2
/**
 * Wall-clock budgets for the unit.js child, in ms. When the machine is busy
 * at spawn (load1 > cores / 2), starved work — file imports, test bodies,
 * worker round-trips — can take far longer than the stock budgets even
 * without nice (the worker pool fights for CPU), so the budgets follow the
 * load, not the nice decision. An explicit env value always wins. Returns
 * undefined when the stock default applies (env left unset).
 * Pure helper, exported for testing.
 */
const busyBudgetMs = (load1, cores, envValue, busyMs) => {
  if (envValue !== undefined && envValue !== '') {
    return envValue
  }
  return shouldYieldCpu(load1, cores) ? busyMs : undefined
}
/** Per-file discovery/import budget: stock 30 s → 120 s when busy. */
export const discoveryTimeoutMs = (load1, cores, envValue) =>
  busyBudgetMs(load1, cores, envValue, '120000')
/** Per-test budget: stock 30 s → 300 s when busy. */
export const testTimeoutMs = (load1, cores, envValue) =>
  busyBudgetMs(load1, cores, envValue, '300000')
/** Worker round-trip backstop: stock 120 s → 600 s when busy (a batch of
 * starved tests may legitimately outlast the per-test budget). */
export const workerTimeoutMs = (load1, cores, envValue) =>
  busyBudgetMs(load1, cores, envValue, '600000')
/**
 * Wrap the runner command in `nice -n <value>` on POSIX so the whole test
 * process tree (main thread, worker threads, tsc type-checks, prewarm) runs
 * below user work and the machine stays responsive. No-op for value 0 and
 * on Windows. Pure helper, exported for testing.
 */
export const wrapWithNice = (command, nice) => {
  if (nice <= 0 || process.platform === 'win32') {
    return command
  }
  return { ...command, cmd: 'nice', argv: ['-n', String(nice), command.cmd, ...command.argv] }
}
/**
 * Build the child command for the unit.js runner:
 *   prod:     node unit.js (no coverage)
 *   coverage: node unit.js, with t.ts setting NODE_V8_COVERAGE and running
 *             the local coverage report (src/lib/coverage) after exit.
 *
 * Pure helper, exported for testing.
 */
export const buildUnitCommand = ({ isProd, cwd, name, include, exclude, native = false }) => {
  let binPath = path.join(cwd, 'node_modules', '@magic', 'test', 'dist', 'bin')
  if (name === '@magic/test') {
    binPath = path.join(cwd, 'dist', 'bin')
  }
  const binFile = path.join(binPath, native ? 'node-test-runner.js' : 'unit.js')
  const runnerArgv = native ? ['--test', binFile] : [binFile]
  if (isProd) {
    return { cmd: 'node', argv: runnerArgv, coverage: null }
  }
  const excludes = (exclude ?? ['test']).map(String)
  // Always exclude declaration files from coverage. A bare `.d.ts` glob would
  // only match a literal hidden file named `.d.ts`, so use `**/*.d.ts` to
  // match declaration files at any depth.
  const DTS_EXCLUDE = '**/*.d.ts'
  if (!excludes.includes(DTS_EXCLUDE)) {
    excludes.push(DTS_EXCLUDE)
  }
  const reportsDir = path.join(cwd, 'coverage')
  return {
    cmd: 'node',
    argv: runnerArgv,
    coverage: {
      tempDir: path.join(reportsDir, 'tmp'),
      reportsDir,
      include: include.map(String),
      exclude: excludes,
      extensions: ['.js', '.mjs', '.ts', '.svelte'],
      all: true,
      excludeAfterRemap: true,
    },
  }
}
const run = async () => {
  const pkgPath = path.join(cwd, 'package.json')
  const content = await fs.readFile(pkgPath, 'utf-8')
  const { name, version } = JSON.parse(content)
  log(`### ${log.color('green', 'Testing package:')} ${name}@${version}\n`)
  const isProd = res.args.production
  if (isProd) {
    process.env.MAGIC_TEST_ENV = 'production'
  }
  const includeArgs = res.args.include || ['src']
  const userExclude = res.args.exclude
  const { shards, shardId, errorLength, timeout, workers, nice } = res.args
  const include = (is.array(includeArgs) ? includeArgs : [includeArgs]).map(String)
  const exclude = userExclude
    ? (is.array(userExclude) ? userExclude : [userExclude]).map(String)
    : null
  // Forward verbose to the child process via env (argv is not inherited)
  if (res.args.verbose) {
    process.env.MAGIC_TEST_VERBOSE = '1'
  }
  if (res.args.slow || res.args.timing) {
    process.env.MAGIC_TEST_TIMING = '1'
  }
  // Set env vars (read by the unit.js child process and the worker pool)
  if (shards) {
    process.env.MAGIC_TEST_SHARDING_SHARDS = String(shards)
  }
  if (shardId) {
    process.env.MAGIC_TEST_SHARDING_ID = String(shardId)
  }
  if (errorLength !== undefined) {
    process.env.MAGIC_TEST_ERROR_LENGTH = String(errorLength)
  }
  if (timeout !== undefined) {
    process.env.MAGIC_TEST_TIMEOUT = String(timeout)
  }
  if (workers !== undefined) {
    process.env.MAGIC_TEST_WORKERS = String(workers)
  }
  if (nice !== undefined) {
    process.env.MAGIC_TEST_NICE = String(nice)
  }
  // Forward --exclude so the unit runner can exclude the same files/dirs from
  // the auto-generated .d.ts type-check suites (only user-passed excludes;
  // the coverage-only 'test' default is already covered by SKIP_DIRS).
  if (exclude) {
    process.env.MAGIC_TEST_EXCLUDE = JSON.stringify(exclude)
  }
  // Enable Node.js source map capture for coverage remapping: Node caches
  // the source map of every loaded script in the V8 coverage data, which
  // the local coverage report uses to map dist/*.js back to src/*.ts.
  process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '')
    .split(' ')
    .filter(Boolean)
    .concat(['--enable-source-maps'])
    .join(' ')
  const niceValue = getEffectiveNice()
  const [load1Raw] = os.loadavg()
  const cores = os.availableParallelism()
  const load1 = load1Raw ?? 0
  const yieldCpu = niceValue > 0 && shouldYieldCpu(load1, cores)
  // Wall-clock budgets (discovery/import, per-test, worker round-trip) are
  // bumped independently of the nice decision: on a busy machine starved
  // work can exceed the stock budgets even without nice, so the budgets
  // follow the load, not the priority. An explicit env value (or --timeout
  // for the per-test budget) wins.
  const discoveryTimeout = discoveryTimeoutMs(
    load1,
    cores,
    process.env.MAGIC_TEST_DISCOVERY_TIMEOUT,
  )
  if (discoveryTimeout) {
    process.env.MAGIC_TEST_DISCOVERY_TIMEOUT = discoveryTimeout
  }
  const testTimeout = testTimeoutMs(load1, cores, process.env.MAGIC_TEST_TIMEOUT)
  if (testTimeout) {
    process.env.MAGIC_TEST_TIMEOUT = testTimeout
  }
  const workerTimeout = workerTimeoutMs(load1, cores, process.env.MAGIC_TEST_WORKER_TIMEOUT_MS)
  if (workerTimeout) {
    process.env.MAGIC_TEST_WORKER_TIMEOUT_MS = workerTimeout
  }
  const { cmd, argv, coverage } = wrapWithNice(
    buildUnitCommand({
      isProd,
      cwd,
      name,
      include,
      exclude,
      native: res.args.native,
    }),
    yieldCpu ? niceValue : 0,
  )
  // prepare the V8 coverage temp directory (c8 used to do this for us)
  // resultsFile: the unit.js child writes the run summary there so it can be
  // printed AFTER the coverage report. Not set for `t --native`: the native
  // runner keeps node --test's own summary, and its test files can spawn
  // unit.js children (test/workerDeath.ts) that would clobber the file.
  let spawnEnv = process.env
  let resultsFile = null
  if (coverage) {
    await fs.rmrf(coverage.tempDir)
    await fs.mkdirp(coverage.tempDir)
    if (!res.args.native) {
      resultsFile = path.join(coverage.tempDir, 'results.json')
    }
    spawnEnv = {
      ...process.env,
      NODE_V8_COVERAGE: coverage.tempDir,
      ...(resultsFile ? { [RESULTS_FILE_ENV]: resultsFile } : {}),
    }
  }
  childProcess = await cli.spawn(cmd, argv, { env: spawnEnv })
  // Wait for the child and adopt its exit code. Without ref() the parent
  // exits immediately after spawn and reports 0 no matter what unit.js did.
  childProcess.ref()
  childProcess.on('exit', async (code, signal) => {
    if (code === null && signal) {
      process.exitCode = 1
    } else if (code !== null && code !== 0) {
      process.exitCode = code
    }
    if (coverage) {
      try {
        await stats.coverage({
          tempDir: coverage.tempDir,
          cwd,
          include: coverage.include,
          exclude: coverage.exclude,
          extensions: coverage.extensions,
          all: coverage.all,
          excludeAfterRemap: coverage.excludeAfterRemap,
        })
      } catch (err) {
        log.error(err)
      }
      // unit.js wrote the run summary to resultsFile; the native runner never
      // does, so for `t --native` this silently no-ops
      if (resultsFile) {
        stats.summary(resultsFile)
      }
    }
  })
  childProcess.on('error', err => {
    log.error(err)
    process.exitCode = 1
  })
}
const gracefulShutdown = async () => {
  log.warn('Received shutdown signal, aborting tests...')
  if (childProcess) {
    const pid = childProcess.pid
    if (pid) {
      try {
        process.kill(-pid, 'SIGTERM')
      } catch {
        // process group already gone
      }
    }
    childProcess = null
  } else {
    await isolation.terminateAllWorkers()
    await abort()
    process.exitCode = 1
  }
}
const forceShutdown = async () => {
  log.warn('Forcing shutdown...')
  if (childProcess) {
    const pid = childProcess.pid
    if (pid) {
      try {
        process.kill(-pid, 'SIGKILL')
      } catch {
        // process group already gone
      }
    }
    childProcess = null
  } else {
    process.exitCode = 137
  }
}
const shutdown = async (force = false) => {
  if (shutdownInProgress) {
    return
  }
  shutdownInProgress = true
  if (force) {
    await forceShutdown()
  } else {
    await gracefulShutdown()
    setTimeout(() => {
      shutdown(true)
    }, 5000)
  }
}
// Only run the CLI when executed directly (node dist/bin/t.js). Importing
// this module (e.g. from tests) must not spawn the child runner or install
// global signal handlers.
// fs.realpathSync resolves symlinks so the check works when the bin is invoked
// via a symlinked node_modules (e.g. pnpm, npm workspaces).
const isMain =
  process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  run()
  process
    .on('SIGTERM', () => shutdown(false))
    .on('SIGINT', () => shutdown(false))
    .on('SIGHUP', () => shutdown(false))
}
export default { run, buildUnitCommand }
//# sourceMappingURL=t.js.map
