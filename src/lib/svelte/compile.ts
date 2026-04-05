import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { compile, preprocess } from 'svelte/compiler'
import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

import { resolveAlias, resolveViteAlias } from './viteConfig/index.ts'
import { testExportsPreprocessor, viteDefinePreprocessor } from './preprocess.ts'
import { LRUCache } from './LRUCache.ts'
import { SourceMap } from 'magic-string'

interface CssObject {
  code: string
  map?: SourceMap
  hasGlobal?: boolean
}

interface CompileCacheEntry {
  js: { code: string }
  css: CssObject | null
  mtime: number
}

interface ImportCacheEntry {
  code: string
  absPath: string
  mtime: number
}

interface BarrelCacheEntry {
  exports: { name: string; path: string }[]
  wrapperAbsPath: string
}

type ResolveAndCompileResult =
  | { filePath: string; js: { code: string }; url: string | null; skipProcessing: true }
  | { filePath: string; js: { code: string }; url: string }

const cache = new LRUCache(100)

const importCache = new LRUCache(100)

const barrelCache = new Map<string, BarrelCacheEntry>()

const processingBarrels = new Set()

let TMP_DIR = 'test/.tmp'

export const setTmpDir = (dir: string) => {
  TMP_DIR = dir
}

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

const acquireLock = async (filePath: string): Promise<() => void> => {
  while (fileLocks.has(filePath)) {
    const lockPromise = fileLocks.get(filePath)
    if (lockPromise) {
      await lockPromise
      fileLocks.delete(filePath)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let release: (value: unknown) => void
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

const isSvelteFile = (filePath: string): boolean => {
  const ext = path.extname(filePath)
  return ext === '.svelte' || ext === '.svx'
}

/**
 * Detect if a file is a barrel that exports Svelte components
 */
const getSvelteExports = async (filePath: string): Promise<{ name: string; path: string }[]> => {
  // Check cache first
  const cached = barrelCache.get(filePath)
  if (cached) {
    return cached.exports
  }

  const content = await fs.readFile(filePath, 'utf-8')

  const exports: { name: string; path: string }[] = []

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
 */
const compileBarrel = async (
  filePath: string,
  importChain: string[] = [],
): Promise<{ filePath: string; js: { code: string }; wrapperAbsPath: string }> => {
  // Check if already cached
  const cached = barrelCache.get(filePath)
  if (cached) {
    return { filePath, js: { code: '' }, wrapperAbsPath: cached.wrapperAbsPath }
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

    const compiledExports: { name: string; absPath: string }[] = []

    for (const { name, path: sveltePath } of exports) {
      const { js } = await compileSvelte(sveltePath, currentChain)
      const processed = await processImports(js.code, sveltePath, currentChain)

      const relPath = path.relative(process.cwd(), sveltePath)
      const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))

      await fs.mkdirp(path.dirname(tmpFile))
      await fs.writeFile(tmpFile, processed.code)

      compiledExports.push({ name, absPath: path.join(process.cwd(), tmpFile) })
    }

    // Determine wrapper file path first
    const barrelRelPath = path.relative(process.cwd(), filePath)
    const wrapperFile = path.join(TMP_DIR, barrelRelPath.replace(/\.(ts|js)$/, '.barrel.js'))
    const wrapperAbsPath = path.join(process.cwd(), wrapperFile)
    const wrapperTmpDir = path.dirname(wrapperAbsPath)

    // Generate wrapper module - fix export syntax
    const wrapperExports = compiledExports
      .map(({ name, absPath }) => {
        // Skip type exports
        if (name.startsWith('type ') || name === '') {
          return null
        }
        // Compute relative path from the wrapper file location to the component file
        const relative = computeRelativePath(wrapperTmpDir, absPath)
        // Handle default export
        if (name === 'default') {
          return `export { default } from '${relative}'`
        }
        // Handle named exports
        return `export { ${name} } from '${relative}'`
      })
      .filter(Boolean)

    const wrapperCode = wrapperExports.join('\n')

    // Write wrapper to temp file
    await fs.mkdirp(path.dirname(wrapperFile))
    await fs.writeFile(wrapperFile, wrapperCode)

    // Cache the result
    barrelCache.set(filePath, { exports, wrapperAbsPath })

    return { filePath, js: { code: wrapperCode }, wrapperAbsPath }
  } finally {
    processingBarrels.delete(filePath)
  }
}

/**
 * Classify import type
 */
const classifyImport = (importPath: string): 'relative' | 'scoped' | 'vite-alias' | 'bare' => {
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
 * Get the absolute path of the compiled temp file for a source .svelte file
 */
const getTmpFilePath = (sourceFilePath: string): string => {
  const cwd = process.cwd()
  const rel = path.relative(cwd, sourceFilePath)
  const tmpFile = path.join(cwd, TMP_DIR, rel.replace(/\.svelte$/, '.svelte.js'))
  return tmpFile
}

/**
 * Compute relative path from a directory to a target file (using forward slashes)
 * Ensures the result is a valid relative import specifier (starts with './' or '../' or '/')
 */
const computeRelativePath = (fromDir: string, toFile: string): string => {
  const absoluteFrom = path.isAbsolute(fromDir) ? fromDir : path.join(process.cwd(), fromDir)
  const absoluteTo = path.isAbsolute(toFile) ? toFile : path.join(process.cwd(), toFile)
  let relative = path.relative(absoluteFrom, absoluteTo)
  relative = relative.replace(/\\/g, '/')
  // If the result doesn't start with '/' (absolute) or '.' (relative), it's a same-directory reference.
  // Prepend './' to make it a valid relative import.
  if (!relative.startsWith('/') && !relative.startsWith('.')) {
    relative = './' + relative
  }
  return relative
}

const resolveAndCompileImport = async (
  importPath: string,
  sourceDir: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<ResolveAndCompileResult> => {
  const importType = classifyImport(importPath)

  // Special handling for svelte package - force client entry
  if (importPath === 'svelte') {
    const svelteClient = path.resolve(process.cwd(), 'node_modules/svelte/src/index-client.js')
    if (await fs.exists(svelteClient)) {
      const sourceTmpFile = getTmpFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, svelteClient)
      return { filePath: importPath, js: { code: '' }, url: relativePath }
    }
    // If client file not found, fall through to normal handling
  }

  // Type 2: Scoped packages (@scope/package) - let Node.js resolve at runtime
  // Do NOT try to pre-resolve - just skip and leave import as-is
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
      // Could not resolve via alias - try manual resolution for $lib or $app
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
      } else if (importPath.startsWith('$app')) {
        // Manual fallback: $app/* -> src/lib/svelte/shims/$app/*
        const rootDir = process.cwd()
        const shimName = importPath.slice(5) // after "$app/"
        resolvedPath = path.join(rootDir, 'src/lib/svelte/shims/$app', shimName)
      } else {
        // Could not resolve, skip processing
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
  // Priority: .ts first (since many SvelteKit projects use .ts), then .js, then .svelte
  if (!path.extname(resolvedPath)) {
    const extensions = ['.ts', '.js', '.svelte', '/index.ts', '/index.js', '/index.svelte']
    for (const ext of extensions) {
      const withExt = resolvedPath + ext
      if (await fs.exists(withExt)) {
        resolvedPath = withExt
        break
      }
    }
  } else if (resolvedPath.endsWith('.js')) {
    // For .js files, check if a .ts version exists and use that instead
    // This handles SvelteKit barrel files that use .js imports but are .ts files
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
      const barrelResult = await compileBarrel(resolvedPath, importChain)
      // Compute relative path from the source file's tmp directory to the wrapper file
      const sourceTmpFile = getTmpFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, barrelResult.wrapperAbsPath)
      return { filePath: resolvedPath, js: barrelResult.js, url: relativePath }
    }
  }

  // If it's a svelte file, compile it; otherwise return relative path for Node.js to handle
  if (!isSvelteFile(resolvedPath)) {
    // For non-Svelte files (including .ts), return a relative path from the source file's tmp directory
    const sourceTmpFile = getTmpFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, resolvedPath)
    return { filePath: resolvedPath, js: { code: '' }, url: relativePath }
  }

  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const tmpFileAbs = path.join(process.cwd(), tmpFile)

  const release = await acquireLock(tmpFile)

  try {
    const cached = importCache.get(resolvedPath) as ImportCacheEntry | undefined
    if (cached) {
      const stats = await fs.stat(resolvedPath)
      if (stats.mtime.getTime() === cached.mtime) {
        // Compute relative path from this importer's tmp directory to the cached absolute path
        const sourceTmpFile = getTmpFilePath(sourceFilePath)
        const fromDir = path.dirname(sourceTmpFile)
        const relativePath = computeRelativePath(fromDir, cached.absPath)
        return { filePath: resolvedPath, js: { code: cached.code }, url: relativePath }
      }
    }

    const { js } = await compileSvelte(resolvedPath, importChain)

    const processed = await processImports(js.code, resolvedPath, importChain)

    await fs.mkdirp(path.dirname(tmpFile))
    await fs.writeFile(tmpFile, processed.code)

    const stats = await fs.stat(resolvedPath)

    // Cache absolute path; relative path will be computed per importer
    importCache.set(resolvedPath, {
      code: processed.code,
      absPath: tmpFileAbs,
      mtime: stats.mtime.getTime(),
    })

    // Compute relative path for this importer
    const sourceTmpFile = getTmpFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, tmpFileAbs)

    return { filePath: resolvedPath, js: { code: processed.code }, url: relativePath }
  } finally {
    release()
  }
}

