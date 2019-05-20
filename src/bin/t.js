#!/usr/bin/env node

const path = require('path')
const spawn = require('@magic/cli')

const cwd = process.cwd()
const { name } = require(path.join(cwd, 'package.json'))

let binPath = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin')
if (name === '@magic/test') {
  binPath = path.join(cwd, 'src', 'bin')

}

const cmd = path.join(binPath, 'unit.mjs')
const argv = ['-n', 'src', 'node', '--experimental-json-modules', '--experimental-modules', cmd]

const c8Path = path.join(cwd, 'node_modules', 'c8', 'bin', 'c8.js')

console.log('spawning c8', c8Path)

spawn(argv, c8Path)
