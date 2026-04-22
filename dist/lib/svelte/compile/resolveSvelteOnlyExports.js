import path from 'node:path'
import { pathToFileURL } from 'node:url'
import crypto from 'node:crypto'
import fs from '@magic/fs'
import { compileSvelteWithWrite } from './compileSvelteWithWrite.js'
import { resolvePackageExport } from './resolvePackageExport.js'
import { cache as compileCache } from './cache.js'
const STATIC_IMPORT_RE =
  /(import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))?\s+from\s+['"`])([^'"`\s]+)(['"`])/g
const RE_EXPORT_NAMED_RE = /(export\s+\{[^}]+\}\s+from\s+['"`])([^'"`\s]+)(['"`])/g
const RE_EXPORT_ALL_RE = /(export\s+\*\s+from\s+['"`])([^'"`\s]+)(['"`])/g
const DYNAMIC_IMPORT_RE = /(import\s*\(['"`])([^'"`\s]+)(['"`]\s*\))/g
const SIDE_EFFECT_RE = /(?:^|\n)(import\s+['"`])([^'"`\s]+)(['"])/g
const TYPE_IMPORT_RE = /import\s+type\s+.*?from\s+['"`][^'"`\s]+['"`]/g
const pendingWrites = new Map()
const writeTempFile = async (filePath, code) => {
  const relPath = path.relative(process.cwd(), filePath)
  const tempFile = path.join(process.cwd(), 'test/.tmp', relPath + '.mjs')
  let pending = pendingWrites.get(tempFile)
  if (!pending) {
    pending = (async () => {
      await fs.mkdirp(path.dirname(tempFile))
      await fs.writeFile(tempFile, code)
      pendingWrites.delete(tempFile)
    })()
    pendingWrites.set(tempFile, pending)
  }
  await pending
  return tempFile
}
const JS_SVELTE_REEXPORT_RE =
  /(export\s+(?:\{[^}]*\}|\*\s+as\s+\w+|default(?:\s+as\s+\w+)?)\s+from\s+['"])([^'"]*\.svelte)(['"])/g
const JS_REEXPORT_RE = /(export\s+\*\s+from\s+['"])([^'"]+\.js)(['"])/g
const inProgress = new Set()
export const compileSvelteOnlyExport = async (sveltePath, sourceDir) => {
  if (!sveltePath.endsWith('.js') && !sveltePath.endsWith('.mjs')) {
    if (!(await fs.exists(sveltePath))) {
      const svelteJsPath = sveltePath + '.js'
      if (await fs.exists(svelteJsPath)) {
        sveltePath = svelteJsPath
      }
    }
  }
  const content = await fs.readFile(sveltePath, 'utf-8')
  const hash = crypto.createHash('sha256').update(content).digest('hex')
  const cacheKey = `${sveltePath}:${hash}`
  const cached = compileCache.get(cacheKey)
  if (cached) {
    const cachedAny = cached
    if (cachedAny.tmpFile) {
      return cachedAny.tmpFile
    }
  }
  if (sveltePath.endsWith('.js') || sveltePath.endsWith('.mjs')) {
    const processedCode = await handleJsWithSvelteReexports(content, sveltePath, sourceDir)
    const tempFile = await writeTempFile(sveltePath, processedCode)
    compileCache.set(cacheKey, { js: { code: content }, css: null })
    return tempFile
  }
  const { tmpFile } = await compileSvelteWithWrite(sveltePath)
  compileCache.set(cacheKey, { js: { code: content }, css: null })
  return tmpFile
}
const handleJsWithSvelteReexports = async (code, jsFilePath, _sourceDir) => {
  if (inProgress.has(jsFilePath)) {
    return code
  }
  inProgress.add(jsFilePath)
  try {
    const jsDir = path.dirname(jsFilePath)
    const replacements = []
    const matches = [...code.matchAll(JS_SVELTE_REEXPORT_RE)]
    for (const match of matches) {
      const prefix = match[1]
      const sveltePath = match[2]
      const suffix = match[3]
      if (!sveltePath) continue
      const absoluteSveltePath = path.resolve(jsDir, sveltePath)
      const compiledPath = await compileSvelteOnlyExport(absoluteSveltePath, jsDir)
      const compiledUrl = pathToFileURL(compiledPath).href
      replacements.push({
        original: match[0],
        replacement: `${prefix}${compiledUrl}${suffix}`,
      })
    }
    const jsReexports = [...code.matchAll(JS_REEXPORT_RE)]
    for (const match of jsReexports) {
      const prefix = match[1]
      const reexportPath = match[2]
      const suffix = match[3]
      if (!reexportPath) continue
      const absolutePath = path.resolve(jsDir, reexportPath)
      if (
        (await fs.exists(absolutePath)) &&
        (absolutePath.endsWith('.js') || absolutePath.endsWith('.mjs'))
      ) {
        const reexportContent = await fs.readFile(absolutePath, 'utf-8')
        const processedReexport = await handleJsWithSvelteReexports(
          reexportContent,
          absolutePath,
          jsDir,
        )
        const tempFile = await writeTempFile(absolutePath, processedReexport)
        const tempUrl = pathToFileURL(tempFile).href
        replacements.push({
          original: match[0],
          replacement: `${prefix}${tempUrl}${suffix}`,
        })
      }
    }
    let result = code
    for (const { original, replacement } of replacements) {
      result = result.replace(original, replacement)
    }
    return result
  } finally {
    inProgress.delete(jsFilePath)
  }
}
const extractNamedExports = code => {
  const exports = []
  const defaultMatch = /export\s+default\s+(?:function\s+(\w+)|class\s+(\w+)|const\s+(\w+))/g
  let match
  while ((match = defaultMatch.exec(code)) !== null) {
    exports.push(match[1] || match[2] || match[3] || '')
  }
  const namedMatch = /export\s+(?:const|let|var|function|class)\s+(\w+)/g
  while ((match = namedMatch.exec(code)) !== null) {
    if (match[1]) exports.push(match[1])
  }
  const destructureMatch = /export\s+\{\s*([^}]+)\s*\}/g
  while ((match = destructureMatch.exec(code)) !== null) {
    const match1 = match[1]
    if (match1) {
      const names = match1.split(',').map(n => {
        const trimmed = n.trim()
        const asParts = trimmed.split(' as ')
        return asParts[0] || trimmed
      })
      exports.push(...names)
    }
  }
  return [...new Set(exports)]
}
const isSkipPattern = spec => {
  return (
    spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('$') || spec.startsWith('/')
  )
}
export const resolveSvelteOnlyExports = async (code, sourceDir) => {
  let result = code
  const specsToResolve = new Set()
  for (const match of result.matchAll(STATIC_IMPORT_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) specsToResolve.add(spec)
  }
  for (const match of result.matchAll(RE_EXPORT_NAMED_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) specsToResolve.add(spec)
  }
  for (const match of result.matchAll(RE_EXPORT_ALL_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) specsToResolve.add(spec)
  }
  for (const match of result.matchAll(DYNAMIC_IMPORT_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) specsToResolve.add(spec)
  }
  for (const match of result.matchAll(SIDE_EFFECT_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) specsToResolve.add(spec)
  }
  if (specsToResolve.size === 0) {
    return result
  }
  const resolutions = await Promise.all(
    [...specsToResolve].map(async spec => {
      const resolved = await resolvePackageExport(spec, sourceDir)
      let compiledPath = null
      let exportStarCode = null
      if (resolved.isSvelteOnly && resolved.resolvedPath) {
        compiledPath = await compileSvelteOnlyExport(resolved.resolvedPath, sourceDir)
        const compiledCode = await fs.readFile(compiledPath, 'utf-8')
        const exports = extractNamedExports(compiledCode)
        if (exports.length > 0) {
          exportStarCode = `export { ${exports.join(', ')} } from '${pathToFileURL(compiledPath).href}'`
        } else {
          exportStarCode = `export * from '${pathToFileURL(compiledPath).href}'`
        }
      }
      return { spec, resolved, compiledPath, exportStarCode }
    }),
  )
  const specToReplacement = new Map()
  for (const r of resolutions) {
    specToReplacement.set(r.spec, r)
  }
  const exportStarReplacements = []
  let exportStarCounter = 0
  result = result.replace(RE_EXPORT_ALL_RE, (_, prefix, spec, suffix) => {
    const replacement = specToReplacement.get(spec)
    if (replacement?.exportStarCode) {
      const placeholder = `__EXPORT_STAR_${exportStarCounter++}__`
      exportStarReplacements.push({ placeholder, code: replacement.exportStarCode })
      return prefix + placeholder + suffix
    }
    return `${prefix}${spec}${suffix}`
  })
  result = result.replace(SIDE_EFFECT_RE, (_, prefix, spec, suffix) => {
    const replacement = specToReplacement.get(spec)
    if (replacement?.resolved.isSvelteOnly && replacement.resolved.resolvedPath) {
      return ''
    }
    return `${prefix}${spec}${suffix}`
  })
  result = result.replace(STATIC_IMPORT_RE, (_, prefix, spec, suffix) => {
    const replacement = specToReplacement.get(spec)
    if (replacement?.resolved.isSvelteOnly && replacement.compiledPath) {
      return `${prefix}${pathToFileURL(replacement.compiledPath).href}${suffix}`
    }
    return `${prefix}${spec}${suffix}`
  })
  result = result.replace(DYNAMIC_IMPORT_RE, (_, prefix, spec, suffix) => {
    const replacement = specToReplacement.get(spec)
    if (replacement?.resolved.isSvelteOnly && replacement.compiledPath) {
      return `${prefix}${pathToFileURL(replacement.compiledPath).href}${suffix}`
    }
    return `${prefix}${spec}${suffix}`
  })
  result = result.replace(RE_EXPORT_NAMED_RE, (_, prefix, spec, suffix) => {
    const replacement = specToReplacement.get(spec)
    if (replacement?.resolved.isSvelteOnly && replacement.compiledPath) {
      return `${prefix}${pathToFileURL(replacement.compiledPath).href}${suffix}`
    }
    return `${prefix}${spec}${suffix}`
  })
  for (const { placeholder, code } of exportStarReplacements) {
    result = result.replace(placeholder, code)
  }
  return result
}
export { writeTempFile }
