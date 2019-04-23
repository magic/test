const path = require('path')
const cli = require('./cli')

const cwd = process.cwd()
const nodeModules = path.join(cwd, 'node_modules')
const { name } = require(path.join(cwd, 'package.json'))

// find clipaths
let cliPath = path.join(nodeModules, '.bin', 'nyc')
let cmd = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin', 'unit.js')
if (name === '@magic/test') {
  cmd = path.join(cwd, 'src', 'bin', 'unit.js')
}

const init = argv => {
  let args = ['--colors']

  if (argv['--exclude']) {
    const excludes = Array.from(
      new Set([
        'coverage/**',
        'packages/*/test/**',
        'test/**',
        'test{,-*}.js',
        '**/*{.,-}test.js',
        '**/__tests__/**',
        '**/{ava,babel,jest,nyc,rollup,webpack}.config.js',
        ...argv['--exclude'],
      ]),
    )
    excludes.forEach(ex => {
      args.push('--exclude')
      args.push(`"${ex}"`)
    })
  }

  args.push('-a')

  args.push('node')
  args.push(cmd)

  cli.spawn(cliPath, args)
}
module.exports = init
