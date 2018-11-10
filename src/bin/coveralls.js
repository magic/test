#!/usr/bin/env node
const { exec } = require('child_process')
const path = require('path')

const { name } = require(path.join(process.cwd(), 'package.json'))

const cwd = process.cwd()

const nodeModules = path.join(cwd, 'node_modules')

let nycCliPath
if (name === '@magic/test') {
  nycCliPath = path.join(nodeModules, '.bin', 'nyc')
} else {
  nycCliPath = path.join(
    nodeModules,
    '@magic',
    'test',
    'node_modules',
    '.bin',
    'nyc',
  )
}

const coverallsPath = path.join(nodeModules, 'coveralls', 'bin', 'coveralls.js')

const cmd = `${nycCliPath} report --reporter=text-lcov | ${coverallsPath}`
const cb = console.log
exec(cmd, cb)
