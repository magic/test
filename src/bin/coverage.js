const path = require('path')
const cli = require('@magic/cli')

const cwd = process.cwd()
const nodeModules = path.join(cwd, 'node_modules')
const { name } = require(path.join(cwd, 'package.json'))

// find clipaths
let cliPath = path.join(nodeModules, '.bin', 'nyc')
let cmd = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin', 'unit.mjs')
if (name === '@magic/test') {
  cmd = path.join(cwd, 'src', 'bin', 'unit.mjs')
}

const init = argv => {
  let args = ['--colors']

  if (argv['--exclude']) {
    const excludes = Array.from(
      new Set([
        'coverage/**',
        'packages/*/test/**',
        'test/**',
        'test{,-*}.*',
        '**/*{.,-}test.*',
        '**/__tests__/**',
        '**/{ava,babel,jest,nyc,rollup,webpack}.config.*',
        ...argv['--exclude'],
      ]),
    )
    excludes.forEach(ex => {
      args.push('--exclude')
      args.push(`"${ex}"`)
    })
  }

  args.push('-a')
  args.push('--extension .mjs')
  args.push('--es-modules')

  args.push('node')
  args.push('--experimental-modules')
  args.push(`--loader ${path.join(__dirname, 'loader.mjs')}`)
  args.push(cmd)
  console.log(cliPath, args)

  cli.spawn(cliPath, args)
}

module.exports = init
