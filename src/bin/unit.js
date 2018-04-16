#!/usr/bin/env node
const path = require('path')

const log = require('@magic/log')

const run = require('../run')

const testDir = path.join(process.cwd(), 'test')
const tests = require(testDir)

if (!tests) {
  log.error('NO tests specified')
  return
}

run(tests)
