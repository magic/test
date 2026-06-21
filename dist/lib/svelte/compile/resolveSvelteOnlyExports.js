import path from 'node:path'
import { pathToFileURL } from 'node:url'
import crypto from 'node:crypto'
import fs from '@magic/fs'
import { getSvelteCompiler } from '../compiler-cache.js'
import { cacheManager } from './cache.js'
import { processImports } from './processImports.js'
import { transformForNode } from './transformForNode.js'
import { resolvePackageExport } from './resolvePackageExport.js'
import { cache as compileCache } from './cache.js'
import { CWD, CACHE_DIR } from '../../../constants.js'
import { SVELTE_RUNE_REGEX } from '../constants.js'
import { parseFile, extractExports, extractImports } from './astParse.js'
import { writeQueue } from './writeQueue.js'
const pendingWrites = new Map()
// Check if file needs writing (skip if content unchanged)
const shouldWriteFile = async (filePath, newContent) => {
  try {
    const stats = await fs.stat(filePath)
    const newSize = Buffer.byteLength(newContent, 'utf-8')
    if (stats.size !== newSize) {
      return true
    }
    const existing = await fs.readFile(filePath, 'utf-8')
    return existing !== newContent
  } catch {
    return true // File doesn't exist, need to write
  }
}
const resolveRelativeToUrl = async (relativePath, baseDir) => {
  const absolutePath = path.resolve(baseDir, relativePath)
  const extensions = ['', '.ts', '.js', '.mjs']
  for (const ext of extensions) {
    const withExt = absolutePath + ext
    if (await fs.exists(withExt)) {
      return pathToFileURL(withExt).href
    }
  }
  return undefined
}
export const writeTempFile = async (filePath, code) => {
  let tempFile
  if (filePath.includes('node_modules')) {
    const relFromNodeModules = filePath.split('node_modules/').pop() || ''
    tempFile = path.join(CWD, CACHE_DIR, 'node_modules_processed', relFromNodeModules)
  } else {
    const relPath = path.relative(CWD, filePath)
    tempFile = path.join(CWD, CACHE_DIR, relPath + '.mjs')
  }
  // Check for existing pending write first
  const existing = pendingWrites.get(tempFile)
  if (existing) {
    await existing
    return tempFile
  }
  // Create promise synchronously before any await to prevent race condition
  const promise = (async () => {
    try {
      // Skip write if content unchanged
      if (!(await shouldWriteFile(tempFile, code))) {
        return tempFile
      }
      await writeQueue.write(tempFile, code)
    } finally {
      pendingWrites.delete(tempFile)
    }
    return tempFile
  })()
  // Set in map immediately (before await) to catch concurrent callers
  pendingWrites.set(tempFile, promise)
  return promise
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
      // Use cacheManager for deduplication and caching
      const { tmpFile } = await cacheManager.getOrCompile(sveltePath, async () => {
        // Import compileSvelteWithWrite lazily to avoid circular deps
        const { compileSvelteWithWrite } = await import('./compileSvelteWithWrite.js')
        return compileSvelteWithWrite(sveltePath)
      })
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
  const replacements = []
  const fileInfo = await parseFile(code, jsFilePath)
  const exports = extractExports(fileInfo)
  const imports = extractImports(fileInfo)
  let jsDir = path.dirname(jsFilePath)
  if (jsFilePath.includes('node_modules_processed')) {
    const parts = jsFilePath.split('node_modules_processed/')
    if (parts.length === 2 && parts[1]) {
      const relFromProcessed = parts[1]
      jsDir = path.join(CWD, 'node_modules', relFromProcessed)
      jsDir = path.dirname(jsDir)
    }
  }
  const exportsByOriginalText = new Map()
  for (const exp of exports) {
    const key = exp.originalText || ''
    const group = exportsByOriginalText.get(key) || []
    group.push(exp)
    exportsByOriginalText.set(key, group)
  }
  for (const exps of exportsByOriginalText.values()) {
    if (exps.length === 0) {
      continue
    }
    const firstExp = exps[0]
    if (firstExp.isBatch && firstExp.source?.endsWith('.svelte')) {
      const absoluteSveltePath = path.resolve(jsDir, firstExp.source)
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('compile timeout for ' + absoluteSveltePath.split('/').pop())),
            30000,
          ),
        )
        const result = await Promise.race([
          compileSvelteOnlyExport(absoluteSveltePath, jsDir, exportNames),
          timeoutPromise,
        ])
        const compiledUrl = pathToFileURL(result).href
        const svelteDefaultName = path.basename(absoluteSveltePath, '.svelte')
        replacements.push({
          original: firstExp.originalText || `export * from '${firstExp.source}'`,
          replacement: `export { ${svelteDefaultName} } from '${compiledUrl}'`,
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
    } else if (firstExp.isBatch && firstExp.source?.endsWith('.js')) {
      const absolutePath = path.resolve(jsDir, firstExp.source)
      if (await fs.exists(absolutePath)) {
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
        replacements.push({
          original: firstExp.originalText || `export * from '${firstExp.source}'`,
          replacement: `export * from '${tempUrl}'`,
        })
      }
    } else if (firstExp.source?.endsWith('.svelte')) {
      const absoluteSveltePath = path.resolve(jsDir, firstExp.source)
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('compile timeout for ' + absoluteSveltePath.split('/').pop())),
            30000,
          ),
        )
        const result = await Promise.race([
          compileSvelteOnlyExport(absoluteSveltePath, jsDir, exportNames),
          timeoutPromise,
        ])
        const compiledUrl = pathToFileURL(result).href
        const specifiers = exps.map(exp => {
          const exportName = exp.alias || exp.name
          const isDefault = exp.name === 'default'
          return isDefault ? `default as ${exportName}` : exportName
        })
        const hasNamespaceReexport = exps.some(exp => exp.name === '*' && exp.alias)
        if (hasNamespaceReexport) {
          const namespaceExport = exps.find(exp => exp.name === '*' && exp.alias)
          replacements.push({
            original:
              firstExp.originalText ||
              `export * as ${namespaceExport.alias} from '${firstExp.source}'`,
            replacement: `export * as ${namespaceExport.alias} from '${compiledUrl}'`,
          })
        } else {
          replacements.push({
            original:
              firstExp.originalText ||
              `export { ${exps.map(e => e.name).join(', ')} } from '${firstExp.source}'`,
            replacement: `export { ${specifiers.join(', ')} } from '${compiledUrl}'`,
          })
        }
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
    } else if (firstExp.source?.endsWith('.js')) {
      const absolutePath = path.resolve(jsDir, firstExp.source)
      if (await fs.exists(absolutePath)) {
        const reexportContent = await fs.readFile(absolutePath, 'utf-8')
        let processedReexport
        let tempFile
        let tempUrl
        if (SVELTE_RUNE_REGEX.test(reexportContent)) {
          try {
            const { compileModule } = await getSvelteCompiler()
            const result = compileModule(reexportContent, { filename: absolutePath })
            const jsCodeString = String(result.js.code)
            const code = await processImports(jsCodeString, absolutePath)
            const transformedCode = transformForNode(code, absolutePath)
            tempFile = await writeTempFile(absolutePath, transformedCode)
            tempUrl = pathToFileURL(tempFile).href
            processedReexport = transformedCode
          } catch {
            // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
            // Skip processing and use original content
            processedReexport = reexportContent
            tempFile = await writeTempFile(absolutePath, processedReexport)
            tempUrl = pathToFileURL(tempFile).href
          }
        } else {
          processedReexport = await handleJsWithSvelteReexports(
            reexportContent,
            absolutePath,
            path.dirname(absolutePath),
            visited,
            exportNames,
          )
          tempFile = await writeTempFile(absolutePath, processedReexport)
          tempUrl = pathToFileURL(tempFile).href
        }
        const specifiers = exps.map(exp => {
          const exportName = exp.alias || exp.name
          const isDefault = exp.name === 'default'
          return isDefault ? `default as ${exportName}` : exportName
        })
        const hasNamespaceReexport = exps.some(exp => exp.name === '*' && exp.alias)
        if (hasNamespaceReexport) {
          const namespaceExport = exps.find(exp => exp.name === '*' && exp.alias)
          replacements.push({
            original:
              firstExp.originalText ||
              `export * as ${namespaceExport.alias} from '${firstExp.source}'`,
            replacement: `export * as ${namespaceExport.alias} from '${tempUrl}'`,
          })
        } else {
          replacements.push({
            original:
              firstExp.originalText ||
              `export { ${exps.map(e => e.name).join(', ')} } from '${firstExp.source}'`,
            replacement: `export { ${specifiers.join(', ')} } from '${tempUrl}'`,
          })
        }
      }
    } else if (firstExp.source?.startsWith('.')) {
      const absoluteUrl = await resolveRelativeToUrl(firstExp.source, jsDir)
      if (absoluteUrl) {
        const specifiers = exps.map(exp => {
          const exportName = exp.alias || exp.name
          const isDefault = exp.name === 'default'
          return isDefault ? 'default as ' + exportName : exportName
        })
        replacements.push({
          original:
            firstExp.originalText ||
            'export { ' + exps.map(e => e.name).join(', ') + " } from '" + firstExp.source + "'",
          replacement: 'export { ' + specifiers.join(', ') + " } from '" + absoluteUrl + "'",
        })
      }
    }
  }
  for (const imp of imports) {
    if (imp.type === 'static' || imp.type === 'namespace') {
      const importPath = imp.source
      if (importPath.startsWith('.')) {
        const absolutePath = path.resolve(jsDir, importPath)
        const absoluteUrl = await resolveRelativeToUrl(importPath, jsDir)
        if (absoluteUrl && (absolutePath.endsWith('.js') || absolutePath.endsWith('.mjs'))) {
          const depContent = await fs.readFile(absolutePath, 'utf-8')
          let contentToWrite = depContent
          if (SVELTE_RUNE_REGEX.test(depContent)) {
            try {
              const { compileModule } = await getSvelteCompiler()
              const result = compileModule(depContent, { filename: absolutePath })
              const jsCodeString = String(result.js.code)
              const code = await processImports(jsCodeString, absolutePath)
              contentToWrite = transformForNode(code, absolutePath)
            } catch {
              // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
              // Skip processing and use original content
            }
          }
          const tempFile = await writeTempFile(absolutePath, contentToWrite)
          const tempUrl = pathToFileURL(tempFile).href
          replacements.push({
            original:
              imp.originalText || `import { ${imp.specifiers.join(', ')} } from '${importPath}'`,
            replacement: `import { ${imp.specifiers.join(', ')} } from '${tempUrl}'`,
          })
        } else if (absoluteUrl) {
          replacements.push({
            original:
              imp.originalText || `import { ${imp.specifiers.join(', ')} } from '${importPath}'`,
            replacement: `import { ${imp.specifiers.join(', ')} } from '${absoluteUrl}'`,
          })
        }
      }
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
  const fileInfo = await parseFile(content, filePath)
  const exports = extractExports(fileInfo)
  const result = []
  for (const exp of exports) {
    if (exp.isBatch) {
      if (exp.source?.endsWith('.svelte')) {
        const svelteDefaultName = path.basename(exp.source, '.svelte')
        result.push({
          name: svelteDefaultName,
          source: null,
          isType: false,
          isDefault: false,
          isBatch: false,
        })
      } else if (exp.source) {
        const resolved = path.resolve(path.dirname(filePath), exp.source)
        const nested = await extractNamedExportsRecursive(resolved, visited)
        result.push(...nested)
      }
    } else if (exp.source?.endsWith('.svelte')) {
      result.push({
        name: exp.alias || exp.name,
        source: null,
        isType: exp.isType,
        isDefault: exp.isDefault,
        isBatch: false,
      })
    } else if (exp.source) {
      const resolved = path.resolve(path.dirname(filePath), exp.source)
      const nested = await extractNamedExportsRecursive(resolved, visited)
      result.push(...nested)
    } else if (!exp.source) {
      result.push(exp)
    }
  }
  return result
}
const findSvelteFileForExport = async (filePath, exportName, visited) => {
  if (visited?.has(filePath)) {
    return null
  }
  visited ??= new Set()
  visited.add(filePath)
  const content = await fs.readFile(filePath, 'utf-8')
  const fileInfo = await parseFile(content, filePath)
  const exports = extractExports(fileInfo)
  const fileDir = path.dirname(filePath)
  for (const exp of exports) {
    if (exp.isBatch && exp.source?.endsWith('.svelte')) {
      const resolved = path.resolve(fileDir, exp.source)
      const svelteExportName = path.basename(resolved, '.svelte')
      if (svelteExportName === exportName) {
        return resolved
      }
    } else if (exp.source?.endsWith('.svelte')) {
      const resolved = path.resolve(fileDir, exp.source)
      const nameToMatch = exp.alias || exp.name
      if (nameToMatch === exportName) {
        return resolved
      }
    } else if (exp.source && !exp.source.endsWith('.svelte')) {
      const resolved = path.resolve(fileDir, exp.source)
      if (exp.isBatch) {
        const found = await findSvelteFileForExport(resolved, exportName, visited)
        if (found) {
          return found
        }
      } else {
        const found = await findSvelteFileForExport(resolved, exportName, visited)
        if (found) {
          return found
        }
      }
    }
  }
  return null
}
const isSkipPattern = spec => {
  return (
    spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('$') || spec.startsWith('/')
  )
}
const extractNamedImportsFromCode = async (code, spec) => {
  const fi = await parseFile(code, '<inline>')
  const imports = extractImports(fi)
  return imports
    .filter(imp => imp.source === spec && (imp.type === 'static' || imp.type === 'namespace'))
    .flatMap(imp =>
      imp.specifiers.map(s => {
        const parts = s.split(' as ')
        return parts.length > 1 ? parts[1].trim() : s.trim()
      }),
    )
}
export const resolveSvelteOnlyExports = async (code, sourceDir) => {
  let result = code
  const fileInfo = await parseFile(code, '<inline>')
  const imports = extractImports(fileInfo)
  const exports = extractExports(fileInfo)
  const specsToResolve = new Set()
  for (const imp of imports) {
    if (imp.source && !isSkipPattern(imp.source)) {
      specsToResolve.add(imp.source)
    }
  }
  for (const exp of exports) {
    if (exp.source && !isSkipPattern(exp.source)) {
      specsToResolve.add(exp.source)
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
        const namedImports = await extractNamedImportsFromCode(code, spec)
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
          const exportInfos = await extractNamedExportsRecursive(resolved.resolvedPath)
          if (exportInfos.length > 0) {
            const names = exportInfos.map(e => e.alias || e.name)
            exportStarCode = `export { ${names.join(', ')} } from '${pathToFileURL(compiledPath).href}'`
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
  for (const imp of imports) {
    if (imp.type === 'dynamic' && imp.source) {
      const replacement = specToReplacement.get(imp.source)
      if (replacement?.resolved.isSvelteOnly && replacement.compiledPath) {
        result = result.replace(
          imp.originalText || `import('${imp.source}')`,
          `import('${pathToFileURL(replacement.compiledPath).href}')`,
        )
      }
    }
  }
  for (const exp of exports) {
    if (exp.source && exp.isBatch && !exp.source.endsWith('.svelte')) {
      const replacement = specToReplacement.get(exp.source)
      if (replacement?.exportStarCode) {
        const placeholder = `__EXPORT_STAR_${exportStarCounter++}__`
        exportStarReplacements.push({ placeholder, code: replacement.exportStarCode })
        result = result.replace(exp.originalText || `export * from '${exp.source}'`, placeholder)
      }
    }
  }
  for (const imp of imports) {
    if (imp.type === 'sideEffect' && imp.source) {
      const replacement = specToReplacement.get(imp.source)
      if (replacement?.resolved.isSvelteOnly && replacement.resolved.resolvedPath) {
        result = result.replace(imp.originalText || `import '${imp.source}'`, '')
      }
    }
  }
  for (const imp of imports) {
    if ((imp.type === 'static' || imp.type === 'namespace') && imp.source) {
      const replacement = specToReplacement.get(imp.source)
      if (replacement?.resolved.isSvelteOnly && replacement.compiledPath) {
        result = result.replace(
          imp.originalText || `import { ${imp.specifiers.join(', ')} } from '${imp.source}'`,
          `import { ${imp.specifiers.join(', ')} } from '${pathToFileURL(replacement.compiledPath).href}'`,
        )
      }
    }
  }
  for (const exp of exports) {
    if (exp.source && !exp.isBatch) {
      const replacement = specToReplacement.get(exp.source)
      if (replacement?.resolved.isSvelteOnly && replacement.compiledPath) {
        result = result.replace(
          exp.originalText ||
            `export { ${exp.name} as ${exp.alias || exp.name} } from '${exp.source}'`,
          `export { ${exp.alias || exp.name} } from '${pathToFileURL(replacement.compiledPath).href}'`,
        )
      }
    }
  }
  for (const { placeholder, code } of exportStarReplacements) {
    result = result.replace(placeholder, code)
  }
  return result
}
