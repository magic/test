#!/usr/bin/env node

const { exec } = require('child_process')
const path = require('path')

const cwd = process.cwd()

const nodeModules = path.join(cwd, 'node_modules')

const c8CliPath = path.join(nodeModules, '.bin', 'c8')
const coverallsPath = path.join(nodeModules, 'coveralls', 'bin', 'coveralls.js')

const cmd = `${c8CliPath} report --reporter=text-lcov | ${coverallsPath}`
exec(cmd, console.log)