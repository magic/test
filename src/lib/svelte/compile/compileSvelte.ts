import path from 'node:path'

import fs from '@magic/fs'

import { testExportsPreprocessor, viteDefinePreprocessor } from '../preprocess.ts'
import { getSvelteCompiler } from '../compiler-cache.ts'

import { cache, pendingPromises } from '../../caches/cache.ts'
import { CWD } from '../../../constants.ts'
import type { CssObject } from './types.ts'

export interface CompileSvelteReturn {
  js: string
  css: CssObject | null
  map?: string
}

/**
 * Pure compilation function - caching handled by CacheManager in tsLoader
 * Uses pendingPromises for deduplication
 */
export const compileSvelte = async (filePath: string): Promise<CompileSvelteReturn> => {
  // Legacy promise dedup for direct callers (prefer CacheManager for new code)
  const pending = pendingPromises.get(`svelte:${filePath}`) as
    | Promise<CompileSvelteReturn>
    | undefined
  if (pending) {
    return pending
  }

  const compilePromise = (async () => {
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

    const jsCodeString = String(result.js.code)
    const { css } = result

    // Generate source map string for coverage remapping
    const mapString = result.js.map ? JSON.stringify(result.js.map) : undefined

    // Legacy in-memory cache for backward compatibility
    const stats = await fs.stat(absPath)
    cache.set(absPath, { js: jsCodeString, css: css ?? null, mtime: stats.mtimeMs })

    return { js: jsCodeString, css: css ?? null, map: mapString }
  })()

  pendingPromises.set(`svelte:${filePath}`, compilePromise)
  try {
    return await compilePromise
  } finally {
    pendingPromises.delete(`svelte:${filePath}`)
  }
}
