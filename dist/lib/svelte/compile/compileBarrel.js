import path from 'node:path'
import fs from '@magic/fs'
import { barrelCache, processingBarrels, pendingBarrelCompiles } from './cache.js'
import { TMP_DIR, CWD } from '../../../constants.js'
import { getSvelteExports } from './getSvelteExports.js'
import { processImports } from './processImports.js'
import { compileSvelte } from './compileSvelte.js'
import { computeRelativePath } from './computeRelativePath.js'
import { traceStart, traceEnd } from './timing.js'
export const compileBarrel = async (filePath, importChain = []) => {
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
    traceEnd(id, `ERROR: ${error.message}`)
    throw error
  }
}
const compileBarrelImpl = async (filePath, currentChain) => {
  const exports = await getSvelteExports(filePath)
  if (exports.length === 0) {
    throw new Error(`No Svelte exports found in barrel file: ${filePath}`)
  }
  const compiledExports = []
  for (let i = 0; i < exports.length; i++) {
    const exp = exports[i]
    if (!exp) {
      continue
    }
    const { name, path: sveltePath, isDefaultReexport } = exp
    const compileId = traceStart(`compileBarrel.export[${i + 1}/${exports.length}] ${name}`)
    const { js } = await compileSvelte(sveltePath)
    const processId = traceStart('processImports')
    const processed = await processImports(js, sveltePath, currentChain)
    traceEnd(processId)
    traceEnd(compileId)
    const relPath = path.relative(CWD, sveltePath)
    const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
    await fs.mkdirp(path.dirname(tmpFile))
    await fs.writeFile(tmpFile, processed)
    compiledExports.push({ name, absPath: path.join(CWD, tmpFile), isDefaultReexport })
  }
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
  barrelCache.set(filePath, { exports, wrapperAbsPath })
  return { filePath, js: wrapperCode, wrapperAbsPath }
}
