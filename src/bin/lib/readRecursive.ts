import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'
import is from '@magic/types'
import { limitedPromiseAllSettled } from './limitedPromiseAllSettled.js'
import { getViteDefine } from '../../lib/svelte/viteConfig/index.js'
import type { TestSuites, TestCollection } from '../../types.js'

interface ImportResult {
  type: 'file' | 'directory' | 'error' | 'skip'
  file?: string
  test?: TestCollection
  tests?: TestSuites
  error?: Error
}

/**
 * Type guard for ImportResult.
 */
const isImportResult = (obj: unknown): obj is ImportResult => {
  return (
    obj != null &&
    is.object(obj) &&
    'type' in obj &&
    (obj.type === 'file' || obj.type === 'directory' || obj.type === 'error' || obj.type === 'skip')
  )
}

/**
 * Error with attached individual errors for aggregated failures.
 */
interface AggregatedImportError extends Error {
  errors: Array<{ file: string; error: Error }>
}

const CONCURRENCY_LIMIT = 50

const importFile = async (filePath: string): Promise<unknown> => {
  try {
    const mod = await import(filePath)

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

const visitedDirs = new Set<string>()

export const readRecursive = async (dir = ''): Promise<TestSuites> => {
  const testDir = path.join(process.cwd(), 'test')
  const targetDir = path.join(testDir, dir)

  let tests: TestSuites = {}

  const errors: Array<{ file: string; error: Error }> = []

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
      tests[fileP] = imported as TestCollection
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
      let realPath: string
      try {
        realPath = await fs.realpath(filePath)
      } catch {
        // If realpath fails, skip this file/directory
        return { type: 'skip', file } as ImportResult
      }

      // Check if we've already visited this real path (circular symlink protection)
      if (visitedDirs.has(realPath)) {
        return { type: 'skip', file } as ImportResult
      }

      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        visitedDirs.add(realPath)
        try {
          const deepTests = await readRecursive(dir ? path.join(dir, file) : file)
          return { type: 'directory', file, tests: deepTests } as ImportResult
        } catch (err) {
          const relPath = path.join(dir || '', file)
          const error = is.error(err) ? err : new Error(String(err))
          return { type: 'error', file: relPath, error } as ImportResult
        }
      } else if (stat.isFile()) {
        if (!file.endsWith('js') && !file.endsWith('mjs') && !file.endsWith('ts')) {
          return { type: 'skip', file } as ImportResult
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
          return { type: 'file', file: fileP, test } as ImportResult
        } catch (err) {
          const error = is.error(err) ? err : new Error(String(err))
          return { type: 'error', file: fileP, error } as ImportResult
        }
      }

      return { type: 'skip', file } as ImportResult
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
    const aggError = new Error(
      `Failed to load ${errors.length} test file(s):\n${errorMessages}`,
    ) as AggregatedImportError
    aggError.name = 'E_IMPORT_AGGREGATED'
    // Attach individual errors for programmatic access
    aggError.errors = errors
    throw aggError
  }

  return tests
}
