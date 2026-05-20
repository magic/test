import path from 'node:path'
import { pathToFileURL } from 'node:url'
import crypto from 'node:crypto'
import fs from '@magic/fs'
// import is from '@magic/types'
import { compileSvelteWithWrite } from './compileSvelteWithWrite.js'
import { resolvePackageExport } from './resolvePackageExport.js'
import { cache as compileCache } from './cache.js'
import { CWD } from '../../../constants.js'
const STATIC_IMPORT_RE =
  /(import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))?\s+from\s+['"`])([^'"`\s]+)(['"`])/g
const RE_EXPORT_NAMED_RE = /(export\s+\{[^}]+\}\s+from\s+['"`])([^'"`\s]+)(['"`])/g
const RE_EXPORT_ALL_RE = /(export\s+\*\s+from\s+['"`])([^'"`\s]+)(['"`])/g
const DYNAMIC_IMPORT_RE = /(import\s*\(['"`])([^'"`\s]+)(['"`]\s*\))/g
const SIDE_EFFECT_RE = /(?:^|\n)(import\s+['"`])([^'"`\s]+)(['"])/g
// const TYPE_IMPORT_RE = /import\s+type\s+.*?from\s+['"`][^'"`\s]+['"`]/g
const pendingWrites = new Map()
const writeTempFile = async (filePath, code) => {
  // For files in node_modules, preserve the relative path structure
  // to ensure relative imports between them work correctly
  let tempFile
  if (filePath.includes('node_modules')) {
    const relFromNodeModules = filePath.split('node_modules/').pop() || ''
    tempFile = path.join(CWD, 'test/.tmp', 'node_modules_processed', relFromNodeModules)
  } else {
    const relPath = path.relative(CWD, filePath)
    tempFile = path.join(CWD, 'test/.tmp', relPath + '.mjs')
  }
  await ensureDirExists(tempFile)
  let pending = pendingWrites.get(tempFile)
  if (!pending) {
    pending = (async () => {
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
const JS_REEXPORT_RE_OR_ALL = /(export\s+\*\s+from\s+['"])([^'"]+\.js)(['"])/g
const ensureDirExists = async filePath => {
  const dir = path.dirname(filePath)
  await fs.mkdirp(dir)
}
const tmpFileCache = new Map()
const compiling = new Map()
export const compileSvelteOnlyExport = async (sveltePath, sourceDir, exportNames) => {
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
  const cachedTmpFile = tmpFileCache.get(sveltePath)
  if (cachedTmpFile && compileCache.get(cacheKey)) {
    return cachedTmpFile
  }
  const existing = compiling.get(cacheKey)
  if (existing) {
    return existing
  }
  const promise = (async () => {
    try {
      if (sveltePath.endsWith('.js') || sveltePath.endsWith('.mjs')) {
        const processedCode = await handleJsWithSvelteReexports(
          content,
          sveltePath,
          sourceDir,
          undefined,
          exportNames,
        )
        const tempFile = await writeTempFile(sveltePath, processedCode)
        compileCache.set(cacheKey, { js: content, css: null, mtime: Date.now() })
        tmpFileCache.set(sveltePath, tempFile)
        return tempFile
      }
      const { tmpFile } = await compileSvelteWithWrite(sveltePath)
      compileCache.set(cacheKey, { js: content, css: null, mtime: Date.now() })
      tmpFileCache.set(sveltePath, tmpFile)
      return tmpFile
    } finally {
      compiling.delete(cacheKey)
    }
  })()
  compiling.set(cacheKey, promise)
  return promise
}
const handleJsWithSvelteReexports = async (code, jsFilePath, _sourceDir, visited, exportNames) => {
  visited ??= new Set()
  if (visited.has(jsFilePath)) {
    return code
  }
  visited.add(jsFilePath)
  const jsDir = path.dirname(jsFilePath)
  const replacements = []
  const matches = [...code.matchAll(JS_SVELTE_REEXPORT_RE)]
  const svelteCompilePromises = []
  for (const match of matches) {
    const sveltePath = match[2]
    if (!sveltePath) {
      continue
    }
    const absoluteSveltePath = path.resolve(jsDir, sveltePath)
    svelteCompilePromises.push({ match, absoluteSveltePath })
  }
  const svelteResults = []
  for (const { match, absoluteSveltePath } of svelteCompilePromises) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('compile timeout for ' + absoluteSveltePath.split('/').pop())),
          8000,
        ),
      )
      const result = await Promise.race([
        compileSvelteOnlyExport(absoluteSveltePath, jsDir, exportNames),
        timeoutPromise,
      ])
      const compiledUrl = pathToFileURL(result).href
      svelteResults.push({
        original: match[0],
        replacement: `${match[1]}${compiledUrl}${match[3]}`,
      })
    } catch (e) {
      const err = e
      console.error(
        '[handleJs] COMPILE ERROR for',
        absoluteSveltePath.split('/').pop(),
        ':',
        err.message,
      )
      throw e
    }
  }
  replacements.push(...svelteResults)
  const jsReexports = [...code.matchAll(JS_REEXPORT_RE_OR_ALL)]
  const jsReexportResults = await Promise.all(
    jsReexports.map(async match => {
      const prefix = match[1]
      const reexportPath = match[2]
      const suffix = match[3]
      if (!reexportPath) {
        return null
      }
      const absolutePath = path.resolve(jsDir, reexportPath)
      if (
        (await fs.exists(absolutePath)) &&
        (absolutePath.endsWith('.js') || absolutePath.endsWith('.mjs'))
      ) {
        const reexportContent = await fs.readFile(absolutePath, 'utf-8')
        const processedReexport = await handleJsWithSvelteReexports(
          reexportContent,
          absolutePath,
          path.dirname(absolutePath),
          visited,
          exportNames,
        )
        const tempFile = await writeTempFile(absolutePath, processedReexport)
        const tempUrl = pathToFileURL(tempFile).href
        return {
          original: match[0],
          replacement: `${prefix}${tempUrl}${suffix}`,
        }
      }
      return null
    }),
  )
  const jsReexportResultsClean = jsReexportResults.filter(r => r !== null)
  replacements.push(...jsReexportResultsClean)
  const namedJsReexports = [...code.matchAll(RE_EXPORT_NAMED_RE)]
  const namedJsReexportResults = await Promise.all(
    namedJsReexports.map(async match => {
      const prefix = match[1]
      const reexportPath = match[2]
      const suffix = match[3]
      if (!reexportPath) {
        return null
      }
      const absolutePath = path.resolve(jsDir, reexportPath)
      if (
        (await fs.exists(absolutePath)) &&
        (absolutePath.endsWith('.js') || absolutePath.endsWith('.mjs'))
      ) {
        const reexportContent = await fs.readFile(absolutePath, 'utf-8')
        const processedReexport = await handleJsWithSvelteReexports(
          reexportContent,
          absolutePath,
          path.dirname(absolutePath),
          visited,
          exportNames,
        )
        const tempFile = await writeTempFile(absolutePath, processedReexport)
        const tempUrl = pathToFileURL(tempFile).href
        return {
          original: match[0],
          replacement: `${prefix}${tempUrl}${suffix}`,
        }
      }
      return null
    }),
  )
  const namedJsReexportResultsClean = namedJsReexportResults.filter(r => r !== null)
  replacements.push(...namedJsReexportResultsClean)
  // Also process and copy any relative JS imports that aren't re-exports
  const relativeImports = [
    ...code.matchAll(
      /(?:^|\n)(import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))?\s+from\s+['"])(\.[^'"]+)(['"])/g,
    ),
  ]
  for (const match of relativeImports) {
    const fullMatch = match[0]
    const importPath = match[2]
    if (!importPath) {
      continue
    }
    const absolutePath = path.resolve(jsDir, importPath)
    if (
      (await fs.exists(absolutePath)) &&
      (absolutePath.endsWith('.js') || absolutePath.endsWith('.mjs'))
    ) {
      const depContent = await fs.readFile(absolutePath, 'utf-8')
      await writeTempFile(absolutePath, depContent)
      replacements.push({
        original: fullMatch,
        replacement: fullMatch.replace(importPath, `file://${absolutePath}`),
      })
    }
  }
  let result = code
  for (const { original, replacement } of replacements) {
    result = result.replace(original, replacement)
  }
  return result
}
const extractNamedExportsRecursive = async (filePath, visited) => {
  if (visited?.has(filePath)) {
    return []
  }
  visited ??= new Set()
  visited.add(filePath)
  const content = await fs.readFile(filePath, 'utf-8')
  const exports = []
  // Pattern 1: export { X } from './y.ts'
  // Pattern 2: export { X } from './y.svelte' (extracts alias, doesn't recurse)
  for (const match of content.matchAll(RE_EXPORT_NAMED_RE)) {
    const reexportPath = match[2]
    if (!reexportPath) {
      continue
    }
    const resolved = path.resolve(path.dirname(filePath), reexportPath)
    if (resolved.endsWith('.svelte')) {
      // Extract alias from "export { default as FixedButton } from './FixedButton.svelte'"
      const destructureMatch = /\{\s*([^}]+)\s*\}/.exec(match[0])
      if (destructureMatch?.[1]) {
        const names = destructureMatch[1]
          .split(',')
          .map(n => {
            const trimmed = n.trim()
            if (!trimmed) {
              return ''
            }
            const asParts = trimmed.split(' as ')
            return asParts.length > 1 && asParts[1] ? asParts[1] : trimmed
          })
          .filter(Boolean)
        exports.push(...names)
      }
    } else {
      const nested = await extractNamedExportsRecursive(resolved, visited)
      exports.push(...nested)
    }
  }
  // Pattern 3: export * from './y.ts'
  // Pattern 4: export * from './y.svelte' (uses file stem as name)
  for (const match of content.matchAll(RE_EXPORT_ALL_RE)) {
    const reexportPath = match[2]
    if (!reexportPath) {
      continue
    }
    const resolved = path.resolve(path.dirname(filePath), reexportPath)
    if (resolved.endsWith('.svelte')) {
      const svelteDefaultName = path.basename(resolved, '.svelte')
      exports.push(svelteDefaultName)
    } else {
      const nested = await extractNamedExportsRecursive(resolved, visited)
      exports.push(...nested)
    }
  }
  // Pattern 5: export * as X from './y.ts'
  const namespaceReexportRe = /(export\s+\*\s+as\s+(\w+)\s+from\s+['"`])([^'"`\s]+)(['"`])/g
  for (const match of content.matchAll(namespaceReexportRe)) {
    const alias = match[2]
    if (alias) {
      exports.push(alias)
    }
  }
  // Pattern 6: export * as X from './y.svelte'
  const svelteNamespaceReexportRe =
    /(export\s+\*\s+as\s+(\w+)\s+from\s+['"])([^'"]*\.svelte)(['"])/g
  for (const match of content.matchAll(svelteNamespaceReexportRe)) {
    const alias = match[2]
    if (alias) {
      exports.push(alias)
    }
  }
  // Pattern 7: export { default as X } from './y.svelte' (multiple matches via matchAll)
  for (const match of content.matchAll(JS_SVELTE_REEXPORT_RE)) {
    const match1 = match[1]
    if (match1) {
      const aliasInMatch = /default\s+as\s+(\w+)/.exec(match1)
      if (aliasInMatch?.[1]) {
        exports.push(aliasInMatch[1])
      }
    }
  }
  // Pattern 8: export default from './y.svelte' (no braces, valid ESM)
  const defaultNoBracesRe = /(?:^|\n)export\s+default\s+from\s+['"`][^'"`\s]+\.svelte['"`]/g
  for (const match of content.matchAll(defaultNoBracesRe)) {
    const pathMatch = /from\s+['"`][^'"`\s]+\.svelte['"`]/.exec(match[0])
    if (pathMatch) {
      const sveltePath = pathMatch[0].replace(/from\s+['"`]|['"`]/g, '')
      if (sveltePath.endsWith('.svelte')) {
        const svelteDefaultName = path.basename(sveltePath, '.svelte')
        exports.push(svelteDefaultName)
      }
    }
  }
  // ... existing destructureMatch, namedMatch, defaultMatch logic ...
  const defaultMatch = /export\s+default\s+(?:function\s+(\w+)|class\s+(\w+)|const\s+(\w+))/g
  let match = defaultMatch.exec(content)
  while (match !== null) {
    exports.push(match[1] || match[2] || match[3] || '')
    match = defaultMatch.exec(content)
  }
  const namedMatch = /export\s+(?:const|let|var|function|class)\s+(\w+)/g
  match = namedMatch.exec(content)
  while (match !== null) {
    if (match[1]) {
      exports.push(match[1])
    }
    match = namedMatch.exec(content)
  }
  const destructureMatch = /export\s+\{\s*([^}]+)\s*\}/g
  match = destructureMatch.exec(content)
  while (match !== null) {
    const match1 = match[1]
    if (match1) {
      const names = match1.split(',').map(n => {
        const trimmed = n.trim()
        const asParts = trimmed.split(' as ')
        return asParts[0] || trimmed
      })
      exports.push(...names)
    }
    match = destructureMatch.exec(content)
  }
  return [...new Set(exports)]
}
const findSvelteFileForExport = async (filePath, exportName, visited) => {
  if (visited?.has(filePath)) {
    return null
  }
  visited ??= new Set()
  visited.add(filePath)
  const content = await fs.readFile(filePath, 'utf-8')
  const fileDir = path.dirname(filePath)
  // Pattern: export { X } from './y.svelte'
  // Pattern: export { default as X } from './y.svelte'
  for (const match of content.matchAll(RE_EXPORT_NAMED_RE)) {
    const reexportPath = match[2]
    if (!reexportPath) {
      continue
    }
    if (!reexportPath.endsWith('.svelte')) {
      continue
    }
    const resolved = path.resolve(fileDir, reexportPath)
    const destructureMatch = /\{\s*([^}]+)\s*\}/.exec(match[0])
    if (destructureMatch?.[1]) {
      const names = destructureMatch[1]
        .split(',')
        .map(n => {
          const trimmed = n.trim()
          if (!trimmed) {
            return ''
          }
          const asParts = trimmed.split(' as ')
          return asParts.length > 1 && asParts[1] ? asParts[1] : trimmed
        })
        .filter(Boolean)
      if (names.includes(exportName)) {
        return resolved
      }
    }
  }
  // Pattern: export * from './y.svelte' - uses file stem as export name
  for (const match of content.matchAll(RE_EXPORT_ALL_RE)) {
    const reexportPath = match[2]
    if (!reexportPath) {
      continue
    }
    if (!reexportPath.endsWith('.svelte')) {
      continue
    }
    const resolved = path.resolve(fileDir, reexportPath)
    const svelteExportName = path.basename(resolved, '.svelte')
    if (svelteExportName === exportName) {
      return resolved
    }
  }
  // Pattern: export * as X from './y.ts' or './y.svelte'
  const namespaceReexportRe = /(export\s+\*\s+as\s+(\w+)\s+from\s+['"`])([^'"`\s]+)(['"`])/g
  for (const match of content.matchAll(namespaceReexportRe)) {
    const alias = match[2]
    const reexportPath = match[3]
    if (alias === exportName && reexportPath) {
      const resolved = path.resolve(fileDir, reexportPath)
      if (resolved.endsWith('.svelte')) {
        return resolved
      }
      return findSvelteFileForExport(resolved, exportName, visited)
    }
  }
  // Pattern: export * as X from './y.svelte'
  const svelteNamespaceReexportRe =
    /(export\s+\*\s+as\s+(\w+)\s+from\s+['"])([^'"]*\.svelte)(['"])/g
  for (const match of content.matchAll(svelteNamespaceReexportRe)) {
    const alias = match[2]
    const reexportPath = match[3]
    if (alias === exportName && reexportPath) {
      const resolved = path.resolve(fileDir, reexportPath)
      return resolved
    }
  }
  // Pattern: export default from './y.svelte' (no braces)
  const defaultNoBracesRe = /(?:^|\n)export\s+default\s+from\s+['"`][^'"`\s]+\.svelte['"`]/g
  for (const match of content.matchAll(defaultNoBracesRe)) {
    const pathMatch = /from\s+['"`][^'"`\s]+\.svelte['"`]/.exec(match[0])
    if (pathMatch) {
      const sveltePath = pathMatch[0].replace(/from\s+['"`]|['"`]/g, '')
      if (sveltePath.endsWith('.svelte')) {
        const resolved = path.resolve(fileDir, sveltePath)
        const svelteExportName = path.basename(resolved, '.svelte')
        if (svelteExportName === exportName) {
          return resolved
        }
      }
    }
  }
  // If we have export * from './y.ts', trace into that file
  for (const match of content.matchAll(RE_EXPORT_ALL_RE)) {
    const reexportPath = match[2]
    if (!reexportPath) {
      continue
    }
    if (reexportPath.endsWith('.svelte')) {
      continue
    }
    const resolved = path.resolve(fileDir, reexportPath)
    const found = await findSvelteFileForExport(resolved, exportName, visited)
    if (found) {
      return found
    }
  }
  // If we have export { X } from './y.ts', trace into that file
  for (const match of content.matchAll(RE_EXPORT_NAMED_RE)) {
    const reexportPath = match[2]
    if (!reexportPath) {
      continue
    }
    if (reexportPath.endsWith('.svelte')) {
      continue
    }
    const resolved = path.resolve(fileDir, reexportPath)
    const found = await findSvelteFileForExport(resolved, exportName, visited)
    if (found) {
      return found
    }
  }
  return null
}
const isSkipPattern = spec => {
  return (
    spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('$') || spec.startsWith('/')
  )
}
const extractNamedImportsFromCode = (code, spec) => {
  const namedImports = []
  const importRe = new RegExp(
    `import\\s+\\{([^}]+)\\}\\s+from\\s+['"\`]${spec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`,
    'g',
  )
  for (const match of code.matchAll(importRe)) {
    if (match[1]) {
      const names = match[1].split(',').map(n => {
        const trimmed = n.trim()
        const asParts = trimmed.split(' as ')
        return asParts.length > 1 && asParts[1] ? asParts[1] : trimmed
      })
      namedImports.push(...names.filter(Boolean))
    }
  }
  return namedImports
}
export const resolveSvelteOnlyExports = async (code, sourceDir) => {
  let result = code
  const specsToResolve = new Set()
  for (const match of result.matchAll(STATIC_IMPORT_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) {
      specsToResolve.add(spec)
    }
  }
  for (const match of result.matchAll(RE_EXPORT_NAMED_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) {
      specsToResolve.add(spec)
    }
  }
  for (const match of result.matchAll(RE_EXPORT_ALL_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) {
      specsToResolve.add(spec)
    }
  }
  for (const match of result.matchAll(DYNAMIC_IMPORT_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) {
      specsToResolve.add(spec)
    }
  }
  for (const match of result.matchAll(SIDE_EFFECT_RE)) {
    const spec = match[2]
    if (spec && !isSkipPattern(spec)) {
      specsToResolve.add(spec)
    }
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
        const namedImports = extractNamedImportsFromCode(code, spec)
        if (namedImports.length > 0) {
          const svelteFiles = await Promise.all(
            namedImports.map(async name => {
              const sveltePath = await findSvelteFileForExport(resolved.resolvedPath, name)
              return sveltePath ? { name, sveltePath } : null
            }),
          )
          const validSvelteFiles = svelteFiles.filter(f => f !== null)
          if (validSvelteFiles.length > 0) {
            const compiledSvelteFiles = await Promise.all(
              validSvelteFiles.map(async ({ name, sveltePath }) => {
                const compiled = await compileSvelteOnlyExport(sveltePath, sourceDir)
                return { name, compiledPath: compiled }
              }),
            )
            const barrelContent = compiledSvelteFiles
              .map(({ name, compiledPath: cp }) => {
                const url = pathToFileURL(cp).href
                return `export { ${name} } from '${url}'`
              })
              .join('\n')
            const barrelPath = resolved.resolvedPath.replace(/\.js$/, '.svelte-only-barrel.js')
            const barrelTmpFile = await writeTempFile(barrelPath, barrelContent)
            compiledPath = barrelTmpFile
            exportStarCode = `export { ${compiledSvelteFiles.map(f => f.name).join(', ')} } from '${pathToFileURL(barrelTmpFile).href}'`
          }
        } else {
          compiledPath = await compileSvelteOnlyExport(resolved.resolvedPath, sourceDir)
          const exports = await extractNamedExportsRecursive(resolved.resolvedPath)
          if (exports.length > 0) {
            exportStarCode = `export { ${exports.join(', ')} } from '${pathToFileURL(compiledPath).href}'`
          } else {
            exportStarCode = `export * from '${pathToFileURL(compiledPath).href}'`
          }
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
