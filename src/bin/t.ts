#!/usr/bin/env node

import path from 'node:path'

import cli from '@magic/cli'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'

import { abort } from '../run.ts'

const cwd = process.cwd()
const res = cli({
  options: [
    ['--verbose', '--loud', '--l', '-l'],
    ['--include', '--inc', '--i', '-i'],
    ['--exclude', '--e', '-e'],
    ['--shards', '--shard-count'],
    ['--shard-id'],
    ['--error-length'],
    ['--timeout', '--to', '-t'],
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
      '--timeout': 'test timeout in ms (default: 10000)',
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

  let binPath = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin')
  if (name === '@magic/test') {
    binPath = path.join(cwd, 'src', 'bin')
  }

  const binFile = path.join(binPath, 'unit.ts')

  const isWin = process.platform === 'win32'

  let cmd = 'node'

  let argv: string[] = []

  const includeArgs = res.args.include || ['src']
  const excludeArgs = res.args.exclude || []
  const shards = res.args.shards
  const shardId = res.args.shardId
  const errorLength = res.args.errorLength
  const timeout = res.args.timeout

  const include = is.array(includeArgs) ? includeArgs : [includeArgs]
  const exclude = is.array(excludeArgs) ? excludeArgs : [excludeArgs]

  if (!isProd) {
    exclude.forEach(ex => {
      argv = ['--exclude', ex, ...argv]
    })

    include.forEach(inc => {
      argv = ['--include', inc, ...argv]
    })
  }

  // Set shard environment variables
  if (shards) {
    process.env.MAGIC_TEST_SHARDING_SHARDS = shards
  }
  if (shardId) {
    process.env.MAGIC_TEST_SHARDING_ID = shardId
  }
  if (errorLength !== undefined) {
    process.env.MAGIC_TEST_ERROR_LENGTH = String(errorLength)
  }
  if (timeout !== undefined) {
    process.env.MAGIC_TEST_TIMEOUT = String(timeout)
  }

  argv.push(binFile)

  if (process.argv.length > 2) {
    const [, , ...argvs] = process.argv
    argv = [...argv, ...argvs]
  }

  if (!isProd) {
    // Insert 'node' before the script so c8 can execute it properly
    const binIndex = argv.indexOf(binFile)
    if (binIndex !== -1) {
      argv.splice(binIndex, 0, 'node')
    } else {
      // If binFile not found (shouldn't happen), prepend node
      argv = ['node', ...argv]
    }

    const c8Cmd = isWin ? 'c8.cmd' : 'c8'
    cmd = path.join(cwd, 'node_modules', '.bin', c8Cmd)
    argv = [
      '--all',
      '--extension',
      '.js',
      '--extension',
      '.ts',
      '--extension',
      '.svelte',
      '--exclude-after-remap',
      ...argv,
    ]
  }

  await cli.spawn(cmd, argv)
}

run()

const shutdown = async () => {
  log.warn('Received shutdown signal, aborting tests...')
  await abort()
  process.exit(1)
}

process.on('SIGTERM', shutdown).on('SIGINT', shutdown)
