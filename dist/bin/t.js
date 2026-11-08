#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cli from '@magic/cli'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'
import { abort } from '../run.js'
import { isolation } from '../run/isolation.js'
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
    ['--production', '--prod', '--p', '-p'],
  ],
  // env: [[['--production', '--prod', '--p', '-p'], 'NODE_ENV', 'production']],
  help: {
    name: '@magic/test t',
    options: {
      '--help': 'this help text',
      '--verbose': 'more output',
      '--include': 'files to include in coverage',
      '--exclude': 'files to exclude from coverage',
      '--shards': 'total number of shards',
      '--shard-id': 'shard id (0-indexed)',
      '--error-length': 'max length for error strings (default 70, 0 = no limit)',
      '--timeout': 'test timeout in ms (default: 30000)',
      '--slow': 'show slowest tests (alias: --timing, -s)',
      '--timing': 'show slowest tests (alias: --slow, -s)',
      '--workers': 'max parallel workers (default: auto, env: MAGIC_TEST_WORKERS)',
    },
    header: `
simple unit testing. runs all tests found in {cwd}/test/
see https://github.com/magic/test for info
`.trim(),
    example: `
Usage:
t -p => run tests without coverage
t    => run tests with coverage
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
 * Build the child command for the unit.js runner:
 *   prod:  node unit.js
 *   other: c8 --exclude ... --source-maps ... --include ... node unit.js
 *
 * Pure helper, exported for testing.
 */
export const buildUnitCommand = ({ isProd, isWin, cwd, name, include, exclude }) => {
  let binPath = path.join(cwd, 'node_modules', '@magic', 'test', 'dist', 'bin')
  if (name === '@magic/test') {
    binPath = path.join(cwd, 'dist', 'bin')
  }
  const binFile = path.join(binPath, 'unit.js')
  if (isProd) {
    return { cmd: 'node', argv: [binFile] }
  }
  const c8Excludes = (exclude ?? ['test']).map(String)
  // Always exclude declaration files from coverage. A bare `.d.ts` glob would
  // only match a literal hidden file named `.d.ts`, so use `**/*.d.ts` to
  // match declaration files at any depth.
  const DTS_EXCLUDE = '**/*.d.ts'
  if (!c8Excludes.includes(DTS_EXCLUDE)) {
    c8Excludes.push(DTS_EXCLUDE)
  }
  const cmd = path.join(cwd, 'node_modules', '.bin', isWin ? 'c8.cmd' : 'c8')
  const argv = [
    ...c8Excludes.flatMap(ex => ['--exclude', ex]),
    '--source-maps',
    '--extension',
    '.js',
    '--extension',
    '.mjs',
    '--extension',
    '.ts',
    '--extension',
    '.svelte',
    '--exclude-after-remap',
    '--all',
    ...include.flatMap(inc => ['--include', inc]),
    'node',
    binFile,
  ]
  return { cmd, argv }
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
  const isWin = process.platform === 'win32'
  const includeArgs = res.args.include || ['src']
  const userExclude = res.args.exclude
  const { shards, shardId, errorLength, timeout, workers } = res.args
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
  // Enable Node.js source map capture for c8 coverage remapping
  process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '')
    .split(' ')
    .filter(Boolean)
    .concat(['--enable-source-maps'])
    .join(' ')
  const { cmd, argv } = buildUnitCommand({ isProd, isWin, cwd, name, include, exclude })
  childProcess = await cli.spawn(cmd, argv)
  // Wait for the child and adopt its exit code. Without ref() the parent
  // exits immediately after spawn and reports 0 no matter what unit.js did.
  childProcess.ref()
  childProcess.on('exit', (code, signal) => {
    if (code === null && signal) {
      process.exitCode = 1
    } else if (code !== null && code !== 0) {
      process.exitCode = code
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
