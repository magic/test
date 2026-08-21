import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import { AsyncLocalStorage } from 'node:async_hooks'

import fs from '@magic/fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import { getSvelteCompiler } from '../compiler-cache.ts'
import { cacheManager } from '../../caches/cache.ts'
import { processImports } from './processImports.ts'
import { compileSvelteWithWrite } from './compileSvelteWithWrite.ts'
import { transformForNode } from './transformForNode.ts'
import { resolvePackageExport, type PackageExportResolve } from './resolvePackageExport.ts'
import { LRUCache } from '../../caches/LRUCache.ts'
import { cache as compileCache } from '../../caches/cache.ts'
import { CWD, CACHE_DIR } from '../../../constants.ts'
import { hasSvelteRunes } from './astParse.ts'
import { parseFile, extractExports, extractImports, extractImportsSync } from './astParse.ts'
import { getTempFilePath } from './getTempFilePath.ts'
import { writeQueue } from './writeQueue.ts'
import { existsCached } from '../../caches/pathCache.ts'
import type { ExportInfo } from './types.ts'
import { isSkipPattern } from './pathUtils.ts'
import { ddl, ddlInitWatchdog, ddlHold, ddlRelease } from './ddl.ts'

ddlInitWatchdog()

const pendingWrites = new Map<string, Promise<string>>()

// Resolve $app/* imports to shim files
const shimCache = new Map<string, string | null>()

const resolveAppImport = async (importPath: string): Promise<string | null> => {
  const cached = shimCache.get(importPath)
  if (cached !== undefined) return cached

  const shimBase = path.join(__dirname, '..', 'shims', '$app')
  const shimPath = path.join(shimBase, importPath.slice(5))

  const extensions = ['.ts', '.js', '/index.ts', '/index.js']
  for (const ext of extensions) {
    const candidate = shimPath + ext
    if (await existsCached(candidate)) {
      shimCache.set(importPath, candidate)
      return candidate
    }
  }

  shimCache.set(importPath, null)
  return null
}

// Helper to resolve relative imports to file URLs
const resolveRelativeToUrl = async (
  relativePath: string,
  baseDir: string,
): Promise<string | undefined> => {
  const absolutePath = path.resolve(baseDir, relativePath)
  const extensions = ['', '.ts', '.js', '.mjs']
  for (const ext of extensions) {
    const withExt = absolutePath + ext
    if (await existsCached(withExt)) {
      try {
        const stat = await fs.stat(withExt)
        if (stat.isDirectory()) {
          const siblingFile = absolutePath + '.js'
          if (await existsCached(siblingFile)) {
            return pathToFileURL(siblingFile).href
          }
          const indexPath = withExt + '/index.js'
          if (await existsCached(indexPath)) {
            return pathToFileURL(indexPath).href
          }
          continue
        }
      } catch {
        continue
      }
      return pathToFileURL(withExt).href
    }
  }
  return undefined
}

const computeTempPath = (filePath: string): string => {
  if (filePath.includes('node_modules')) {
    const relFromNodeModules = filePath.split('node_modules/').pop() || ''
    return path.join(CWD, CACHE_DIR, 'node_modules_processed', relFromNodeModules)
  }
  const relPath = path.relative(CWD, filePath)
  return path.join(CWD, CACHE_DIR, relPath + '.mjs')
}

// Process a `.js` file reachable via re-exports. When it was already processed in this
// traversal (shared `visited` set, e.g. the same file re-exported both via
// `export * from './x.js'` and `export * as X from './x.js'`), reuse the already-written
// mirror URL instead of re-writing the raw content over the processed copy.
const processJsReexport = async (
  absolutePath: string,
  exportNames: string[] | undefined,
  visited: Set<string>,
): Promise<string> => {
  let tempFile: string
  if (visited.has(absolutePath)) {
    tempFile = computeTempPath(absolutePath)
  } else {
    const reexportContent = await fs.readFile(absolutePath, 'utf-8')
    const processedReexport = await handleJsWithSvelteReexports(
      reexportContent,
      absolutePath,
      path.dirname(absolutePath),
      visited,
      exportNames,
    )
    tempFile = await writeTempFile(absolutePath, processedReexport)
  }
  return pathToFileURL(tempFile).href
}

