#!/usr/bin/env node

const path = require('path')
const { exec } = require('child_process')
const { cli } = require('./cli')

// const hlp = ['-h', '--help']
// const help = hlp.some(p => process.argv.indexOf(p) > -1)
//
// const ps = ['-p', '--prod', '--production']
// const prod = ps.some(p => process.argv.indexOf(p) > -1)

const help = `
  @magic/test t
  simple unit testing. runs all tests found in {cwd}/test
  see https://github.com/magic/test for info

  Usage:
  t -p => run quick tests
  t    => run slow tests with coverage through nyc
  t -h => this help text

  Aliases:
  -p, --prod, --production
  -h, --help

  npm example:
  "scripts": {
    "test": "t -p",
    "cover": "t"
  }
`

const argv = cli({
  options: [['--production', '--prod', '-p'], ['--verbose', '--loud', '-l']],
  env: [['-p', 'NODE_ENV', 'production']],
  help,
})

if (process.env.NODE_ENV === 'production') {
  exec(path.join(__dirname, 'unit.js'), (...a) => console.log(a.join(' ')))
} else {
  exec(path.join(__dirname, 'coverage.js'), (...a) => console.log(a.join(' ')))
}
