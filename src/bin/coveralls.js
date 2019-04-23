#!/usr/bin/env node
const { exec } = require('child_process')
const path = require('path')

const cwd = process.cwd()
const { name } = require(path.join(cwd, 'package.json'))

const nodeModules = path.join(cwd, 'node_modules')

const nycCliPath = path.join(nodeModules, '.bin', 'nyc')
const coverallsPath = path.join(nodeModules, 'coveralls', 'bin', 'coveralls.js')

const cmd = `${nycCliPath} report --reporter=text-lcov | ${coverallsPath}`
exec(cmd, console.log)
