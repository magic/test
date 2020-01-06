#!/usr/bin/env node

import child_process from 'child_process'
import path from 'path'

const cwd = process.cwd()

const nodeModules = path.join(cwd, 'node_modules')

const c8CliPath = path.join(nodeModules, '.bin', 'c8')
const coverallsPath = path.join(nodeModules, 'coveralls', 'bin', 'coveralls.js')

const cmd = `${c8CliPath} report --reporter=text-lcov | ${coverallsPath}`
child_process.exec(cmd, console.log)
