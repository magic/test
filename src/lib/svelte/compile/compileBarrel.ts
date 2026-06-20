import path from 'node:path'

import fs from '@magic/fs'

import { pendingPromises } from './cache.ts'
import { TMP_DIR, CWD } from '../../../constants.ts'
import { getSvelteExports } from './getSvelteExports.ts'
import { processImports } from './processImports.ts'
import { compileSvelte } from './compileSvelte.ts'
import { computeRelativePath } from './computeRelativePath.ts'
import { traceStart, traceEnd } from './timing.ts'

export type BarrelResult = { filePath: string; js: string; wrapperAbsPath: string }

// Simple barrel wrapper cache (stores wrapperAbsPath only)
export const barrelWrapperCache = new Map<string, string>()

// Configurable concurrency for barrel export compilation
const BARREL_CONCURRENCY = parseInt(process.env.BARREL_CONCURRENCY || '5', 10)

export const compileBarrel = async (
  filePath: string,
  importChain: string[] = [],
): Promise<BarrelResult> => {
  const id = traceStart(`compileBarrel ${path.basename(filePath)}`)

  try {
    // Check for circular dependency FIRST - must happen before any async operations
    // that might cause other callers to wait on us
    if (importChain.includes(filePath)) {
      const cycle = [...importChain, filePath].join(' → ')
      throw new Error(
        `Circular dependency detected: ${cycle}\n` +
          `Suggestion: Import Svelte components directly instead of using barrel files.\n` +
          `  Instead of: import { Button } from '$lib/forms'\n` +
          `  Use: import Button from '$lib/forms/Button.svelte'`,
      )
    }

    // Check if another process is already compiling this barrel
    const cachedWrapper = barrelWrapperCache.get(filePath)
    if (cachedWrapper) {
      try {
        const js = await fs.readFile(cachedWrapper, 'utf-8')
        traceEnd(id, 'cache hit')
        return { filePath, js, wrapperAbsPath: cachedWrapper }
      } catch {
        // File was deleted, continue to recompile
        barrelWrapperCache.delete(filePath)
      }
    }

    const key = `barrel:${filePath}`

    // Check if already compiling
    const existing = pendingPromises.get(key)
    if (existing) {
      traceEnd(id, 'waiting for pending')
      return existing as Promise<BarrelResult>
    }

    const promise = (async (): Promise<BarrelResult> => {
      try {
        return await compileBarrelImpl(filePath, importChain)
      } finally {
        pendingPromises.delete(key)
      }
    })()

    pendingPromises.set(key, promise)

    const result = await promise

    // Cache the wrapper path
    barrelWrapperCache.set(filePath, result.wrapperAbsPath)

    traceEnd(id)
    return result
  } catch (error) {
    traceEnd(id, `ERROR: ${(error as Error).message}`)
    throw error
  }
}

const compileBarrelImpl = async (
  filePath: string,
  importChain: string[],
): Promise<BarrelResult> => {
  const exports = await getSvelteExports(filePath)

  if (exports.length === 0) {
    throw new Error(`No Svelte exports found in barrel file: ${filePath}`)
  }

  // Phase 1: Compile all exports in parallel batches
  const compiledExports: { name: string; absPath: string; isDefaultReexport?: boolean }[] =
    new Array(exports.length)

  for (let batchStart = 0; batchStart < exports.length; batchStart += BARREL_CONCURRENCY) {
    const batch = exports.slice(batchStart, batchStart + BARREL_CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map((exp, batchIdx) => {
        const idx = batchStart + batchIdx
        if (!exp) {
          return Promise.resolve(null)
        }
        return (async () => {
          const { name, path: sveltePath, isDefaultReexport } = exp
          const compileId = traceStart(`compileBarrel.export[${idx + 1}/${exports.length}] ${name}`)
          const { js } = await compileSvelte(sveltePath)
          const processId = traceStart('processImports')
          const processed = await processImports(js, sveltePath, importChain)
          traceEnd(processId)
          traceEnd(compileId)

          const relPath = path.relative(CWD, sveltePath)
          const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))

          // Write in parallel within batch
          await fs.mkdirp(path.dirname(tmpFile))
          await fs.writeFile(tmpFile, processed)

          return { idx, name, absPath: path.join(CWD, tmpFile), isDefaultReexport }
        })()
      }),
    )
    for (const result of batchResults) {
      if (result) {
        compiledExports[result.idx] = result
      }
    }
  }

  // Phase 2: Write barrel wrapper (depends on all exports written)
  const barrelRelPath = path.relative(CWD, filePath)
  const wrapperFile = path.join(TMP_DIR, barrelRelPath.replace(/\.(ts|js)$/, '.barrel.js'))
  const wrapperAbsPath = path.join(CWD, wrapperFile)
  const wrapperTmpDir = path.dirname(wrapperAbsPath)

  const writeId = traceStart('fs.writeFile')
  const wrapperExports = compiledExports
    .map(({ name, absPath, isDefaultReexport }) => {
      if (name.startsWith('type ') || name === '') {
        return null
      }
      const relative = computeRelativePath(wrapperTmpDir, absPath)

      if (name === 'default') {
        return `export { default } from '${relative}'`
      }

      if (name.includes(' as ') || isDefaultReexport) {
        const exportedName = name.includes(' as ')
          ? name
              .split(/\s+as\s+/)
              .pop()
              ?.trim()
          : name
        if (exportedName) {
          return `export { default as ${exportedName} } from '${relative}'`
        }
      }

      return `export { ${name} } from '${relative}'`
    })
    .filter(Boolean)

  const wrapperCode = wrapperExports.join('\n')

  await fs.mkdirp(path.dirname(wrapperFile))
  await fs.writeFile(wrapperFile, wrapperCode)
  traceEnd(writeId)

  return { filePath, js: wrapperCode, wrapperAbsPath }
}
