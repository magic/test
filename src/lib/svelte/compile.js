import { compile } from 'svelte/compiler'
import fs from '@magic/fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveAlias } from './vite-config.js'

const cache = new Map()
const importCache = new Map()

const TMP_DIR = 'test/.tmp'

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

  const cached = importCache.get(resolvedPath)
  if (cached) {
    const stats = await fs.stat(resolvedPath)
    if (stats.mtime.getTime() === cached.mtime) {
      return { filePath: resolvedPath, js: cached.code, url: cached.url }
    }
  }

  const { js } = await compileSvelte(resolvedPath)

  const processed = await processImports(js.code, resolvedPath)

  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const importUrl = pathToFileURL(tmpFile)

  await fs.mkdirp(path.dirname(tmpFile))
  await fs.writeFile(tmpFile, processed.code)

  const stats = await fs.stat(resolvedPath)
  importCache.set(resolvedPath, {
    code: processed.code,
    url: importUrl,
    mtime: stats.mtime.getTime(),
  })

  return { filePath: resolvedPath, js: processed.code, url: importUrl }
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
      console.warn(`Could not resolve import ${importPath}: ${message}`)
    }
  }

  return { code: processedCode }
}

/**
 * @param {string} filePath
 */
export const compileSvelte = async filePath => {
  const cached = cache.get(filePath)

  if (cached) {
    const stats = await fs.stat(filePath)
    if (stats.mtime.getTime() === cached.mtime) {
      return { js: cached.js, css: cached.css }
    }
  }

  const source = await fs.readFile(filePath, 'utf-8')

  const result = compile(source, {
    generate: 'client',
    dev: true,
    filename: filePath,
  })

  let jsCode = result.js.code
  const css = result.css

  if (result.js.map) {
    const sourcemap = result.js.map
    sourcemap.sources = [filePath]
    sourcemap.sourcesContent = [source]

    const relPath = path.relative(process.cwd(), filePath)
    const mapFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.map'))

    await fs.mkdirp(path.dirname(mapFile))
    await fs.writeFile(mapFile, JSON.stringify(sourcemap))
    jsCode = jsCode + '\n//# sourceMappingURL=' + path.basename(mapFile)
  }

  const stats = await fs.stat(filePath)
  cache.set(filePath, { js: { code: jsCode }, css, mtime: stats.mtime.getTime() })

  return { js: { code: jsCode }, css }
}

/**
 * @param {string} filePath
 */
export const compileSvelteWithImports = async filePath => {
  const { js, css } = await compileSvelte(filePath)
  const processed = await processImports(js.code, filePath)

  return { js: { code: processed.code }, css }
}
