#!/usr/bin/env node
const path = require('path')
const fs = require('fs')

const log = require('@magic/log')

const run = require('../run')

const readRecursive = dir => {
  const testDir = path.join(process.cwd(), 'test')
  const targetDir = !dir ? testDir : path.join(testDir, dir)

  let tests = {}

  fs.readdirSync(targetDir).forEach(file => {
    if (file.indexOf('.') === 0) {
      return
    }

    const filePath = path.join(targetDir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      tests = {
        ...tests,
        ...readRecursive(dir ? path.join(dir, file) : file),
      }
    } else if (stat.isFile()) {
      const fileP = filePath.replace(testDir, '')
      tests[fileP] = require(filePath)
    }
  })

  return tests
}

const tests = readRecursive()

if (!tests) {
  log.error('NO tests specified')
  return
}

run(tests)
