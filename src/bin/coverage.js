#!/usr/bin/env node

import path from 'path'

const cwd = process.cwd()
const nodeModules = path.join(cwd, 'node_modules')

import { name } from path.join(cwd, 'package.json')

const cliPath = path.join(nodeModules, 'nyc', 'bin', 'nyc.js')

if (process.argv.indexOf('-a') === -1) {
  process.argv.push('-a')
}

let cmd
if (name === '@magic/test') {
  cmd = path.join(cwd, 'src', 'bin', 'unit.js')
} else {
  cmd = path.join(cwd, 'node_modules', '.bin', 'unit')
}

process.argv.push(cmd)
import(cliPath)
