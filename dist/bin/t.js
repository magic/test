#!/usr/bin/env node
import path from 'node:path'
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
    ['--workers', '--w', '-w'],
  ],
  env: [[['--production', '--prod', '--p', '-p'], 'NODE_ENV', 'production']],
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
      '--workers': 'max parallel workers (default: auto, env: MAGIC_TEST_WORKERS)',
    },
    header: `
simple unit testing. runs all tests found in {cwd}/test/
see https://github.com/magic/test for info
`.trim(),
    example: `
Usage:
t -p => run tests without coverage
t    => run slow tests with coverage
t -h => this help text

npm example:
"scripts": {
  "test": "t -p",
  "cover": "t"
}
`.trim(),
  },
})
const run = async () => {
  const pkgPath = path.join(cwd, 'package.json')
  const content = await fs.readFile(pkgPath, 'utf-8')
  const { name, version } = JSON.parse(content)
  log(`### ${log.color('green', 'Testing package:')} ${name}@${version}\n`)
  const isProd = res.env.NODE_ENV === 'production'
  let binPath = path.join(cwd, 'node_modules', '@magic', 'test', 'dist', 'bin')
  if (name === '@magic/test') {
    binPath = path.join(cwd, 'dist', 'bin')
  }
  const binFile = path.join(binPath, 'unit.js')
  const isWin = process.platform === 'win32'
  const includeArgs = res.args.include || ['src']
  const userExclude = res.args.exclude
  const { shards, shardId, errorLength, timeout, workers } = res.args
  const include = (is.array(includeArgs) ? includeArgs : [includeArgs]).map(String)
  // Forward verbose to the child process via env (argv is not inherited)
  if (res.args.verbose) {
    process.env.MAGIC_TEST_VERBOSE = '1'
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
  // Build the child command in one place:
  //   prod:  node unit.js
  //   other: c8 --exclude ... --source-maps ... --include ... node unit.js
  let cmd
  let argv
  if (isProd) {
    cmd = 'node'
    argv = [binFile]
  } else {
    const c8Excludes = (
      userExclude ? (is.array(userExclude) ? userExclude : [userExclude]) : ['test']
    ).map(String)
    // Always exclude .d.ts from coverage
    if (!c8Excludes.includes('.d.ts')) {
      c8Excludes.push('.d.ts')
    }
    cmd = path.join(cwd, 'node_modules', '.bin', isWin ? 'c8.cmd' : 'c8')
    argv = [
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
  }
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
run()
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
process
  .on('SIGTERM', () => shutdown(false))
  .on('SIGINT', () => shutdown(false))
  .on('SIGHUP', () => shutdown(false))
//# sourceMappingURL=t.js.map
