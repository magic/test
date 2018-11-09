#!/usr/bin/env node
const { exec } = require('child_process')
const path = require('path')

const cwd = process.cwd()
const nodeModules = path.join(cwd, 'node_modules')

const nycCliPath = path.join(nodeModules, 'nyc', 'bin', 'nyc.js')
const coverallsPath = path.join(nodeModules, 'coveralls', 'bin', 'coveralls.js')

exec(`${nycCliPath} report --reporter=text-lcov | ${coverallsPath}`, (...a) => console.log(...a))
