import path from 'node:path'
import fs from '@magic/fs'
import { testExportsPreprocessor, viteDefinePreprocessor } from '../preprocess.js'
import { getSvelteCompiler } from '../compiler-cache.js'
import { cache } from './cache.js'
import { TMP_DIR, CWD } from '../../../constants.js'
import { cleanTempFiles } from './cleanTempFiles.js'
import { acquireLock } from './acquireLock.js'
export const compileSvelte = async filePath => {
  const { compile, preprocess } = await getSvelteCompiler()
  await cleanTempFiles()
  const relPath = path.relative(CWD, filePath)
  const mapFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.map'))
  const release = await acquireLock(mapFile)
  try {
    const cached = cache.get(filePath)
    if (cached) {
      const stats = await fs.stat(filePath)
      if (stats.mtimeMs === cached.mtime) {
        return { js: cached.js, css: cached.css }
      }
    }
    const source = await fs.readFile(filePath, 'utf-8')
    const preprocessors = [testExportsPreprocessor(), viteDefinePreprocessor()]
    const preprocessed = await preprocess(source, preprocessors)
    const result = compile(preprocessed.code, {
      generate: 'client',
      dev: false,
      filename: filePath,
      experimental: {
        async: true,
      },
    })
    if (!result.js) {
      throw new Error('Compilation failed: no JS output')
    }
    let jsCodeString = String(result.js.code)
    const { css } = result
    if (result.js.map) {
      const sourcemap = result.js.map
      sourcemap.sources = [filePath]
      sourcemap.sourcesContent = [source]
      await fs.mkdirp(path.dirname(mapFile))
      await fs.writeFile(mapFile, JSON.stringify(sourcemap))
      jsCodeString = jsCodeString + '\n//# sourceMappingURL=' + path.basename(mapFile)
    }
    const stats = await fs.stat(filePath)
    const jsCodeFinal = jsCodeString
    const cacheEntry = { js: jsCodeFinal, css: css ?? null, mtime: stats.mtimeMs }
    cache.set(filePath, cacheEntry)
    return { js: jsCodeFinal, css: css ?? null }
  } finally {
    release()
  }
}
