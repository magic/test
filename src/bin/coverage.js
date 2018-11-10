#!/usr/bin/env node
const path = require('path')

const cwd = process.cwd()
const nodeModules = path.join(cwd, 'node_modules')

const { name } = require(path.join(cwd, 'package.json'))


if (process.argv.indexOf('-a') === -1) {
  process.argv.push('-a')
}

let cliPath
let cmd
if (name === '@magic/test') {
  cmd = path.join(cwd, 'src', 'bin', 'unit.js')
  cliPath = path.join(nodeModules, '.bin', 'nyc')
} else {
  cliPath = path.join(cwd, 'node_modules', '@magic', 'test', 'node_modules', '.bin', 'nyc')
  cmd = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin', 'unit.js')
}

process.argv.push(cmd)
require(cliPath)
