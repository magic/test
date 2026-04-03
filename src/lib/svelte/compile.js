import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { compile, preprocess } from 'svelte/compiler'
import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

import { resolveAlias, resolveViteAlias } from './vite-config.js'
import {
  testExportsPreprocessor,
  sveltekitMocksPreprocessor,
  viteDefinePreprocessor,
} from './preprocess.js'
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

/** @type {Map<string, { exports: { name: string, path: string }[], wrapperUrl: string }>} */
const barrelCache = new Map()

/** @type {Set<string>} */
const processingBarrels = new Set()

const TMP_DIR = 'test/.tmp'

let cleanupDone = false

const cleanTempFiles = async () => {
  if (cleanupDone) {
    return
  }
  cleanupDone = true

  try {
    const tmpDir = path.join(process.cwd(), TMP_DIR)
    const exists = await fs.exists(tmpDir)
    if (!exists) {
      return
    }

    const files = await fs.readdir(tmpDir)
    const now = Date.now()
    const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

    for (const file of files) {
      const filePath = path.join(tmpDir, file)
      try {
        const stat = await fs.stat(filePath)
        if (now - stat.mtimeMs > MAX_AGE) {
          fs.rmrf(filePath)
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

const SVELTE_IMPORT_REGEX = /import\s+((?:\{[^}]*\}|\* as \w+|\w+))\s+from\s+['"]([^'"]+)['"]/g

const isSvelteFile = (/** @type {string} */ filePath) => {
  const ext = path.extname(filePath)
  return ext === '.svelte' || ext === '.svx'
}

/**
 * Detect if a file is a barrel that exports Svelte components
 * @param {string} filePath - Path to the potential barrel file
 * @returns {Promise<{ name: string, path: string }[]>} - Array of exported Svelte components
 */
const getSvelteExports = async filePath => {
  // Check cache first
  const cached = barrelCache.get(filePath)
  if (cached) {
    return cached.exports
  }

  const content = await fs.readFile(filePath, 'utf-8')
  /** @type {{ name: string, path: string }[]} */
  const exports = []

  // Match: export { Component } from './Component.svelte'
  // ONLY match exports that point to .svelte files
  const regex = /export\s+\{([^}]+)\}\s+from\s+['"](\.\/[^'"]+\.svelte)['"]/g
  let match

  const sourceDir = path.dirname(filePath)

  while ((match = regex.exec(content)) !== null) {
    const exportedNames = match[1].split(',').map(s => s.trim())
    const exportPath = match[2]
    let resolvedPath = path.resolve(sourceDir, exportPath)

    // Verify the Svelte file exists
    if (await fs.exists(resolvedPath)) {
      for (const name of exportedNames) {
        exports.push({ name, path: resolvedPath })
      }
    }
  }

  return exports
}

/**
 * Compile a barrel file that exports Svelte components
 * @param {string} filePath - Path to the barrel file
 * @param {string[]} [importChain] - Track import chain for circular dep detection
 * @returns {Promise<{ filePath: string, js: { code: string }, url: string }>}
 */
const compileBarrel = async (filePath, importChain = []) => {
  // Check if already cached
  const cached = barrelCache.get(filePath)
  if (cached) {
    return { filePath, js: { code: '' }, url: cached.wrapperUrl }
  }

  // Check for TRUE circular dependency: A→B→A
  // Not: A→B→C (sequential is fine)
  if (importChain.includes(filePath)) {
    const cycle = [...importChain, filePath].join(' → ')
    throw new Error(
      `Circular dependency detected: ${cycle}\n` +
        `Suggestion: Import Svelte components directly instead of using barrel files.\n` +
        `  Instead of: import { Button } from '$lib/forms'\n` +
        `  Use: import Button from '$lib/forms/Button.svelte'`,
    )
  }

  // Add current file to chain for child imports
  const currentChain = [...importChain, filePath]
  processingBarrels.add(filePath)

  try {
    const exports = await getSvelteExports(filePath)

    if (exports.length === 0) {
      throw new Error(`No Svelte exports found in barrel file: ${filePath}`)
    }

    /** @type {{ name: string, url: string }[]} */
    const compiledExports = []

    for (const { name, path: sveltePath } of exports) {
      const { js } = await compileSvelte(sveltePath, currentChain)
      const processed = await processImports(js.code, sveltePath, currentChain)

      const relPath = path.relative(process.cwd(), sveltePath)
      const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))

      await fs.mkdirp(path.dirname(tmpFile))
      await fs.writeFile(tmpFile, processed.code)

      compiledExports.push({ name, url: pathToFileURL(tmpFile).href })
    }

    // Generate wrapper module - fix export syntax
    const wrapperExports = compiledExports
      .map(({ name, url }) => {
        // Skip type exports
        if (name.startsWith('type ') || name === '') {
          return null
        }
        // Handle default export
        if (name === 'default') {
          return `export { default } from '${url}'`
        }
        // Handle named exports
        return `export { ${name} } from '${url}'`
      })
      .filter(Boolean)

    const wrapperCode = wrapperExports.join('\n')

    // Write wrapper to temp file
    const relPath = path.relative(process.cwd(), filePath)
    const wrapperFile = path.join(TMP_DIR, relPath.replace(/\.(ts|js)$/, '.barrel.js'))
    await fs.mkdirp(path.dirname(wrapperFile))
    await fs.writeFile(wrapperFile, wrapperCode)

    const wrapperUrl = pathToFileURL(wrapperFile).href

    // Cache the result
    barrelCache.set(filePath, { exports, wrapperUrl })

    return { filePath, js: { code: wrapperCode }, url: wrapperUrl }
  } finally {
    processingBarrels.delete(filePath)
  }
}

/**
 * Classify import type
 * @param {string} importPath
 * @returns {'relative' | 'scoped' | 'vite-alias' | 'bare'}
 */
const classifyImport = importPath => {
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return 'relative'
  }
  if (importPath.startsWith('@')) {
    return 'scoped'
  }
  if (importPath.startsWith('$')) {
    return 'vite-alias'
  }
  return 'bare'
}

