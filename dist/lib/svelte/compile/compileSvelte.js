import path from 'node:path'
import fs from '@magic/fs'
import { testExportsPreprocessor, viteDefinePreprocessor } from '../preprocess.js'
import { getSvelteCompiler } from '../compiler-cache.js'
import { pendingPromises } from './cache.js'
import { TMP_DIR, CWD } from '../../../constants.js'
import { cleanTempFiles } from './cleanTempFiles.js'
import { acquireLock } from './acquireLock.js'
/**
 * Pure compilation function - caching handled by CacheManager in tsLoader
 * Uses pendingPromises for deduplication
 */
export const compileSvelte = async filePath => {
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
  // Check if already compiling
  const existing = pendingPromises.get(absPath)
  if (existing) {
    return existing
  }
  const promise = (async () => {
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
