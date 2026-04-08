import path from 'node:path'

import { compile, preprocess } from 'svelte/compiler'
import fs from '@magic/fs'

import { testExportsPreprocessor, viteDefinePreprocessor } from '../preprocess.ts'

import { cache } from './cache.ts'
import { TMP_DIR } from './constants.ts'
import { cleanTempFiles } from './cleanTempFiles.ts'
import { acquireLock } from './acquireLock.ts'
import type { CssObject } from './types.ts'

export const compileSvelte = async (
  filePath: string,
): Promise<{ js: { code: string }; css: CssObject | null }> => {
  await cleanTempFiles()

  const relPath = path.relative(process.cwd(), filePath)
  const mapFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.map'))

  const release = await acquireLock(mapFile)

  try {
    const cached = cache.get(filePath)

    if (cached) {
      const stats = await fs.stat(filePath)
      if (stats.mtime.getTime() === cached.mtime) {
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

    const cacheEntry = { js: { code: jsCodeFinal }, css: css ?? null, mtime: stats.mtime.getTime() }
    cache.set(filePath, cacheEntry)

    return { js: { code: jsCodeFinal }, css: css ?? null }
  } finally {
    release()
  }
}
