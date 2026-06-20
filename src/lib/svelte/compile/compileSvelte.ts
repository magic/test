import path from 'node:path'

import fs from '@magic/fs'

import { testExportsPreprocessor, viteDefinePreprocessor } from '../preprocess.ts'
import { getSvelteCompiler } from '../compiler-cache.ts'

import { pendingPromises } from './cache.ts'
import { TMP_DIR, CWD } from '../../../constants.ts'
import { cleanTempFiles } from './cleanTempFiles.ts'
import { acquireLock } from './acquireLock.ts'
import type { CssObject } from './types.ts'

export interface CompileSvelteReturn {
  js: string
  css: CssObject | null
}

/**
 * Pure compilation function - caching handled by CacheManager in tsLoader
 * Uses pendingPromises for deduplication
 */
export const compileSvelte = async (filePath: string): Promise<CompileSvelteReturn> => {
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)

  // Check if already compiling
  const existing = pendingPromises.get(absPath)
  if (existing) {
    return existing as Promise<CompileSvelteReturn>
  }

  const promise = (async (): Promise<CompileSvelteReturn> => {
    try {
      const { compile, preprocess } = await getSvelteCompiler()

      await cleanTempFiles()

      const relPath = path.relative(CWD, absPath)
      const mapFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.map'))

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

        return { js: jsCodeString, css: css ?? null }
      } finally {
        release()
      }
    } finally {
      // Clean up pending promise entry
      pendingPromises.delete(absPath)
    }
  })()

  pendingPromises.set(absPath, promise)
  return promise
}
