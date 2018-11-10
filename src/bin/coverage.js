const path = require('path')
const { exec } = require('child_process')
const cwd = process.cwd()
const nodeModules = path.join(cwd, 'node_modules')

const { name } = require(path.join(cwd, 'package.json'))

// find clipaths
let cliPath
let cmd
if (name === '@magic/test') {
  cmd = path.join(cwd, 'src', 'bin', 'unit.js')
  cliPath = path.join(nodeModules, '.bin', 'nyc')
} else {
  cliPath = path.join(cwd, 'node_modules', '@magic', 'test', 'node_modules', '.bin', 'nyc')
  cmd = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin', 'unit.js')
}

exec(`${cliPath} --colors -a node ${cmd}`, (...a) => console.log(a.join(' ')))
