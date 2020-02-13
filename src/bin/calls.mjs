#!/usr/bin/env node

import child_process from 'child_process'
import path from 'path'

import log from '@magic/log'

const cwd = process.cwd()

const nodeModules = path.join(cwd, 'node_modules')

const c8CliPath = path.join(nodeModules, '.bin', 'c8')
const coverallsPath = path.join(nodeModules, '.bin', 'coveralls')

const cmd = `${c8CliPath} report --reporter=text-lcov | ${coverallsPath}`

child_process.exec(cmd, (err, stdout, stderr) => {
  if (err) {
    log.error(err)
    process.exit(1)
  }
  if (stderr) {
    log.error(stderr)
    process.exit(1)
  }

  log(stdout)
})