export const writeTempFile = async (filePath: string, code: string): Promise<string> => {
  const tempFile = computeTempPath(filePath)

  // Check for existing pending write first
  const existing = pendingWrites.get(tempFile)
  if (existing) {
    await existing
    return tempFile
  }

  // Create promise synchronously before any await to prevent race condition
  const promise = (async () => {
    try {
      await writeQueue.write(tempFile, code)
      // Flush immediately to guarantee file exists before returning.
      // Without this, batched writes may not be flushed until batch is full or timeout.
      await writeQueue.flushPath(tempFile)
    } finally {
      pendingWrites.delete(tempFile)
    }
    return tempFile
  })()

  // Set in map immediately (before await) to catch concurrent callers
  pendingWrites.set(tempFile, promise)
  return promise
}

const tmpFileCache = new LRUCache<string>(100)

const compiling = new Map<string, Promise<string>>()

// Files currently being compiled on the CALL STACK (per async context). Re-entering
// one from within its own compile (direct or transitive self-import) must not await
// its own pending promise - that self-await deadlocks the event loop. A sibling
// (concurrent, different async context) is NOT treated as a cycle: it safely awaits
// the shared pending compile via the `compiling` map.
const compileStack = new AsyncLocalStorage<{ active: Set<string> }>()

const reentryOutputPath = (p: string): string => {
  if (p.endsWith('.svelte')) {
    return path.join(CWD, getTempFilePath(p))
  }
  return computeTempPath(p)
}

export const compileSvelteOnlyExport = async (
  sveltePath: string,
  sourceDir: string,
  exportNames?: string[],
): Promise<string> => {
  const normalized = path.resolve(CWD, sveltePath)
  const store = compileStack.getStore()
  ddl(
    'compileOnly CALL ' +
      path.basename(normalized) +
      (store
        ? ' S=[' + [...store.active].map(p => p.split('/').pop()).join(',') + ']'
        : ' NOSTORE'),
  )
  if (store && store.active.has(normalized)) {
    ddl('compileOnly CYCLE-BREAK ' + path.basename(normalized))
    return reentryOutputPath(normalized)
  }
  const stack = store ?? { active: new Set<string>() }
  stack.active.add(normalized)
  return compileStack.run(stack, () =>
    compileSvelteOnlyExportImpl(sveltePath, sourceDir, exportNames),
  )
}

