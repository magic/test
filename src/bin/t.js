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

const cmd = path.join(binPath, 'unit.mjs')
const argv = ['-n', 'src', 'node', '--experimental-json-modules', '--experimental-modules', cmd]

const c8Path = path.join(cwd, 'node_modules', 'c8', 'bin', 'c8.js')

console.log(fs.readdirSync(path.join(cwd, 'node_modules', '.bin')))

spawn(argv, c8Path)