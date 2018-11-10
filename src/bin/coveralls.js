#!/usr/bin/env node
const { exec } = require('child_process')
const path = require('path')

const { name } = require(path.join(process.cwd(), 'package.json'))

const cwd = process.cwd()

const nodeModules = path.join(cwd, 'node_modules')

const nycPathPart = path.join('.bin', 'nyc')

let nycCliPath
if (name === '@magic/test') {
  nycCliPath = path.join(nodeModules, nycPathPart)
} else {
  nycCliPath = path.join(nodeModules, '@magic', 'test', 'node_modules', nycPathPart)
}

const coverallsPath = path.join(nodeModules, 'coveralls', 'bin', 'coveralls.js')

const cmd = `${nycCliPath} report --reporter=text-lcov | ${coverallsPath}`
const cb = console.log
console.log({ cmd })
exec(cmd, cb)
