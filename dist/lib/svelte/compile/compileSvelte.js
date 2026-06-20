import fs from '@magic/fs'
import { testExportsPreprocessor, viteDefinePreprocessor } from '../preprocess.js'
import { getSvelteCompiler } from '../compiler-cache.js'
import { cache, pendingSvelteCompiles } from './cache.js'
import { TMP_DIR, CWD } from '../../../constants.js'
import { cleanTempFiles } from './cleanTempFiles.js'
import { acquireLock } from './acquireLock.js'
/**
 * Pure compilation function - no caching logic here
 * Caching is handled by the CacheManager in tsLoader
 */
export const compileSvelte = async filePath => {
  // Legacy promise dedup for direct callers (prefer CacheManager for new code)
  const pending = pendingSvelteCompiles.get(filePath)
  if (pending) {
    return pending
  }
  const { compile, preprocess } = await getSvelteCompiler()
  await cleanTempFiles()
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
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
    // Legacy in-memory cache for backward compatibility
    const stats = await fs.stat(absPath)
    cache.set(absPath, { js: jsCodeString, css: css ?? null, mtime: stats.mtimeMs })
    return { js: jsCodeString, css: css ?? null }
  } finally {
    release()
  }
}
// Need path for above
import path from 'node:path'