const compileSvelteOnlyExportImpl = async (
  sveltePath: string,
  sourceDir: string,
  exportNames?: string[],
): Promise<string> => {
  ddl('compileOnly ENTER ' + path.basename(sveltePath))
  if (!sveltePath.endsWith('.js') && !sveltePath.endsWith('.mjs')) {
    if (!(await existsCached(sveltePath))) {
      const svelteJsPath = sveltePath + '.js'
      if (await existsCached(svelteJsPath)) {
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
    ddl('compileOnly PENDING-HIT ' + path.basename(sveltePath))
    ddlHold('compileOnly:' + cacheKey, path.basename(sveltePath))
    try {
      return await existing
    } finally {
      ddlRelease('compileOnly:' + cacheKey, path.basename(sveltePath))
    }
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
      const cacheResult = await cacheManager.getOrCompile(sveltePath, () =>
        compileSvelteWithWrite(sveltePath),
      )
      // cacheResult may be disk cache which only has { js, css, mtime } without tmpFile
      // Reconstruct tmpFile path the same way compileSvelteWithWrite does
      const tmpFile = cacheResult.tmpFile ?? getTempFilePath(sveltePath)
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

const handleJsWithSvelteReexports = async (
  code: string,
  jsFilePath: string,
  _sourceDir: string,
  visited?: Set<string>,
  exportNames?: string[],
): Promise<string> => {
  visited ??= new Set()
  if (visited.has(jsFilePath)) {
    return code
  }
  visited.add(jsFilePath)

  const replacements: Array<{ original: string; replacement: string }> = []

  const fileInfo = await parseFile(code, jsFilePath)
  const exports = extractExports(fileInfo)
  const imports = extractImports(fileInfo)

  let jsDir = path.dirname(jsFilePath)
  if (jsFilePath.includes('node_modules_processed')) {
    // Handle paths like .magic-test-cache/node_modules_processed/package/path
    // by stripping the cache prefix and reconstructing the original node_modules path
    const cachePrefix = path.join(CWD, CACHE_DIR, 'node_modules_processed')
    const relFromProcessed = jsFilePath
      .replace(cachePrefix + path.sep, '')
      .replace('node_modules_processed/', '')
    jsDir = path.dirname(path.join(CWD, 'node_modules', relFromProcessed))
  }

  const exportsByOriginalText = new Map<string, typeof exports>()
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
    const firstExp = exps[0]!

    if (firstExp.isBatch && firstExp.source?.endsWith('.svelte')) {
      const absoluteSveltePath = path.resolve(jsDir, firstExp.source)
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('compile timeout for ' + absoluteSveltePath.split('/').pop())),
            30000,
          ),
        )
        const result = (await Promise.race([
          compileSvelteOnlyExport(absoluteSveltePath, jsDir, exportNames),
          timeoutPromise,
        ])) as string
        const compiledUrl = pathToFileURL(result).href
        const svelteDefaultName = path.basename(absoluteSveltePath, '.svelte')
        replacements.push({
          original: firstExp.originalText || `export * from '${firstExp.source}'`,
          replacement: `export { ${svelteDefaultName} } from '${compiledUrl}'`,
        })
      } catch (e) {
        const svelteDefaultName = path.basename(absoluteSveltePath, '.svelte')
        replacements.push({
          original: firstExp.originalText || `export * from '${firstExp.source}'`,
          replacement: `export const ${svelteDefaultName} = {}`,
        })
      }
    } else if (firstExp.isBatch && firstExp.source?.endsWith('.js')) {
      const absolutePath = path.resolve(jsDir, firstExp.source)
      if (await existsCached(absolutePath)) {
        const tempUrl = await processJsReexport(absolutePath, exportNames, visited)
        replacements.push({
          original: firstExp.originalText || `export * from '${firstExp.source}'`,
          replacement: `export * from '${tempUrl}'`,
        })
      }
    } else if (firstExp.source?.endsWith('.svelte')) {
      const absoluteSveltePath = path.resolve(jsDir, firstExp.source)
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('compile timeout for ' + absoluteSveltePath.split('/').pop())),
            30000,
          ),
        )
        const result = (await Promise.race([
          compileSvelteOnlyExport(absoluteSveltePath, jsDir, exportNames),
          timeoutPromise,
        ])) as string
        const compiledUrl = pathToFileURL(result).href

        const specifiers = exps.map(exp => {
          const exportName = exp.alias || exp.name
          const isDefault = exp.name === 'default'
          return isDefault ? `default as ${exportName}` : exportName
        })

        const hasNamespaceReexport = exps.some(exp => exp.name === '*' && exp.alias)
        if (hasNamespaceReexport) {
          const namespaceExport = exps.find(exp => exp.name === '*' && exp.alias)!
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
        const specifiers = exps.map(exp => {
          const exportName = exp.alias || exp.name
          const isDefault = exp.name === 'default'
          if (isDefault) {
            replacements.push({
              original:
                firstExp.originalText ||
                `export { ${exps.map(e => e.name).join(', ')} } from '${firstExp.source}'`,
              replacement: `export const ${exportName} = {}`,
            })
          } else {
            replacements.push({
              original:
                firstExp.originalText ||
                `export { ${exps.map(e => e.name).join(', ')} } from '${firstExp.source}'`,
              replacement: `export const ${exportName} = {}`,
            })
          }
        })
      }
    } else if (firstExp.source?.endsWith('.js')) {
      const absolutePath = path.resolve(jsDir, firstExp.source)
      if (await existsCached(absolutePath)) {
        const reexportContent = await fs.readFile(absolutePath, 'utf-8')
        let tempUrl: string

        if (hasSvelteRunes(reexportContent)) {
          try {
            const { compileModule } = await getSvelteCompiler()
            const result = compileModule(reexportContent, { filename: absolutePath })
            const jsCodeString = String(result.js.code)
            const code = await processImports(jsCodeString, absolutePath)
            const transformedCode = transformForNode(code, absolutePath)
            tempUrl = pathToFileURL(await writeTempFile(absolutePath, transformedCode)).href
          } catch {
            // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
            // Skip processing and use original content
            tempUrl = pathToFileURL(await writeTempFile(absolutePath, reexportContent)).href
          }
        } else {
          tempUrl = await processJsReexport(absolutePath, exportNames, visited)
        }

        const specifiers = exps.map(exp => {
          const exportName = exp.alias || exp.name
          const isDefault = exp.name === 'default'
          return isDefault ? `default as ${exportName}` : exportName
        })

        const hasNamespaceReexport = exps.some(exp => exp.name === '*' && exp.alias)
        if (hasNamespaceReexport) {
          const namespaceExport = exps.find(exp => exp.name === '*' && exp.alias)!
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
    } else if (
      firstExp.source?.startsWith('@') ||
      (!firstExp.source?.startsWith('.') &&
        !firstExp.source?.startsWith('$') &&
        !firstExp.source?.startsWith('/'))
    ) {
      const source = firstExp.source!
      const resolved = await resolvePackageExport(source, jsDir)
      if (resolved.isSvelteOnly && resolved.resolvedPath) {
        const compiledPath = await compileSvelteOnlyExport(
          resolved.resolvedPath,
          jsDir,
          exportNames,
        )
        const compiledUrl = pathToFileURL(compiledPath).href
        replacements.push({
          original: firstExp.originalText || `export * from '${source}'`,
          replacement: `export * from '${compiledUrl}'`,
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
          if (hasSvelteRunes(depContent)) {
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
      } else if (importPath?.startsWith('$app')) {
        const shimResolved = await resolveAppImport(importPath)
        if (shimResolved) {
          const shimUrl = pathToFileURL(shimResolved).href
          replacements.push({
            original:
              imp.originalText || `import { ${imp.specifiers.join(', ')} } from '${importPath}'`,
            replacement: `import { ${imp.specifiers.join(', ')} } from '${shimUrl}'`,
          })
        }
      } else if (
        importPath?.startsWith('@') ||
        (!importPath?.startsWith('.') &&
          !importPath?.startsWith('$') &&
          !importPath?.startsWith('/'))
      ) {
        const source = importPath!
        const resolved = await resolvePackageExport(source, jsDir)
        try {
          if (resolved.isSvelteOnly && resolved.resolvedPath) {
            const compiledPath = await compileSvelteOnlyExport(
              resolved.resolvedPath,
              jsDir,
              exportNames,
            )
            const compiledUrl = pathToFileURL(compiledPath).href
            replacements.push({
              original:
                imp.originalText || `import { ${imp.specifiers.join(', ')} } from '${source}'`,
              replacement: `import { ${imp.specifiers.join(', ')} } from '${compiledUrl}'`,
            })
          }
        } catch {
          // Skip import that can't be compiled
        }
      }
    }
  }

  let result = code
  for (const { original, replacement } of replacements) {
    result = result.replace(original, replacement)
  }

  // Replace any remaining unresolved .svelte imports with stub exports
  const svelteImportRegex = /export\s+(?:{[^}]*}|[*])\s+from\s+['"]\.+\.+\/[^'"]*\.svelte['"]/g
  let match
  while ((match = svelteImportRegex.exec(result)) !== null) {
    const importDecl = match[0]
    const defaultMatch = importDecl.match(/export\s+{\s+default\s+as\s+(\w+)\s+}/)
    const batchMatch = importDecl.match(/export\s+\*\s+from/)
    if (batchMatch) {
      result = result.replace(importDecl, `// stub: ${importDecl}`)
    } else if (defaultMatch) {
      result = result.replace(importDecl, `export const ${defaultMatch[1]} = {}`)
    } else {
      result = result.replace(importDecl, `// stub: ${importDecl}`)
    }
  }

  return result
}

interface ExportVisitor {
  onSvelteExport: (name: string, resolvedPath: string) => boolean // return false to stop
  onSvelteDefault: (defaultName: string, resolvedPath: string) => boolean
  onJsExport: (exp: ExportInfo) => boolean
}

const traverseExports = async (
  filePath: string,
  visitor: ExportVisitor,
  visited: Set<string> = new Set(),
): Promise<void> => {
  if (visited.has(filePath)) {
    return
  }
  visited.add(filePath)

  const content = await fs.readFile(filePath, 'utf-8')
  const fileInfo = await parseFile(content, filePath)
  const exports = extractExports(fileInfo)
  const fileDir = path.dirname(filePath)

  for (const exp of exports) {
    if (exp.isBatch && exp.source?.endsWith('.svelte')) {
      const resolved = path.resolve(fileDir, exp.source)
      if (!visitor.onSvelteDefault(path.basename(resolved, '.svelte'), resolved)) {
        return
      }
    } else if (exp.source?.endsWith('.svelte')) {
      const resolved = path.resolve(fileDir, exp.source)
      if (!visitor.onSvelteExport(exp.alias || exp.name, resolved)) {
        return
      }
    } else if (exp.source) {
      const resolved = path.resolve(fileDir, exp.source)
      if (!visitor.onJsExport(exp)) {
        return
      }
      await traverseExports(resolved, visitor, visited)
    } else if (!exp.source) {
      if (!visitor.onJsExport(exp)) {
        return
      }
    }
  }
}

const extractNamedExportsRecursive = async (filePath: string): Promise<ExportInfo[]> => {
  const result: ExportInfo[] = []
  await traverseExports(filePath, {
    onSvelteExport: name => {
      result.push({ name, source: null, isType: false, isDefault: false, isBatch: false })
      return true
    },
    onSvelteDefault: defaultName => {
      result.push({
        name: defaultName,
        source: null,
        isType: false,
        isDefault: false,
        isBatch: false,
      })
      return true
    },
    onJsExport: exp => {
      if (exp.name && !exp.name.startsWith('type')) {
        result.push(exp)
      }
      return true
    },
  })
  return result
}

const findSvelteFileForExport = async (
  filePath: string,
  exportName: string,
): Promise<string | null> => {
  let found: string | null = null
  await traverseExports(filePath, {
    onSvelteExport: (name, resolvedPath) => {
      if (name === exportName) {
        found = resolvedPath
        return false
      }
      return true
    },
    onSvelteDefault: (defaultName, resolvedPath) => {
      if (defaultName === exportName) {
        found = resolvedPath
        return false
      }
      return true
    },
    onJsExport: () => true,
  })
  return found
}

const isSkipPatternLocal = (spec: string): boolean => {
  return isSkipPattern(spec)
}

const extractNamedImportsFromCode = (code: string, spec: string): string[] => {
  const imports = extractImportsSync(code)
  const imp = imports.find(i => i.source === spec)
  return imp?.localNames ?? []
}

interface ImportReplacement {
  spec: string
  resolved: PackageExportResolve
  compiledPath: string | null
  exportStarCode: string | null
}

export const resolveSvelteOnlyExports = async (
  code: string,
  sourceDir: string,
): Promise<string> => {
  let result = code

  const fileInfo = await parseFile(code, '<inline>')
  const imports = extractImports(fileInfo)
  const exports = extractExports(fileInfo)

  // Handle $app/* imports first (before early return check)
  for (const imp of imports) {
    if ((imp.type === 'static' || imp.type === 'namespace') && imp.source?.startsWith('$app')) {
      const shimResolved = await resolveAppImport(imp.source)
      if (shimResolved) {
        const shimUrl = pathToFileURL(shimResolved).href
        result = result.replace(
          imp.originalText || `import { ${imp.specifiers.join(', ')} } from '${imp.source}'`,
          `import { ${imp.specifiers.join(', ')} } from '${shimUrl}'`,
        )
      }
    }
  }

  const specsToResolve = new Set<string>()

  for (const imp of imports) {
    if (imp.source && !isSkipPatternLocal(imp.source)) {
      specsToResolve.add(imp.source)
    }
  }

  for (const exp of exports) {
    if (exp.source && !isSkipPatternLocal(exp.source)) {
      specsToResolve.add(exp.source)
    }
  }

  if (specsToResolve.size === 0) {
    return result
  }

  const resolutions = await Promise.all(
    [...specsToResolve].map(async spec => {
      const resolved = await resolvePackageExport(spec, sourceDir)
      let compiledPath: string | null = null
      let exportStarCode: string | null = null

      if (resolved.isSvelteOnly && resolved.resolvedPath) {
        try {
          const namedImports = extractNamedImportsFromCode(code, spec)

          if (namedImports.length > 0) {
            const svelteFiles = await Promise.all(
              namedImports.map(async name => {
                const sveltePath = await findSvelteFileForExport(resolved.resolvedPath!, name)
                return sveltePath ? { name, sveltePath } : null
              }),
            )
            const validSvelteFiles = svelteFiles.filter(
              (f): f is { name: string; sveltePath: string } => f !== null,
            )

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
        } catch {
          // Skip package that can't be compiled
        }
      }

      return { spec, resolved, compiledPath, exportStarCode } as ImportReplacement
    }),
  )

  const specToReplacement = new Map<string, ImportReplacement>()
  for (const r of resolutions) {
    specToReplacement.set(r.spec, r)
  }

  const exportStarReplacements: Array<{ placeholder: string; code: string }> = []
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
