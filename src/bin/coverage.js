const path = require('path')
const cli = require('@magic/cli')

const cwd = process.cwd()
const nodeModules = path.join(cwd, 'node_modules')
const { name } = require(path.join(cwd, 'package.json'))

// find clipaths
let cliPath = path.join(nodeModules, '.bin', 'c8')
let cmd = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin', 'unit.js')
if (name === '@magic/test') {
  cmd = path.join(cwd, 'src', 'bin', 'unit.mjs')
}

const init = argv => {
  let args = []

  args.push('-n')
  args.push('src')
  if (argv['--includes']) {
    args = [...args, argv['--includes']]
  }

  args.push('node')
  args.push('--experimental-modules')
  args.push(cmd)

  cli.spawn(cliPath, args)
}

module.exports = init
