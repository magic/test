#!/usr/bin/env node

const cli = require('./cli')

// const hlp = ['-h', '--help']
// const help = hlp.some(p => process.argv.includes(p))
//
// const ps = ['-p', '--prod', '--production']
// const prod = ps.some(p => process.argv.includes(p))

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
  options: [
    ['--production', '--prod', '--p', '-p'],
    ['--verbose', '--loud', '--l', '-l'],
    ['--include', '--inc', '--i', '-i'],
    ['--exclude', '--e', '-e'],
  ],
  env: [[['--production', '--prod', '--p', '-p'], 'NODE_ENV', 'production']],
  help,
})

if (process.env.NODE_ENV === 'production') {
  require('./unit')
} else {
  require('./coverage')(argv)
}
