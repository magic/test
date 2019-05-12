#!/usr/bin/env node

const cli = require('@magic/cli')
const path = require('path')

const cwd = process.cwd()
const { name } = require(path.join(cwd, 'package.json'))

const help = {
  name: '@magic/test t',
  header: `
simple unit testing. runs all tests found in {cwd}/test
see https://github.com/magic/test for info`,
  example: `
Usage:
t -p => run quick tests
t    => run slow tests with coverage through nyc
t -h => this help text

npm example:
"scripts": {
  "test": "t -p",
  "cover": "t"
}`,
}

const { argv } = cli({
  options: [
    ['--verbose', '--loud', '--l', '-l'],
    ['--include', '--inc', '--i', '-i'],
    ['--exclude', '--e', '-e'],
  ],
  env: [[['--production', '--prod', '--p', '-p'], 'NODE_ENV', 'production']],
  help,
})

let binPath = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin')
if (name === '@magic/test') {
  binPath = path.join(cwd, 'src', 'bin')
}

const cmd = path.join(binPath, 'unit.mjs')
if (process.env.NODE_ENV === 'production') {
  cli.spawn(`node --experimental-modules ${cmd}`)
} else {
  cli.spawn(`node_modules/.bin/c8 -n src node --experimental-modules ${cmd}`)
}
