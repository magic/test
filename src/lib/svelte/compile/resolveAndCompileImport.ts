import type { ResolveAndCompileResult } from './types.ts'

import path from 'node:path'
import fs from '@magic/fs'

import { resolveAlias } from '../viteConfig/index.ts'

import { importCache, pendingPromises } from '#src/lib/caches/cache.js'
import { CWD } from '#src/constants.js'
import { acquireLock } from './acquireLock.ts'
import { isSvelteFile } from './isSvelteFile.ts'
import { getSvelteExports } from './getSvelteExports.ts'

import { pathToFileURL } from 'node:url'

import { compileSvelte } from './compileSvelte.ts'
import { processImports } from './processImports.ts'
import { computeRelativePath } from './computeRelativePath.ts'
import { classifyImport } from '../viteConfig/classifyImport.ts'
import { getTempFilePath } from './getTempFilePath.ts'
import { compileBarrel } from './compileBarrel.ts'
import { resolvePackageExport } from './resolvePackageExport.ts'
import { compileSvelteOnlyExport } from './resolveSvelteOnlyExports.ts'
import { tryStat } from '#src/lib/fs.js'
import { ddl } from './ddl.ts'
import { traceStart, traceEnd } from '#src/lib/trace/timing.js'
import { writeQueue } from './writeQueue.ts'
import { existsCached } from '#src/lib/caches/pathCache.js'
import { extractImportsSync } from './astParse.ts'
import { resolveFilePath } from './pathUtils.ts'
const extractNamedImportsFromCode = (code: string, spec: string): string[] => {
  const imports = extractImportsSync(code)
  const imp = imports.find(i => i.source === spec)
  return imp?.localNames ?? []
}
export const resolveAndCompileImport = async (
  importPath: string,
  sourceDir: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<ResolveAndCompileResult> => {
  const id = traceStart(`resolveAndCompileImport ${importPath.split('/').pop() || importPath}`)
  try {
    return await resolveAndCompileImportImpl(importPath, sourceDir, sourceFilePath, importChain)
  } finally {
    traceEnd(id)
  }
}

const resolveAndCompileImportImpl = async (
  importPath: string,
  sourceDir: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<ResolveAndCompileResult> => {
  // Deduplicate concurrent requests using shared pendingPromises map
  // Include sourceFilePath in dedup key to prevent deadlock when the same file
  // is being resolved from different import contexts (e.g., self-import)
  const dedupKey = `resolve:${importPath}:${sourceDir}:${sourceFilePath}`
  const pending = pendingPromises.get(dedupKey) as Promise<ResolveAndCompileResult> | undefined
  if (pending) {
    ddl('resolve PENDING-HIT ' + importPath.split('/').pop() || importPath)
    return pending
  }

  const promise = resolveAndCompileImportImplCore(
    importPath,
    sourceDir,
    sourceFilePath,
    importChain,
  )
  pendingPromises.set(dedupKey, promise)
  try {
    return await promise
  } finally {
    pendingPromises.delete(dedupKey)
  }
}

const resolveAndCompileImportImplCore = async (
  importPath: string,
  sourceDir: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<ResolveAndCompileResult> => {
  const importType = classifyImport(importPath)
  let resolvedPath: string | undefined

  // Resolve "#-prefixed" imports against the tested package's own
  // package.json "imports" mappings (e.g. "#lib/*": "./src/lib/*",
  // "#client": "./src/internal/client.js").
  if (importPath.startsWith('#')) {
    const pkgJsonPath = path.resolve(CWD, 'package.json')
    if (await existsCached(pkgJsonPath)) {
      try {
        const pkgRaw = await fs.readFile(pkgJsonPath, 'utf-8')
        const pkg = JSON.parse(pkgRaw)
        const imports = pkg.imports as Record<string, unknown> | undefined
        if (imports && typeof imports === 'object') {
          let target: string | undefined
          let suffix: string | undefined

          // 1) Exact match: "#client": "./src/internal/client.js"
          if (typeof imports[importPath] === 'string') {
            target = imports[importPath]
          } else {
            // 2) Wildcard match, longest prefix wins:
            //    "#lib/*": "./src/lib/*"
            // 3) Parent-key base-dir match, longest prefix wins:
            //    "#lib": "./src/lib/index.js" resolves "#lib/forms/Button.svelte"
            //    to "./src/lib/forms/Button.svelte"
            let bestLen = -1
            for (const [key, value] of Object.entries(imports)) {
              if (typeof value !== 'string') {
                continue
              }
              if (key.endsWith('*')) {
                const prefix = key.slice(0, -1)
                if (importPath.startsWith(prefix) && prefix.length > bestLen) {
                  target = value
                  suffix = importPath.slice(prefix.length)
                  bestLen = prefix.length
                }
              } else if (key !== importPath) {
                const sep = key + '/'
                if (importPath.startsWith(sep) && key.length > bestLen) {
                  target = value
                  suffix = importPath.slice(sep.length)
                  bestLen = key.length
                }
              }
            }
          }

          if (target) {
            // A file target (has extension) implies its directory as the base;
            // a directory target is used as the base directly.
            const isFile = path.extname(target) !== ''
            const local =
              suffix === undefined
                ? target
                : target.includes('*')
                  ? target.replace('*', suffix)
                  : path.join(isFile ? path.dirname(target) : target, suffix)
            const fullResolvedPath = path.resolve(CWD, local)
            if (await existsCached(fullResolvedPath)) {
              resolvedPath = fullResolvedPath
            } else {
              // If the resolved path has .js extension but the file is .ts, try .ts instead
              if (path.extname(fullResolvedPath) === '.js') {
                const tsPath = fullResolvedPath.slice(0, -3) + '.ts'
                if (await existsCached(tsPath)) {
                  resolvedPath = tsPath
                } else {
                  // Try with extensions
                  for (const ext of ['.svelte', '.js', '.ts']) {
                    const candidate = fullResolvedPath + ext
                    if (await existsCached(candidate)) {
                      resolvedPath = candidate
                      break
                    }
                  }
                }
              } else {
                // Try with extensions
                for (const ext of ['.svelte', '.js', '.ts']) {
                  const candidate = fullResolvedPath + ext
                  if (await existsCached(candidate)) {
                    resolvedPath = candidate
                    break
                  }
                }
              }
              // Try as directory with index
              if (!resolvedPath) {
                for (const ext of ['/index.svelte', '/index.js', '/index.ts']) {
                  const candidate = fullResolvedPath + ext
                  if (await existsCached(candidate)) {
                    resolvedPath = candidate
                    break
                  }
                }
              }
            }
          }
        }
      } catch {
        // ignore - fallback to other resolution
      }
    }
  }

  // Direct handling of $app imports - resolve to shims
  if (importPath.startsWith('$app')) {
    if (process.env.MAGIC_TEST_DEBUG) {
      console.error('[resolveAndCompileImport] $app import:', importPath)
    }
    const shimsDir = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      'shims',
      '$app',
    )
    const shimPath = path.join(shimsDir, importPath.slice(5))
    const withExtensions = ['.ts', '.js', '/index.ts', '/index.js']
    for (const ext of withExtensions) {
      const candidate = shimPath + ext
      if (await existsCached(candidate)) {
        return { filePath: importPath, js: '', url: candidate }
      }
    }
  }

  if (importPath === 'svelte') {
    const svelteClient = path.resolve(CWD, 'node_modules/svelte/src/index-client.js')
    if (await existsCached(svelteClient)) {
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, svelteClient)
      return { filePath: importPath, js: '', url: relativePath }
    }
  }

  if (importType === 'scoped') {
    // If we already resolved via package.json imports handling, skip package resolution
    if (!resolvedPath) {
      const scopedId = traceStart('resolve.scoped')
      if (importPath.startsWith('@magic/')) {
        traceEnd(scopedId)
        return { filePath: importPath, js: '', url: null, skipProcessing: true }
      }
      const resolved = await resolvePackageExport(importPath, sourceDir)
      traceEnd(scopedId)
      if (resolved.isSvelteOnly && resolved.resolvedPath) {
        if (resolved.isSvelteOnlyPackage) {
          return {
            filePath: importPath,
            js: '',
            url: null,
            skipProcessing: true,
            isSvelteOnlyPackage: true,
          }
        }
        const sourceCode = await fs.readFile(sourceFilePath, 'utf-8')
        const namedImports = extractNamedImportsFromCode(sourceCode, importPath)
        const compiledPath = await compileSvelteOnlyExport(
          resolved.resolvedPath,
          sourceDir,
          namedImports.length > 0 ? namedImports : undefined,
        )
        const compiledUrl = pathToFileURL(compiledPath).href
        return { filePath: importPath, js: '', url: compiledUrl }
      }
      return { filePath: importPath, js: '', url: null, skipProcessing: true }
    }
  }

  if (importType === 'bare') {
    // If we already resolved via package.json imports handling, skip package resolution
    if (!resolvedPath) {
      const bareId = traceStart('resolve.bare')
      const resolved = await resolvePackageExport(importPath, sourceDir)
      if (resolved.isSvelteOnly && resolved.resolvedPath) {
        traceEnd(bareId)
        // If this is a svelte-only package (only has svelte export, no import/node condition),
        // skip processing because the compiled output would contain imports Node.js can't resolve
        if (resolved.isSvelteOnlyPackage) {
          return {
            filePath: importPath,
            js: '',
            url: null,
            skipProcessing: true,
            isSvelteOnlyPackage: true,
          }
        }
        const sourceCode = await fs.readFile(sourceFilePath, 'utf-8')
        const namedImports = extractNamedImportsFromCode(sourceCode, importPath)
        const compiledPath = await compileSvelteOnlyExport(
          resolved.resolvedPath,
          sourceDir,
          namedImports.length > 0 ? namedImports : undefined,
        )
        const compiledUrl = pathToFileURL(compiledPath).href
        return { filePath: importPath, js: '', url: compiledUrl }
      }
      if (resolved.resolvedPath && !resolved.isSvelteOnly) {
        const sourceTmpFile = getTempFilePath(sourceFilePath)
        const fromDir = path.dirname(sourceTmpFile)
        const relativePath = computeRelativePath(fromDir, resolved.resolvedPath)
        traceEnd(bareId)
        return { filePath: importPath, js: '', url: relativePath }
      }
      traceEnd(bareId)
      return { filePath: importPath, js: '', url: null, skipProcessing: true }
    }
  }

  if (importType === 'vite-alias') {
    const aliasId = traceStart('resolve.vite-alias')
    const aliasResolved = await resolveAlias(importPath, sourceFilePath, { includeShims: true })
    if (aliasResolved) {
      resolvedPath = aliasResolved
    }
    traceEnd(aliasId)
    if (!aliasResolved) {
      return { filePath: importPath, js: '', url: null, skipProcessing: true }
    }
  } else {
    const aliasResolved = await resolveAlias(importPath, sourceFilePath)
    if (aliasResolved) {
      resolvedPath = aliasResolved
    } else if (!resolvedPath) {
      resolvedPath = path.resolve(sourceDir, importPath)
    }
  }

  if (!resolvedPath) {
    return { filePath: importPath, js: '', url: null, skipProcessing: true }
  }

  if (!path.extname(resolvedPath)) {
    const withExt = await resolveFilePath(resolvedPath)
    if (withExt) {
      resolvedPath = withExt
    }
  } else if (resolvedPath.endsWith('.js')) {
    const tsPath = resolvedPath.slice(0, -3) + '.ts'
    if (await existsCached(tsPath)) {
      resolvedPath = tsPath
    }
  } else if (resolvedPath.endsWith('.svelte')) {
    if (!(await existsCached(resolvedPath))) {
      const svelteJsPath = resolvedPath + '.js'
      if (await existsCached(svelteJsPath)) {
        resolvedPath = svelteJsPath
      }
    }
  }

  const pathStats = await tryStat(resolvedPath)
  if (pathStats?.isDirectory()) {
    const importFileName = path.basename(importPath)
    const possibleFile = path.join(resolvedPath, importFileName)

    const withSvelte = possibleFile.endsWith('.svelte') ? possibleFile : possibleFile + '.svelte'
    if (await existsCached(withSvelte)) {
      resolvedPath = withSvelte
    } else if (importPath.includes('/')) {
      const fileName = importPath.split('/').pop() ?? ''
      const directCandidate = path.join(resolvedPath, fileName)
      if (await existsCached(directCandidate)) {
        resolvedPath = directCandidate
      }
    }

    if (pathStats?.isDirectory()) {
      const siblingFile = path.join(path.dirname(resolvedPath), importFileName + '.js')
      if (await existsCached(siblingFile)) {
        resolvedPath = siblingFile
      } else {
        const indexPath = path.join(resolvedPath, 'index.js')
        if (await existsCached(indexPath)) {
          resolvedPath = indexPath
        }
      }
    }
  }

  if (!(await existsCached(resolvedPath))) {
    // Parallel existence checks
    const checks = [
      { path: resolvedPath + '.svelte', result: resolvedPath + '.svelte' },
      {
        path: path.join(resolvedPath, 'index.svelte'),
        result: path.join(resolvedPath, 'index.svelte'),
      },
    ]
    if (!path.extname(resolvedPath) && !resolvedPath.includes('.')) {
      const sourceDirName = path.dirname(sourceFilePath)
      const possiblePath = path.join(sourceDirName, importPath.replace(/^\.\//, ''))
      checks.push({ path: possiblePath, result: possiblePath })
    }

    const results = await Promise.all(
      checks.map(c => fs.exists(c.path).then(exists => (exists ? c.result : null))),
    )
    const found = results.find(r => r !== null)
    if (found) {
      resolvedPath = found as string
    }
  }

  // Fallback: if file doesn't exist and is inside node_modules, try dist/ prefix
  if (!(await existsCached(resolvedPath)) && resolvedPath.includes('node_modules')) {
    const nodeModulesIdx = resolvedPath.indexOf('node_modules')
    const afterNodeModules = resolvedPath.slice(nodeModulesIdx + 'node_modules'.length + 1)
    const parts = afterNodeModules.split('/').filter(Boolean)
    if (parts.length >= 2 && parts[0] && parts[1]) {
      const isScoped = parts[0].startsWith('@')
      const pkgPath = isScoped ? `node_modules/${parts[0]}/${parts[1]}` : `node_modules/${parts[0]}`
      const relPath = isScoped ? parts.slice(2).join('/') : parts.slice(1).join('/')
      const distCandidate = path.join(process.cwd(), pkgPath, 'dist', relPath)
      if (await existsCached(distCandidate)) {
        resolvedPath = distCandidate
      }
    }
  }

  const ext = path.extname(resolvedPath)
  if ((ext === '.ts' || ext === '.js') && (await existsCached(resolvedPath))) {
    const barrelId = traceStart('compileBarrel')
    const exports = await getSvelteExports(resolvedPath)
    if (exports.length > 0) {
      const barrelResult = await compileBarrel(resolvedPath, importChain)
      traceEnd(barrelId)
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, barrelResult.wrapperAbsPath)
      return { filePath: resolvedPath, js: barrelResult.js, url: relativePath }
    }
    traceEnd(barrelId)
  }

  if (!isSvelteFile(resolvedPath)) {
    // Use absolute file:// URL for non-Svelte imports to avoid broken relative paths
    // that go through node_modules/.magic-test-cache/
    const absoluteUrl = pathToFileURL(resolvedPath).href
    return { filePath: resolvedPath, js: '', url: absoluteUrl }
  }

  if (!(await existsCached(resolvedPath))) {
    const absoluteUrl = pathToFileURL(resolvedPath).href
    return { filePath: resolvedPath, js: '', url: absoluteUrl }
  }

  // Normalize both resolvedPath and chain paths for comparison
  // The resolvedPath is absolute, but chain entries may be relative
  const normalizedResolved = path.resolve(resolvedPath)
  // Also normalize sourceFilePath for comparison (it may be relative)
  const normalizedSource = path.resolve(sourceFilePath)
  // Check if the import resolves to the same file that's doing the importing (circular self-reference)
  // OR if it's in the ancestor chain (already being processed)
  const isCircular =
    normalizedResolved === normalizedSource ||
    importChain.some(chainPath => {
      const normalizedChain = path.resolve(chainPath)
      return normalizedResolved === normalizedChain
    })
  if (isCircular) {
    // Use absolute file:// URL for circular imports to avoid broken relative paths
    const absoluteUrl = pathToFileURL(resolvedPath).href
    return { filePath: resolvedPath, js: '', url: absoluteUrl }
  }

  const tmpFile = getTempFilePath(resolvedPath)
  const tmpFileAbs = path.join(CWD, tmpFile)

  ddl('COMPILE-FILE start ' + path.basename(resolvedPath))

  const compileId = traceStart('compile.svelte-file')
  const cached = importCache.get(resolvedPath)
  if (cached) {
    const stats = await fs.stat(resolvedPath)
    if (stats.mtimeMs === cached.mtime) {
      traceEnd(compileId, 'cache hit')
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, cached.absPath)
      return { filePath: resolvedPath, js: cached.js, url: relativePath }
    }
  }

  const { js } = await compileSvelte(resolvedPath)

  const newChain = [...importChain, resolvedPath]
  const processId = traceStart('processImports')
  const processed = await processImports(js, resolvedPath, newChain)
  traceEnd(processId)

  ddl('COMPILE-FILE done-recursion ' + path.basename(resolvedPath))

  // Lock only around the temp-file write. Holding it across compileSvelte/processImports
  // deadlocks when the recursion re-enters this file (its lock can only release once the
  // recursion that is blocked on the lock completes).
  ddl('COMPILE-FILE lock-wait ' + path.basename(resolvedPath))
  const release = await acquireLock(tmpFile)
  ddl('COMPILE-FILE lock-held ' + path.basename(resolvedPath))
  try {
    const writeId = traceStart('fs.writeFile')
    await writeQueue.write(tmpFile, processed)
    await writeQueue.flushPath(tmpFile)
    traceEnd(writeId)
  } finally {
    release()
  }

  const stats = await fs.stat(resolvedPath)

  importCache.set(resolvedPath, {
    js: processed,
    absPath: tmpFileAbs,
    mtime: stats.mtimeMs,
  })
  traceEnd(compileId)

  const sourceTmpFile = getTempFilePath(sourceFilePath)
  const fromDir = path.dirname(sourceTmpFile)
  const relativePath = computeRelativePath(fromDir, tmpFileAbs)

  return { filePath: resolvedPath, js: processed, url: relativePath }
}