/**
 * @param {string} importPath
 * @param {string} sourceDir
 * @param {string} sourceFilePath
 * @param {string[]} [importChain] - Track import chain for circular dep detection
 */
const resolveAndCompileImport = async (importPath, sourceDir, sourceFilePath, importChain = []) => {
  const importType = classifyImport(importPath)

  // Type 2: Scoped packages (@scope/package) - skip, let Node.js resolve
  if (importType === 'scoped') {
    return { filePath: importPath, js: { code: '' }, url: null, skipProcessing: true }
  }

  // Type 1: Bare imports (node_modules like 'svelte', 'lodash') - skip, let Node.js resolve
  if (importType === 'bare') {
    return { filePath: importPath, js: { code: '' }, url: null, skipProcessing: true }
  }

  // Type 4: Vite/SvelteKit aliases ($lib, $app, $env, etc.)
  if (importType === 'vite-alias') {
    const aliasResolved = await resolveViteAlias(importPath, sourceFilePath)
    if (aliasResolved) {
      // Continue to file resolution below
      var resolvedPath = aliasResolved
    } else {
      // Could not resolve via alias - try manual resolution for $lib
      // For $app/*, $env/* we skip (handled by preprocess.js mocks)
      if (importPath.startsWith('$lib')) {
        // Manual fallback: $lib/forms -> src/lib/forms (relative to project root)
        const rootDir = await (async () => {
          let current = path.dirname(sourceFilePath)
          const root = process.cwd()
          while (current && current !== path.dirname(current)) {
            const pkgPath = path.join(current, 'package.json')
            if (await fs.exists(pkgPath)) {
              return current
            }
            current = path.dirname(current)
          }
          return root
        })()
        const aliasPath = importPath.slice(1) // Remove $
        resolvedPath = path.resolve(rootDir, 'src', aliasPath)
      } else {
        // Could not resolve, skip processing (will be handled by preprocess.js mocks)
        return { filePath: importPath, js: { code: '' }, url: null, skipProcessing: true }
      }
    }
  } else {
    // Type 3: Relative imports (./something, ../something)
    // Only call resolveAlias for relative imports
    const aliasResolved = await resolveAlias(importPath, sourceFilePath)
    if (aliasResolved) {
      resolvedPath = aliasResolved
    } else {
      resolvedPath = path.resolve(sourceDir, importPath)
    }
  }

  // If the path doesn't have an extension, try to find the file with extensions
  if (!path.extname(resolvedPath)) {
    const extensions = ['.ts', '.js', '.svelte', '/index.ts', '/index.js', '/index.svelte']
    for (const ext of extensions) {
      const withExt = resolvedPath + ext
      if (await fs.exists(withExt)) {
        resolvedPath = withExt
        break
      }
    }
  } else if (resolvedPath.endsWith('.js') && !(await fs.exists(resolvedPath))) {
    // .js file doesn't exist - try .ts version
    const tsPath = resolvedPath.slice(0, -3) + '.ts'
    if (await fs.exists(tsPath)) {
      resolvedPath = tsPath
    }
  }

  // Path validation: Check if resolved path points to a directory or is invalid
  const pathStats = (await fs.exists(resolvedPath)) ? await fs.stat(resolvedPath) : null
  if (pathStats?.isDirectory()) {
    // FIX: Try to find the file using the import path filename
    // e.g., if resolvedPath = "forms" and importPath = "./Button.svelte"
    // try "forms/Button.svelte"
    const importFileName = path.basename(importPath)
    const possibleFile = path.join(resolvedPath, importFileName)

    // First try with .svelte extension
    const withSvelte = possibleFile.endsWith('.svelte') ? possibleFile : possibleFile + '.svelte'
    if (await fs.exists(withSvelte)) {
      resolvedPath = withSvelte
    }
    // Try just the filename.svelte directly in that directory
    else if (importPath.includes('/')) {
      const fileName = importPath.split('/').pop() ?? ''
      const directCandidate = path.join(resolvedPath, fileName)
      if (await fs.exists(directCandidate)) {
        resolvedPath = directCandidate
      }
    }
  }

  // Global path validation - verify file exists, try to fix common issues
  if (!(await fs.exists(resolvedPath))) {
    // Try adding .svelte extension
    if (await fs.exists(resolvedPath + '.svelte')) {
      resolvedPath = resolvedPath + '.svelte'
    }
    // Try /index.svelte
    else if (await fs.exists(path.join(resolvedPath, 'index.svelte'))) {
      resolvedPath = path.join(resolvedPath, 'index.svelte')
    }
    // FIX: If path is corrupted like "forms/svelte" (no extension), reconstruct from source context
    else if (!path.extname(resolvedPath) && !resolvedPath.includes('.')) {
      // This is likely a corruption - try to find the file relative to source
      const sourceBase = path.basename(sourceFilePath, '.svelte')
      // Check if this looks like a barrel component directory
      const sourceDirName = path.dirname(sourceFilePath)
      const possiblePath = path.join(sourceDirName, importPath.replace(/^\.\//, ''))
      if (await fs.exists(possiblePath)) {
        resolvedPath = possiblePath
      }
    }
  }

  // NEW: Check if it's a barrel file that exports Svelte components
  const ext = path.extname(resolvedPath)
  if (ext === '.ts' || ext === '.js') {
    const exports = await getSvelteExports(resolvedPath)
    if (exports.length > 0) {
      return await compileBarrel(resolvedPath, importChain)
    }
  }

  // If it's a svelte file, compile it; otherwise return URL for tsLoader to handle
  if (!isSvelteFile(resolvedPath)) {
    const importUrl = pathToFileURL(resolvedPath).href
    return { filePath: resolvedPath, js: { code: '' }, url: importUrl }
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

    const { js } = await compileSvelte(resolvedPath, importChain)

    const processed = await processImports(js.code, resolvedPath, importChain)

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
 * @param {string[]} [importChain] - Track import chain for circular dep detection
 */
const processImports = async (code, sourceFilePath, importChain = []) => {
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
      const result = await resolveAndCompileImport(
        importPath,
        sourceDir,
        sourceFilePath,
        importChain,
      )

      // For scoped/bare packages, leave the import as-is for Node.js to resolve
      if ('skipProcessing' in result && result.skipProcessing) {
        continue
      }

      const url = 'url' in result && result.url
      if (!url) {
        continue
      }
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
 * Transform compiled Svelte code to be valid ESM for Node.js
 * Fixes issues with _unknown_ identifier and other ESM compatibility issues
 * @param {string} code - Compiled Svelte code
 * @param {string} filePath - Original component file path
 */
const transformForNode = (code, filePath) => {
  // Extract component name from file path
  const componentName = path.basename(filePath, '.svelte')
  const safeName = componentName.replace(/[^a-zA-Z0-9]/g, '_') + '$$component'

  // Replace _unknown_ with safe name (both as function name and references)
  let transformed = code.replace(/_unknown_/g, safeName)

  return transformed
}

/**
 * @param {string} filePath
 * @param {string[]} [importChain] - Track import chain for circular dep detection
 */
export const compileSvelte = async (filePath, importChain = []) => {
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

    const preprocessors = [
      testExportsPreprocessor(),
      sveltekitMocksPreprocessor(),
      viteDefinePreprocessor(),
    ]

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

  // Apply transform for Node.js ESM compatibility
  const transformedCode = transformForNode(js.code, filePath)

  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const importUrl = pathToFileURL(tmpFile).href

  const release = await acquireLock(tmpFile)

  try {
    await fs.mkdirp(path.dirname(tmpFile))
    await fs.writeFile(tmpFile, transformedCode)
  } finally {
    release()
  }

  return { js: { code: transformedCode }, css, tmpFile, importUrl }
}
