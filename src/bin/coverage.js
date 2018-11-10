#!/usr/bin/env node

const { exec } = require('child_process')
const path = require('path')

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

const argv = []
// get unit.js instrumented through nyc by passing it as argv
argv.push(cmd)

// process all src files
if (argv.indexOf('-a') === -1) {
  argv.push('-a')
}

const nycCMD = `${cliPath} ${argv.join(' ')}`
console.log('exec', nycCMD)
exec(nycCMD, (...a) => console.log(a.join(' ')))
