import path from 'node:path'
import fs from '@magic/fs'
import { testExportsPreprocessor, viteDefinePreprocessor } from '../preprocess.js'
import { getSvelteCompiler } from '../compiler-cache.js'
import { cache, pendingSvelteCompiles } from '../../caches/cache.js'
import { CWD } from '../../../constants.js'
/**
 * Pure compilation function - caching handled by CacheManager in tsLoader
 * Uses pendingSvelteCompiles for deduplication
 */
export const compileSvelte = async filePath => {
  // Legacy promise dedup for direct callers (prefer CacheManager for new code)
  const pending = pendingSvelteCompiles.get(filePath)
  if (pending) {
    return pending
  }
  const { compile, preprocess } = await getSvelteCompiler()
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
  const source = await fs.readFile(absPath, 'utf-8')
  const preprocessors = [testExportsPreprocessor(), viteDefinePreprocessor()]
  const preprocessed = await preprocess(source, preprocessors)
  const result = compile(preprocessed.code, {
    generate: 'client',
    dev: false,
    filename: absPath,
    experimental: { async: true },
  })
  if (!result.js) {
    throw new Error('Compilation failed: no JS output')
  }
  // Note: Svelte 5 generates sourcemap objects but doesn't embed them.
  // We don't write .map files since tests don't need debugging.
  const jsCodeString = String(result.js.code)
  const { css } = result
  // Legacy in-memory cache for backward compatibility
  const stats = await fs.stat(absPath)
  cache.set(absPath, { js: jsCodeString, css: css ?? null, mtime: stats.mtimeMs })
  // Clean up dedup map
  pendingSvelteCompiles.delete(filePath)
  return { js: jsCodeString, css: css ?? null }
}
