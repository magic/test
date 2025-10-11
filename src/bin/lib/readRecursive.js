import path from 'node:path'

import fs from '@magic/fs'
import is from '@magic/types'

/**
 * @param {string} filePath
 * @returns {Promise<Test[] | (Record<string, unknown> & TestsWithHooks)>}
 */
const importFile = async filePath => {
  let mod = await import(filePath)

  // catch es6 export default
  if (is.module(mod)) {
    const m = { ...mod }
    if (is.ownProp(m, 'default')) {
      return /** @type {Test[] | (Record<string, unknown> & TestsWithHooks)} */ (m.default)
    } else {
      return m
    }
  } else {
    return mod
  }
}

/**
 * @param {string} [dir='']
 * @returns {Promise<TestSuites>}
 */
export const readRecursive = async (dir = '') => {
  const testDir = path.join(process.cwd(), 'test')
  const targetDir = path.join(testDir, dir)

  /** @type {TestSuites} */
  let tests = {}

  // first resolve test/{dir/?}index.js
  // if they exist, we require them and expect export structures to be user defined.
  let indexFilePath = path.join(targetDir, 'index.js')

  if (await fs.exists(indexFilePath)) {
    // if index.js exists, we will simply import it as is and do no recursion.
    const fileP = indexFilePath.replace(testDir, '')
    if (path.sep === '\\') {
      indexFilePath = 'file:\\\\\\' + indexFilePath
    }
    const imported = await importFile(indexFilePath)
    tests[fileP] = /** @type {Test[] | (Record<string, unknown> & TestsWithHooks)} */ (imported)
  } else {
    // if dir/index.js does not exist, require all files and subdirectories of files
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
              fileP = `/${fileP.substring(1)}`
            }

            const test = await importFile(filePath)

            // write current file to tests cache
            tests[fileP] = /** @type {Test[] | (Record<string, unknown> & TestsWithHooks)} */ (test)
          }
        }),
    )
  }

  return tests
}
