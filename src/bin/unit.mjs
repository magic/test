import path from 'path'
import nfs from 'fs'
import util from 'util'

import { cli } from '@magic/cli/src/index.mjs'
import log from '@magic/log'

import run from '../run.mjs'

const help = {
  name: '@magic/test t',
  header: `
simple unit testing. runs all tests found in {cwd}/test
see https://github.com/magic/test for info`,
  example: `
Usage:
t -p => run quick tests
t    => run slow tests with coverage through nyc
t -h => this help text

npm example:
"scripts": {
  "test": "t -p",
  "cover": "t"
}`,
}

const fs = {
  exists: util.promisify(nfs.exists),
  readdir: util.promisify(nfs.readdir),
  stat: util.promisify(nfs.stat),
}

const readRecursive = async dir => {
  const testDir = path.join(process.cwd(), 'test')
  const targetDir = !dir ? testDir : path.join(testDir, dir)

  let tests = {}

  // first resolve test/{dir/?}index.mjs
  // if they exist, we require them and expect export structures to be user defined.
  let indexFilePath = path.join(targetDir, 'index.mjs')

  if (await fs.exists(indexFilePath)) {
    // if index.mjs exists, we will simply import it as is and do no recursion.
    const fileP = indexFilePath.replace(testDir, '')
    if (path.sep === '\\') {
      indexFilePath = 'file:\\\\\\' + indexFilePath
    }
    tests[fileP] = await import(indexFilePath)
  } else {
    // if dir/index.mjs does not exist, require all files and subdirectories of files
    const files = await fs.readdir(targetDir)

    // recursively find all files and push them into tests object
    await Promise.all(
      files
        .filter(f => !f.startsWith('.'))
        .map(async file => {
          let filePath = path.join(targetDir, file)
          const stat = await fs.stat(filePath)

          if (stat.isDirectory()) {
            const deepTests = await readRecursive(dir ? path.join(dir, file) : file)

            tests = {
              ...tests,
              ...deepTests,
            }
          } else if (stat.isFile()) {
            if (!file.endsWith('js') && !file.endsWith('mjs')) {
              // bail early if not js
              return
            }

            let fileP = filePath.replace(testDir, '')

            // windows fix
            if (path.sep === '\\') {
              filePath = 'file:\\\\\\' + filePath
              fileP = `/${fileP.substr(1)}`
            }

            let test = await import(filePath)

            // catch es6 export default
            if (test.default) {
              test = test.default
            }
            // write current file to tests cache
            tests[fileP] = test
          }
        }),
    )
  }

  return tests
}

const init = async () => {
  cli({
    options: [
      ['--verbose', '--loud', '--l', '-l'],
      ['--include', '--inc', '--i', '-i'],
      ['--exclude', '--e', '-e'],
    ],
    env: [[['--production', '--prod', '--p', '-p'], 'NODE_ENV', 'production']],
    help,
  })

  const tests = await readRecursive()

  if (!tests) {
    log.error('NO tests specified')
    return
  }

  run(tests)
}

init()

process
  .on('unhandledRejection', error => {
    throw error
  })
  .on('uncaughtException', error => {
    throw error
  })