const processImports = async (
  code: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<{ code: string }> => {
  let processedCode = code
  const sourceDir = path.dirname(sourceFilePath)
  const imports: { imported: string; path: string; full: string }[] = []

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
 */
const transformForNode = (code: string, filePath: string): string => {
  // Extract component name from file path
  const componentName = path.basename(filePath, '.svelte')
  const safeName = componentName.replace(/[^a-zA-Z0-9]/g, '_') + '$$component'

  // Replace _unknown_ with safe name (both as function name and references)
  let transformed = code.replace(/_unknown_/g, safeName)

  return transformed
}

export const compileSvelte = async (
  filePath: string,
  importChain: string[] = [],
): Promise<{ js: { code: string }; css: CssObject | null }> => {
  await cleanTempFiles()

  const relPath = path.relative(process.cwd(), filePath)
  const mapFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.map'))

  const release = await acquireLock(mapFile)

  try {
    const cached = cache.get(filePath) as CompileCacheEntry | undefined

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

export const compileSvelteWithImports = async (
  filePath: string,
): Promise<{ js: { code: string }; css: CssObject | null }> => {
  const { js, css } = await compileSvelte(filePath)
  const processed = await processImports(js.code, filePath)

  return { js: { code: processed.code }, css }
}

export const compileSvelteWithWrite = async (
  filePath: string,
): Promise<{ js: { code: string }; css: CssObject | null; tmpFile: string; importUrl: string }> => {
  const { js, css } = await compileSvelteWithImports(filePath)

  // Apply transform for Node.js ESM compatibility
  const transformedCode = transformForNode(js.code, filePath)

  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const tmpFileAbs = path.resolve(process.cwd(), tmpFile)
  const importUrl = pathToFileURL(tmpFileAbs).href

  // Write file WITHOUT lock to avoid potential blocking issues
  await fs.mkdirp(path.dirname(tmpFileAbs))
  await fs.writeFile(tmpFileAbs, transformedCode)

  return { js: { code: transformedCode }, css, tmpFile, importUrl }
}
