import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { compile, preprocess } from 'svelte/compiler'
import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

import { resolveAlias } from './vite-config.js'
import { testExportsPreprocessor, sveltekitMocksPreprocessor } from './preprocess.js'
import { LRUCache } from './LRUCache.js'

/** @typedef {{ code: string; map: import('magic-string').SourceMap; hasGlobal: boolean; }} CssObject */

/**
 * @typedef {Object} CompileCacheEntry
 * @property {{ code: string }} js
 * @property {CssObject | null} css
 * @property {number} mtime
 */

/**
 * @typedef {Object} ImportCacheEntry
 * @property {string} code
 * @property {string} url
 * @property {number} mtime
 */

/** @type {LRUCache<CompileCacheEntry>} */
const cache = new LRUCache(100)

/** @type {LRUCache<ImportCacheEntry>} */
const importCache = new LRUCache(100)

const TMP_DIR = 'test/.tmp'

let cleanupDone = false

const cleanTempFiles = async () => {
  if (cleanupDone) return
  cleanupDone = true

  try {
    const tmpDir = path.join(process.cwd(), TMP_DIR)
    if (!fs.existsSync(tmpDir)) return

    const files = fs.readdirSync(tmpDir)
    const now = Date.now()
    const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

    for (const file of files) {
      const filePath = path.join(tmpDir, file)
      try {
        const stat = fs.statSync(filePath)
        if (now - stat.mtimeMs > MAX_AGE) {
          fs.unlinkSync(filePath)
        }
      } catch {
        // Ignore errors for individual files
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}

const fileLocks = new Map()

const acquireLock = async (/** @type {string} */ filePath) => {
  while (fileLocks.has(filePath)) {
    const lockPromise = fileLocks.get(filePath)
    if (lockPromise) {
      await lockPromise
      fileLocks.delete(filePath)
    }
  }

  /** @type {(value: unknown) => void} */
  let release
  const promise = new Promise(resolve => {
    release = resolve
  })
  fileLocks.set(filePath, promise)

  return () => {
    fileLocks.delete(filePath)
    release(undefined)
  }
}

const SVELTE_IMPORT_REGEX =
  /import\s+((?:\{[^}]*\}|\* as \w+|\w+))\s+from\s+['"]([^'"]+\.svelte)['"]/g

/**
 * @param {string} importPath
 * @param {string} sourceDir
 * @param {string} sourceFilePath
 */
const resolveAndCompileImport = async (importPath, sourceDir, sourceFilePath) => {
  let resolvedPath

  const aliasResolved = await resolveAlias(importPath, sourceFilePath)
  if (aliasResolved) {
    resolvedPath = aliasResolved
  } else {
    resolvedPath = path.resolve(sourceDir, importPath)
  }

  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))

  const release = await acquireLock(tmpFile)

  try {
    const cached = importCache.get(resolvedPath)
    if (cached) {
      const stats = await fs.stat(resolvedPath)
      if (stats.mtime.getTime() === cached.mtime) {
        return { filePath: resolvedPath, js: cached.code, url: cached.url }
      }
    }

    const { js } = await compileSvelte(resolvedPath)

    const processed = await processImports(js.code, resolvedPath)

    const importUrl = pathToFileURL(tmpFile)

    await fs.mkdirp(path.dirname(tmpFile))
    await fs.writeFile(tmpFile, processed.code)

    const stats = await fs.stat(resolvedPath)
    importCache.set(resolvedPath, {
      code: processed.code,
      url: importUrl.href,
      mtime: stats.mtime.getTime(),
    })

    return { filePath: resolvedPath, js: processed.code, url: importUrl.href }
  } finally {
    release()
  }
}

/**
 * @param {string} code
 * @param {string} sourceFilePath
 */
const processImports = async (code, sourceFilePath) => {
  let processedCode = code
  const sourceDir = path.dirname(sourceFilePath)
  const imports = []

  let match
  const regex = new RegExp(SVELTE_IMPORT_REGEX.source, 'g')
  while ((match = regex.exec(code)) !== null) {
    imports.push({ imported: match[1], path: match[2], full: match[0] })
  }

  for (const { imported, path: importPath, full } of imports) {
    try {
      const { url } = await resolveAndCompileImport(importPath, sourceDir, sourceFilePath)
      const importRegex = new RegExp(
        `import\\s+${imported.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
        'g',
      )
      processedCode = processedCode.replace(importRegex, `import ${imported} from '${url}'`)
    } catch (e) {
      const message = is.error(e) ? e.message : String(e)
      log.error('Could not resolve import', importPath, message)
      throw e
    }
  }

  return { code: processedCode }
}

/**
 * @param {string} filePath
 */
export const compileSvelte = async filePath => {
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

    const preprocessors = [testExportsPreprocessor(), sveltekitMocksPreprocessor()]

    const preprocessed = await preprocess(source, preprocessors)

    const result = compile(preprocessed.code, {
      generate: 'client',
      dev: true,
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
    /** @type {CompileCacheEntry} */
    const cacheEntry = { js: { code: jsCodeFinal }, css, mtime: stats.mtime.getTime() }
    cache.set(filePath, cacheEntry)

    return { js: { code: jsCodeFinal }, css }
  } finally {
    release()
  }
}

/**
 * @param {string} filePath
 */
export const compileSvelteWithImports = async filePath => {
  const { js, css } = await compileSvelte(filePath)
  const processed = await processImports(js.code, filePath)

  return { js: { code: processed.code }, css }
}

/**
 * @param {string} filePath
 */
export const compileSvelteWithWrite = async filePath => {
  await cleanTempFiles()

  const { js, css } = await compileSvelteWithImports(filePath)

  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const importUrl = pathToFileURL(tmpFile).href

  const release = await acquireLock(tmpFile)

  try {
    await fs.mkdirp(path.dirname(tmpFile))
    await fs.writeFile(tmpFile, js.code)
  } finally {
    release()
  }

  return { js, css, tmpFile, importUrl }
}
