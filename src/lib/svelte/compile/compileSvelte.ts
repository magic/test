import path from 'node:path'

import fs from '@magic/fs'

import { testExportsPreprocessor, viteDefinePreprocessor } from '../preprocess.ts'
import { getSvelteCompiler } from '../compiler-cache.ts'

import { cache, pendingSvelteCompiles } from './cache.ts'
import { CACHE_DIR, CWD } from '../../../constants.ts'
import { cleanTempFiles } from './cleanTempFiles.ts'
import { acquireLock } from './acquireLock.ts'
import type { CssObject } from './types.ts'

export interface CompileSvelteReturn {
  js: string
  css: CssObject | null
}

/**
 * Pure compilation function - caching handled by CacheManager in tsLoader
 * Uses pendingSvelteCompiles for deduplication
 */
export const compileSvelte = async (filePath: string): Promise<CompileSvelteReturn> => {
  // Legacy promise dedup for direct callers (prefer CacheManager for new code)
  const pending = pendingSvelteCompiles.get(filePath)
  if (pending) {
    return pending
  }

  const { compile, preprocess } = await getSvelteCompiler()

  await cleanTempFiles()

  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
  const relPath = path.relative(CWD, absPath)
  const mapFile = path.join(CACHE_DIR, relPath.replace(/\.svelte$/, '.svelte.map'))

  const release = await acquireLock(mapFile)

  try {
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

    let jsCodeString = String(result.js.code)
    const { css } = result

    // Write sourcemap
    if (result.js.map) {
      const sourcemap = result.js.map
      sourcemap.sources = [absPath]
      sourcemap.sourcesContent = [source]

      await fs.mkdirp(path.dirname(mapFile))
      await fs.writeFile(mapFile, JSON.stringify(sourcemap))
      jsCodeString += '\n//# sourceMappingURL=' + path.basename(mapFile)
    }

    // Legacy in-memory cache for backward compatibility
    const stats = await fs.stat(absPath)
    cache.set(absPath, { js: jsCodeString, css: css ?? null, mtime: stats.mtimeMs })

    return { js: jsCodeString, css: css ?? null }
  } finally {
    release()
    pendingSvelteCompiles.delete(filePath)
  }
}
