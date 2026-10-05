import path from 'node:path'
import fs from '@magic/fs'
import {
  testExportsPreprocessor,
  viteDefinePreprocessor,
  resolveNodeModulesRelativeImportsPreprocessor,
} from '../preprocess.js'
import { getSvelteCompiler } from '../compiler-cache.js'
import { cache, pendingPromises } from '#src/lib/caches/cache.js'
import { ddl, ddlHold, ddlRelease } from './ddl.js'
import { processImports } from './processImports.js'
import { CWD } from '#src/constants.js'
/**
 * Pure compilation function - caching handled by CacheManager in tsLoader
 * Uses pendingPromises for deduplication
 */
export const compileSvelte = async (filePath, options = {}) => {
  // Legacy promise dedup for direct callers (prefer CacheManager for new code)
  const pending = pendingPromises.get(`svelte:${filePath}`)
  if (pending) {
    ddl('svelte PENDING-HIT ' + path.basename(filePath))
    ddlHold('svelte:' + filePath, path.basename(filePath))
    try {
      return await pending
    } finally {
      ddlRelease('svelte:' + filePath, path.basename(filePath))
    }
  }
  const compilePromise = (async () => {
    const { compile, preprocess } = await getSvelteCompiler()
    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
    const source = await fs.readFile(absPath, 'utf-8')
    const preprocessors = [
      resolveNodeModulesRelativeImportsPreprocessor(),
      testExportsPreprocessor(),
      viteDefinePreprocessor(),
    ]
    const preprocessed = await preprocess(source, preprocessors, { filename: absPath })
    const result = compile(preprocessed.code, {
      generate: 'client',
      dev: false,
      filename: absPath,
      experimental: { async: true },
    })
    if (!result.js) {
      throw new Error('Compilation failed: no JS output')
    }
    let jsCodeString = String(result.js.code)
    const { css } = result
    if (options.processImports) {
      jsCodeString = await processImports(jsCodeString, absPath)
    }
    // Generate source map string for coverage remapping
    const mapString = result.js.map ? JSON.stringify(result.js.map) : undefined
    // Legacy in-memory cache for backward compatibility
    const stats = await fs.stat(absPath)
    cache.set(absPath, { js: jsCodeString, css: css ?? null, mtime: stats.mtimeMs })
    return { js: jsCodeString, css: css ?? null, map: mapString }
  })()
  pendingPromises.set(`svelte:${filePath}`, compilePromise)
  ddl('svelte SET compile ' + path.basename(filePath))
  try {
    return await compilePromise
  } finally {
    pendingPromises.delete(`svelte:${filePath}`)
  }
}
//# sourceMappingURL=compileSvelte.js.map
