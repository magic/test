import path from 'node:path'

import fs from '@magic/fs'

import { barrelCache, processingBarrels, pendingBarrelCompiles } from '../../caches/cache.ts'
import { traceStart, traceEnd } from '../../trace/timing.ts'
import { CACHE_DIR, CWD } from '../../../constants.ts'
import { getSvelteExports } from './getSvelteExports.ts'
import { processImports } from './processImports.ts'
import { compileSvelte } from './compileSvelte.ts'
import { computeRelativePath } from './computeRelativePath.ts'
import { parallelMap, MAX_CONCURRENT } from './parallelMap.ts'

export const compileBarrel = async (
  filePath: string,
  importChain: string[] = [],
): Promise<{ filePath: string; js: string; wrapperAbsPath: string }> => {
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
    // Wait for it to complete instead of duplicating work
    // Only check pending if not already cached
    const cached = barrelCache.get(filePath)
    if (cached) {
      // Need to re-read the compiled file since we only cache wrapperAbsPath
      try {
        const js = await fs.readFile(cached.wrapperAbsPath, 'utf-8')
        traceEnd(id, 'cache hit')
        return { filePath, js, wrapperAbsPath: cached.wrapperAbsPath }
      } catch {
        // File was deleted, continue to recompile
      }
    }

    const pending = pendingBarrelCompiles.get(filePath)
    if (pending) {
      traceEnd(id, 'waiting for pending')
      const result = await pending
      // Re-read from disk to get the actual JS content
      try {
        const js = await fs.readFile(result.wrapperAbsPath, 'utf-8')
        return { filePath, js, wrapperAbsPath: result.wrapperAbsPath }
      } catch {
        // File doesn't exist, continue to recompile
        pendingBarrelCompiles.delete(filePath)
      }
    }

    const currentChain = [...importChain, filePath]
    processingBarrels.add(filePath)

    // Create promise and store it for other callers to await
    const compilePromise = (async () => {
      try {
        return await compileBarrelImpl(filePath, currentChain)
      } finally {
        processingBarrels.delete(filePath)
        pendingBarrelCompiles.delete(filePath)
      }
    })()

    pendingBarrelCompiles.set(filePath, compilePromise)

    const result = await compilePromise
    traceEnd(id)
    return result
  } catch (error) {
    traceEnd(id, `ERROR: ${(error as Error).message}`)
    throw error
  }
}

const compileBarrelImpl = async (
  filePath: string,
  currentChain: string[],
): Promise<{ filePath: string; js: string; wrapperAbsPath: string }> => {
  const exports = await getSvelteExports(filePath)

  if (exports.length === 0) {
    throw new Error(`No Svelte exports found in barrel file: ${filePath}`)
  }

  // Compile exports in parallel with concurrency limit
  const validExports = exports.filter((e): e is NonNullable<typeof e> => e !== undefined)
  const compiledExports = await parallelMap(
    validExports,
    async (exp, i) => {
      const { name, path: sveltePath, isDefaultReexport } = exp
      const compileId = traceStart(`compileBarrel.export[${i + 1}/${validExports.length}] ${name}`)
      const { js } = await compileSvelte(sveltePath)
      const processId = traceStart('processImports')
      const processed = await processImports(js, sveltePath, currentChain)
      traceEnd(processId)
      traceEnd(compileId)

      const relPath = path.relative(CWD, sveltePath)
      const tmpFile = path.join(CACHE_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
      const tmpFileAbs = path.join(CWD, tmpFile)

      return {
        name,
        absPath: tmpFileAbs,
        isDefaultReexport,
        content: processed,
      }
    },
    MAX_CONCURRENT,
  )

  const barrelRelPath = path.relative(CWD, filePath)
  const wrapperFile = path.join(CACHE_DIR, barrelRelPath.replace(/\.(ts|js)$/, '.barrel.js'))
  const wrapperAbsPath = path.join(CWD, wrapperFile)
  const wrapperTmpDir = path.dirname(wrapperAbsPath)

  const writeId = traceStart('fs.writeFile')

  // Collect all files to write (always write - skip shouldWriteFile check for speed)
  const filesToWrite: { path: string; content: string }[] = compiledExports.map(e => ({
    path: e.absPath,
    content: e.content,
  }))

  // Generate wrapper code
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
    .filter((e): e is string => e !== null)

  const wrapperCode = wrapperExports.join('\n')

  // Always write wrapper
  filesToWrite.push({ path: wrapperAbsPath, content: wrapperCode })

  // Write all files in parallel, creating directories once
  const dirsToCreate = new Set(filesToWrite.map(f => path.dirname(f.path)))
  await Promise.all([...dirsToCreate].map(d => fs.mkdir(d, { recursive: true })))
  await Promise.all(filesToWrite.map(f => fs.writeFile(f.path, f.content)))
  traceEnd(writeId)

  barrelCache.set(filePath, { exports, wrapperAbsPath })

  return { filePath, js: wrapperCode, wrapperAbsPath }
}
