#!/usr/bin/env node

const cli = require('@magic/cli')

// const hlp = ['-h', '--help']
// const help = hlp.some(p => process.argv.includes(p))
//
// const ps = ['-p', '--prod', '--production']
// const prod = ps.some(p => process.argv.includes(p))

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

const argv = cli({
  options: [
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
