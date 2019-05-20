#!/usr/bin/env node

const path = require('path')
const spawn = require('@magic/cli')
const fs = require('fs')

const cwd = process.cwd()
const { name } = require(path.join(cwd, 'package.json'))

let binPath = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin')
if (name === '@magic/test') {
  binPath = path.join(cwd, 'src', 'bin')
}

const binFile = path.join(binPath, 'unit.mjs')

const isWin = process.platform === 'win32'

let cmd = 'node'
let argv = ['--experimental-modules', '--experimental-json-modules', binFile]
if (!process.argv.includes('-p')) {
  let c8Cmd = 'c8'
  if (isWin) {
    c8Cmd = 'c8.cmd'
  }
  cmd = path.join(cwd, 'node_modules', '.bin', c8Cmd)
  argv = ['-n', 'src', 'node', ...argv]
}

spawn(argv, cmd)
