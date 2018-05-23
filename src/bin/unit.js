#!/usr/bin/env node
const path = require('path')
const nfs = require('fs')
const util = require('util')

const log = require('@magic/log')

const run = require('../run')

const fs = {
  exists: util.promisify(nfs.exists),
  readdir: util.promisify(nfs.readdir),
  stat: util.promisify(nfs.stat),
}

const readRecursive = async dir => {
  const testDir = path.join(process.cwd(), 'test')
  const targetDir = !dir ? testDir : path.join(testDir, dir)

  let tests = {}

  // first resolve test/index.js, test/lib/index.js
  // if they exist, we require them and expect willfull export structures.
  const indexFilePath = path.join(testDir, 'index.js')

  if (await fs.exists(indexFilePath)) {
    if (testDir === targetDir) {
      //root
      return require(indexFilePath)
    } else if (testDir !== targetDir) {
      return
    }
  }

  // if dir/index.js does not exist, require all files and subdirectories of files
  const files = await fs.readdir(targetDir)

  await Promise.all(
    files.map(async file => {
      if (file.indexOf('.') === 0 || file === 'index.js') {
        return
      }

      const filePath = path.join(targetDir, file)
      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        const deepTests = await readRecursive(dir ? path.join(dir, file) : file)

        tests = {
          ...tests,
          ...deepTests,
        }
      } else if (stat.isFile()) {
        const fileP = filePath.replace(testDir, '')
        tests[fileP] = require(filePath)
      }
    }),
  )

  return tests
}

const init = async () => {
  const tests = await readRecursive()

  if (!tests) {
    log.error('NO tests specified')
    return
  }

  run(tests)
}

init()
