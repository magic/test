import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

import fs from '@magic/fs'
import is from '@magic/types'
import { limitedPromiseAllSettled } from './limitedPromiseAllSettled.ts'
import { loadTestDefines } from './loadTestDefines.ts'
import {
  resolveSvelteOnlyExports,
  writeTempFile,
} from '../../lib/svelte/compile/resolveSvelteOnlyExports.ts'
import type { TestSuites, TestCollection } from '../../types.ts'

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
    is.objectNative(obj) &&
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
    const isUrl = filePath.startsWith('file://')
    const fsPath = isUrl ? fileURLToPath(filePath) : filePath
    const code = await fs.readFile(fsPath, 'utf-8')
    const transformedCode = await resolveSvelteOnlyExports(code, path.dirname(fsPath))

    let importPath: string
    if (transformedCode !== code) {
      const tempFile = await writeTempFile(fsPath, transformedCode)
      importPath = pathToFileURL(tempFile).href
    } else {
      importPath = isUrl ? filePath : pathToFileURL(fsPath).href
    }

    const mod = await import(importPath)

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

/**
 * Reset visitedDirs between test runs to prevent stale symlink cycle detection
 */
export const resetVisitedDirs = () => {
  visitedDirs.clear()
}

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

  let viteDefineImport
  try {
    viteDefineImport = await import('../../lib/svelte/viteConfig/index.ts')
  } catch (e) {
    throw e
  }
  const { getViteDefine } = viteDefineImport

  let testDefines
  try {
    testDefines = await loadTestDefines(process.cwd())
  } catch (e) {
    throw e
  }

  if (await fs.exists(indexFilePath)) {
    // if index.js exists, we will simply import it as is and do no recursion.
    const fileP = indexFilePath.replace(testDir, '')
    const importPath = pathToFileURL(indexFilePath).href
    try {
      const defines = {
        ...(await getViteDefine(indexFilePath)),
        ...testDefines,
      }
      for (const [key, value] of Object.entries(defines)) {
        // @ts-expect-error - dynamic globalThis property assignment
        globalThis[key] = value
      }

      const imported = await importFile(importPath)
      tests[fileP] = imported as TestCollection
    } catch (err) {
      const error = is.error(err) ? err : new Error(String(err))
      errors.push({ file: fileP, error })
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

        try {
          const defines = {
            ...(await getViteDefine(filePath)),
            ...testDefines,
          }
          for (const [key, value] of Object.entries(defines)) {
            // @ts-expect-error - dynamic globalThis property assignment
            globalThis[key] = value
          }

          const test = await importFile(filePath)
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
    // Log errors but don't throw - continue with tests that loaded successfully
    const errorMessages = errors.map(e => `${e.file}: ${e.error.message}`).join('\n')
    console.error(`${errors.length} test file(s) failed to load (continuing): ${errorMessages}`)
  }

  return tests
}
