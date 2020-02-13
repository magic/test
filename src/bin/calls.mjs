#!/usr/bin/env node

import child_process from 'child_process'
import path from 'path'

import coveralls from 'coveralls'

import cli from '@magic/cli'
import log from '@magic/log'

const cwd = process.cwd()

const nodeModules = path.join(cwd, 'node_modules')

const c8CliPath = path.join(nodeModules, '.bin', 'c8')
const coverallsPath = path.join(nodeModules, '.bin', 'coveralls')

const cmd = `${c8CliPath} report --reporter=text-lcov`

const run = async () => {
  try {
    const coverage = await cli.exec(cmd)

    const calls = await new Promise(res => coveralls.handleInput(coverage, res))
    log(calls)
  } catch (e) {
    log.error(e)
    process.exit(1)
  }
}

run()
