var __rewriteRelativeImportExtension =
  (this && this.__rewriteRelativeImportExtension) ||
  function (path, preserveJsx) {
    if (typeof path === 'string' && /^\.\.?\//.test(path)) {
      return path.replace(
        /\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,
        function (m, tsx, d, ext, cm) {
          return tsx
            ? preserveJsx
              ? '.jsx'
              : '.js'
            : d && (!ext || !cm)
              ? m
              : d + ext + '.' + cm.toLowerCase() + 'js'
        },
      )
    }
    return path
  }
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from '@magic/fs'
import is from '@magic/types'
import { limitedPromiseAllSettled } from './limitedPromiseAllSettled.js'
import { getViteDefine } from '../../lib/svelte/viteConfig/index.js'
/**
 * Type guard for ImportResult.
 */
const isImportResult = obj => {
  return (
    obj != null &&
    is.object(obj) &&
    'type' in obj &&
    (obj.type === 'file' || obj.type === 'directory' || obj.type === 'error' || obj.type === 'skip')
  )
}
const CONCURRENCY_LIMIT = 50
const importFile = async filePath => {
  try {
    const mod = await import(__rewriteRelativeImportExtension(filePath))
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
    const error = is.error(err) ? err : new Error(String(err))
    error.message = `Failed to import test file: ${filePath}\n${error.message}`
    throw error
  }
}
const visitedDirs = new Set()
export const readRecursive = async (dir = '') => {
  const testDir = path.join(process.cwd(), 'test')
  const targetDir = path.join(testDir, dir)
  let tests = {}
  const errors = []
  // first resolve test/{dir/?}index.js or index.ts
  // if they exist, we will simply import it as is and do no recursion.
  let indexFilePath = path.join(targetDir, 'index.js')
  const indexFileTsPath = path.join(targetDir, 'index.ts')
  if (await fs.exists(indexFileTsPath)) {
    indexFilePath = indexFileTsPath
  }
  if (await fs.exists(indexFilePath)) {
    // if index.js exists, we will simply import it as is and do no recursion.
    const fileP = indexFilePath.replace(testDir, '')
    const importPath = pathToFileURL(indexFilePath).href
    try {
      const defines = await getViteDefine()
      for (const [key, value] of Object.entries(defines)) {
        // @ts-expect-error - dynamic globalThis property assignment
        globalThis[key] = value
      }
      const imported = await importFile(importPath)
      tests[fileP] = imported
    } catch (err) {
      errors.push({ file: fileP, error: is.error(err) ? err : new Error(String(err)) })
    }
  } else {
    // if dir/index.js does not exist, require all files and subdirectories of files
    const files = await fs.readdir(targetDir)
    const filteredFiles = files.filter(f => !f.startsWith('.'))
    // Use allSettled with concurrency limit to prevent file descriptor exhaustion
    const results = await limitedPromiseAllSettled(filteredFiles, CONCURRENCY_LIMIT, async file => {
      const filePath = path.join(targetDir, file)
      // Check for symlink cycles using realpath
      let realPath
      try {
        realPath = await fs.realpath(filePath)
      } catch {
        // If realpath fails, skip this file/directory
        return { type: 'skip', file }
      }
      // Check if we've already visited this real path (circular symlink protection)
      if (visitedDirs.has(realPath)) {
        return { type: 'skip', file }
      }
      const stat = await fs.stat(filePath)
      if (stat.isDirectory()) {
        visitedDirs.add(realPath)
        try {
          const deepTests = await readRecursive(dir ? path.join(dir, file) : file)
          return { type: 'directory', file, tests: deepTests }
        } catch (err) {
          const relPath = path.join(dir || '', file)
          const error = is.error(err) ? err : new Error(String(err))
          return { type: 'error', file: relPath, error }
        }
      } else if (stat.isFile()) {
        if (!file.endsWith('js') && !file.endsWith('mjs') && !file.endsWith('ts')) {
          return { type: 'skip', file }
        }
        const fileP = filePath.replace(testDir, '')
        const importPath = pathToFileURL(filePath).href
        try {
          const defines = await getViteDefine()
          for (const [key, value] of Object.entries(defines)) {
            // @ts-expect-error - dynamic globalThis property assignment
            globalThis[key] = value
          }
          const test = await importFile(importPath)
          return { type: 'file', file: fileP, test }
        } catch (err) {
          const error = is.error(err) ? err : new Error(String(err))
          return { type: 'error', file: fileP, error }
        }
      }
      return { type: 'skip', file }
    })
    // Process results
    for (const result of results) {
      if (!result) {
        continue
      }
      if (result.status === 'fulfilled') {
        const value = result.value
        if (!isImportResult(value)) {
          // Unexpected result type, treat as skip
          continue
        }
        if (value.type === 'file' && value.test !== undefined && value.file) {
          tests[value.file] = value.test
        } else if (value.type === 'directory' && value.tests !== undefined) {
          tests = {
            ...tests,
            ...value.tests,
          }
        } else if (value.type === 'error') {
          // value.error is defined for error type
          const err = value.error || new Error('Unknown import error')
          errors.push({ file: value.file || 'unknown', error: err })
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
    aggError.errors = errors
    throw aggError
  }
  return tests
}
