#!/usr/bin/env node
import path from 'path'
import fs from 'fs'

import log from '@magic/log'

import run from '../run'

const readRecursive = dir => {
  const testDir = path.join(process.cwd(), 'test')
  const targetDir = !dir ? testDir : path.join(testDir, dir)

  let tests = {}

  // first resolve test/index.js, test/lib/index.js
  // if they exist, we import them and expect willfull export structures.
  const indexFilePath = path.join(testDir, 'index.js')

  if (fs.existsSync(indexFilePath)) {
    if (testDir === targetDir) {
      //root
      return import(indexFilePath)
    } else if (testDir !== targetDir) {
      return
    }
  }

  // if dir/index.js does not exist, import all files and subdirectories of files
  fs.readdirSync(targetDir).forEach(file => {
    if (file.indexOf('.') === 0 || file === 'index.js') {
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
      tests[fileP] = import(filePath)
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
