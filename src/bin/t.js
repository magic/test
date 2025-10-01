#!/usr/bin/env node

import path from 'node:path'

import cli from '@magic/cli'
import fs from '@magic/fs'
import is from '@magic/types'

const cwd = process.cwd()
const res = cli({
  options: [
    ['--verbose', '--loud', '--l', '-l'],
    ['--include', '--inc', '--i', '-i'],
    ['--exclude', '--e', '-e'],
  ],
  env: [[['--production', '--prod', '--p', '-p'], 'NODE_ENV', 'production']],
  help: {
    name: '@magic/test t',
    options: {
      '--help': 'this help text',
      '--verbose': 'more output',
      '--include': 'files to include in coverage',
      '--exclude': 'files to exclude from coverage',
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
  const { name } = JSON.parse(content)

  const isProd = res.env.NODE_ENV === 'production'

  let binPath = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin')
  if (name === '@magic/test') {
    binPath = path.join(cwd, 'src', 'bin')
  }

  const binFile = path.join(binPath, 'unit.js')

  const isWin = process.platform === 'win32'

  let cmd = 'node'
  /** @type {string[]} */
  let argv = []

  const includeArgs = res.args.include || ['src']
  const excludeArgs = res.args.exclude || ['.tmp']

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
  argv.push(binFile)

  if (process.argv.length > 2) {
    const [_1, _2, ...argvs] = process.argv
    argv = [...argv, ...argvs]
  }

  if (!isProd) {
    const c8Cmd = isWin ? 'c8.cmd' : 'c8'
    cmd = path.join(cwd, 'node_modules', '.bin', c8Cmd)
    argv = ['--all', ...argv]
  }

  await cli.spawn(cmd, argv)
}

run()
