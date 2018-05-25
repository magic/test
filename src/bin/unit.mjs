import util from 'util'
import path from 'path'
import fs from 'fs'

import log from '@magic/log'

import run from '../index'

const testArgv = (...args) => args.some(arg => process.argv.indexOf(arg) > -1)

const env = testArgv('-p', '--prod', '--production') ? 'production' : 'development'
process.env.TEST_ENV = process.env.TEST_ENV || env
process.env.NODE_ENV = process.env.NODE_ENV || process.env.TEST_ENV

process.env.VERBOSE = testArgv('-v', '--verbose') ? 1 : ''

const readdir = util.promisify(fs.readdir)
const exists = util.promisify(fs.exists)
const stat = util.promisify(fs.stat)

const readRecursive = async dir => {
  const testDir = path.join(process.cwd(), 'test')
  const srcDir = path.join(process.cwd(), 'src')
  const testTargetDir = !dir ? testDir : path.join(testDir, dir)
  const srcTargetDir = !dir ? srcDir : path.join(srcDir, dir)

  let tests = {}

  // first resolve test/index.js, test/lib/index.js
  // if they exist, we import them and expect willfull export structures.
  const indexFilePath = path.join(testDir, 'index.js')

  if (await exists(indexFilePath)) {
    if (testDir === testTargetDir) {
      //root
      return await import(indexFilePath)
    } else if (testDir !== testTargetDir) {
      return
    }
  }

  // if dir/index.js does not exist, import all files and subdirectories of files
  const subDirs = await readdir(testTargetDir)
  await Promise.all(
    subDirs.map(async file => {
      if (file.indexOf('.') === 0) {
        return
      }

      const testFilePath = path.join(testTargetDir, file)
      const stats = await stat(testFilePath)

      if (stats.isDirectory()) {
        const addTests = await readRecursive(dir ? path.join(dir, file) : file)
        tests = {
          ...tests,
          ...addTests,
        }
      } else if (stats.isFile()) {
        const fileP = testFilePath.replace(testDir, '')

        tests[fileP] = import(testFilePath)
      }
    }),
  )

  return tests
}

const runAwait = async () => {
  const tests = await readRecursive()

  if (!tests) {
    log.error('NO tests specified')
  } else {
    await run(tests)
  }
}

runAwait()
