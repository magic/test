import path from 'path'
import nfs from 'fs'
import util from 'util'

import { default as log } from '@magic/log'

import run from '../run.mjs'

const fs = {
  exists: util.promisify(nfs.exists),
  readdir: util.promisify(nfs.readdir),
  stat: util.promisify(nfs.stat),
}

const readRecursive = async dir => {
  const testDir = path.join(process.cwd(), 'test')
  const targetDir = !dir ? testDir : path.join(testDir, dir)

  let tests = {}

  // first resolve test/{dir/?}index.js
  // if they exist, we require them and expect export structures to be user defined.
  const indexFilePath = path.join(targetDir, 'index.js')

  if (await fs.exists(indexFilePath)) {
    const fileP = indexFilePath.replace(testDir, '')
    tests[fileP] = await import(indexFilePath)
  } else {
    // if dir/index.js does not exist, require all files and subdirectories of files
    const files = await fs.readdir(targetDir)

    await Promise.all(
      files
        .filter(f => !f.startsWith('.'))
        .map(async file => {
          const filePath = path.join(targetDir, file)
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

            const fileP = filePath.replace(testDir, '')
            let test = await import(filePath)
            if (test.default) {
              test = test.default
            }
            tests[fileP] = test
          }
        }),
    )
  }

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