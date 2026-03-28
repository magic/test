import path from 'node:path'

import fs from '@magic/fs'
import is from '@magic/types'

/**
 * @typedef {Object} ImportResult
 * @property {string} file
 * @property {any} [test]
 * @property {TestSuites} [tests]
 * @property {Error} [error]
 * @property {'file'|'directory'|'error'|'skip'} type
 */

/**
 * @param {string} filePath
 * @returns {Promise<any>}
 */
const importFile = async filePath => {
  try {
    let mod = await import(filePath)

    // catch es6 export default
    if (is.module(mod)) {
      const m = { ...mod }
      if (is.ownProp(m, 'default')) {
        return m.default
      } else {
        return m
      }
    } else {
      return mod
    }
  } catch (err) {
    // Enhance error with file context
    const error = err instanceof Error ? err : new Error(String(err))
    error.message = `Failed to import test file: ${filePath}\n${error.message}`
    throw error
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

  /** @type {Array<{file: string, error: Error}>} */
  const errors = []

  // first resolve test/{dir/?}index.js or index.ts
  // if they exist, we require them and expect export structures to be user defined.
  let indexFilePath = path.join(targetDir, 'index.js')
  let indexFileTsPath = path.join(targetDir, 'index.ts')

  if (await fs.exists(indexFileTsPath)) {
    indexFilePath = indexFileTsPath
  }

  if (await fs.exists(indexFilePath)) {
    // if index.js exists, we will simply import it as is and do no recursion.
    const fileP = indexFilePath.replace(testDir, '')
    if (path.sep === '\\') {
      indexFilePath = 'file:\\\\\\' + indexFilePath
    }
    try {
      const imported = await importFile(indexFilePath)
      tests[fileP] = imported
    } catch (err) {
      errors.push({ file: fileP, error: err instanceof Error ? err : new Error(String(err)) })
    }
  } else {
    // if dir/index.js does not exist, require all files and subdirectories of files
    const files = await fs.readdir(targetDir)

    // Use allSettled to continue despite individual file errors
    const results = await Promise.allSettled(
      files
        .filter(f => !f.startsWith('.'))
        .map(async file => {
          let filePath = path.join(targetDir, file)
          const stat = await fs.stat(filePath)

          if (stat.isDirectory()) {
            try {
              const deepTests = await readRecursive(dir ? path.join(dir, file) : file)
              return { type: 'directory', file, tests: deepTests }
            } catch (err) {
              const relPath = path.join(dir || '', file)
              const error = err instanceof Error ? err : new Error(String(err))
              return { type: 'error', file: relPath, error }
            }
          } else if (stat.isFile()) {
            if (!file.endsWith('js') && !file.endsWith('mjs') && !file.endsWith('ts')) {
              // bail early if not js or TypeScript
              return { type: 'skip', file }
            }

            let fileP = filePath.replace(testDir, '')

            // windows fix
            if (path.sep === '\\') {
              filePath = 'file:\\\\\\' + filePath
              fileP = `/${fileP.substring(1)}`
            }

            try {
              const test = await importFile(filePath)
              return { type: 'file', file: fileP, test }
            } catch (err) {
              const error = err instanceof Error ? err : new Error(String(err))
              return { type: 'error', file: fileP, error }
            }
          }

          return { type: 'skip', file }
        }),
    )

    // Process results
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const value = result.value

        if (value.type === 'file' && value.test !== undefined) {
          tests[value.file] = value.test
        } else if (value.type === 'directory' && value.tests !== undefined) {
          tests = {
            ...tests,
            ...value.tests,
          }
        } else if (value.type === 'error') {
          // value.error is defined for error type, but TS needs help
          /** @type {Error} */
          const err = value.error || new Error('Unknown import error')
          errors.push({ file: value.file, error: err })
        }
        // skip type is ignored
      } else {
        // This shouldn't happen as we catch all rejections, but just in case
        errors.push({ file: 'unknown', error: new Error(String(result.reason)) })
      }
    }
  }

  if (errors.length > 0) {
    // Build aggregated error message
    const errorMessages = errors.map(e => `${e.file}: ${e.error.message}`).join('\n')
    const aggError = new Error(`Failed to load ${errors.length} test file(s):\n${errorMessages}`)
    aggError.name = 'E_IMPORT_AGGREGATED'
    // Attach individual errors for programmatic access
    // @ts-ignore - adding custom property to Error
    aggError.errors = errors
    throw aggError
  }

  return tests
}
