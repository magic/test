import path from 'node:path'
import fs from '@magic/fs'
import { resolveAlias } from '../viteConfig/index.js'
import { importCache, pendingPromises, LRUCache } from '../../caches/cache.js'
import { getCachedCompile, recordCompile } from '../../caches/persistentCache.js'
import { getCwd } from '../../../constants.js'
import { acquireLock } from './acquireLock.js'
import { isSvelteFile } from './isSvelteFile.js'
import { getSvelteExports } from './getSvelteExports.js'
import { pathToFileURL } from 'node:url'
import { compileSvelte } from './compileSvelte.js'
import { processImports } from './processImports.js'
import { computeRelativePath } from './computeRelativePath.js'
import { classifyImport } from '../viteConfig/classifyImport.js'
import { getTempFilePath } from './getTempFilePath.js'
import { compileBarrel } from './compileBarrel.js'
import { resolveImportMapSpecifier, findNearestPackageJson } from './resolveImportMap.js'
import { resolvePackageExport } from './resolvePackageExport.js'
import { compileSvelteOnlyExport } from './resolveSvelteOnlyExports.js'
import { tryStat } from '../../fs.js'
import { ddl } from './ddl.js'
import { traceStart, traceEnd } from '../../trace/timing.js'
import { writeQueue } from './writeQueue.js'
import { existsCached } from '../../caches/pathCache.js'
import { resolveFilePath, SHIM_EXTENSION_CANDIDATES } from './pathUtils.js'
import { extractNamedImportsFromCode } from './exportAnalysis.js'
// Memo of resolved absolute paths per (specifier, sourceDir). The fs probing
// below (stat/exists/extension candidates/barrel detection) dominates the cost
// of resolving a plain import, and the same specifier is re-resolved from many
// source files in every worker (e.g. util.js ~700x per cold run). Resolution
// is stable for the lifetime of a run (sources don't change while tests run),
// so a per-process memo is safe.
const resolvedPathCache = new LRUCache(4096)
// Plain (non-svelte) files resolve to a source-independent file:// URL.
const plainFileUrlCache = new LRUCache(4096)
export const resolveAndCompileImport = async (
  importPath,
  sourceDir,
  sourceFilePath,
  importChain = [],
) => {
  const id = traceStart(`resolveAndCompileImport ${importPath.split('/').pop() || importPath}`)
  try {
    return await resolveAndCompileImportImpl(importPath, sourceDir, sourceFilePath, importChain)
  } finally {
    traceEnd(id)
  }
}
const resolveAndCompileImportImpl = async (
  importPath,
  sourceDir,
  sourceFilePath,
  importChain = [],
) => {
  // Deduplicate concurrent requests using shared pendingPromises map
  // Include sourceFilePath in dedup key to prevent deadlock when the same file
  // is being resolved from different import contexts (e.g., self-import)
  const dedupKey = `resolve:${importPath}:${sourceDir}:${sourceFilePath}`
  const pending = pendingPromises.get(dedupKey)
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
  importPath,
  sourceDir,
  sourceFilePath,
  importChain = [],
) => {
  const resolveKey = `${importPath}\u0000${sourceDir}`
  const memoized = resolvedPathCache.get(resolveKey)
  let resolvedPath
  if (memoized === undefined) {
    const importType = classifyImport(importPath)
    // Resolve "#-prefixed" imports against the importing file's own package
    // scope (nearest package.json), matching Node's ESM semantics for
    // import-map specifiers (e.g. "#lib/*": "./src/lib/*").
    if (importPath.startsWith('#')) {
      const pkgJsonPath = await findNearestPackageJson(path.resolve(sourceFilePath))
      const importMapPath = await resolveImportMapSpecifier(importPath, pkgJsonPath)
      if (importMapPath) {
        resolvedPath = importMapPath
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
      const candidate = await resolveFilePath(shimPath, SHIM_EXTENSION_CANDIDATES)
      if (candidate) {
        return { filePath: importPath, js: '', url: candidate }
      }
    }
    if (importPath === 'svelte') {
      const svelteClient = path.resolve(getCwd(), 'node_modules/svelte/src/index-client.js')
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
        resolvedPath = found
      }
    }
    // Fallback: if file doesn't exist and is inside node_modules, try dist/ prefix
    if (!(await existsCached(resolvedPath)) && resolvedPath.includes('node_modules')) {
      const nodeModulesIdx = resolvedPath.indexOf('node_modules')
      const afterNodeModules = resolvedPath.slice(nodeModulesIdx + 'node_modules'.length + 1)
      const parts = afterNodeModules.split('/').filter(Boolean)
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const isScoped = parts[0].startsWith('@')
        const pkgPath = isScoped
          ? `node_modules/${parts[0]}/${parts[1]}`
          : `node_modules/${parts[0]}`
        const relPath = isScoped ? parts.slice(2).join('/') : parts.slice(1).join('/')
        const distCandidate = path.join(process.cwd(), pkgPath, 'dist', relPath)
        if (await existsCached(distCandidate)) {
          resolvedPath = distCandidate
        }
      }
    }
    resolvedPathCache.set(resolveKey, resolvedPath ?? null)
  } else {
    resolvedPath = memoized ?? undefined
  }
  if (!resolvedPath) {
    return { filePath: importPath, js: '', url: null, skipProcessing: true }
  }
  // Side-effect asset imports (CSS and friends) have no Node.js equivalent —
  // the browser bundler handles them, tests only need the JS. Drop the import.
  if (resolvedPath && /\.(css|scss|sass|less|styl|pcss)$/i.test(resolvedPath)) {
    return { filePath: importPath, js: '', url: null, removeImport: true }
  }
  const ext = path.extname(resolvedPath)
  if ((ext === '.ts' || ext === '.js') && (await existsCached(resolvedPath))) {
    const barrelId = traceStart('compileBarrel')
    // Cross-worker / cross-run reuse: a sibling worker (or an earlier run)
    // may have already analyzed this barrel and written the wrapper. The
    // wrapper content is a function of the barrel code alone (it only
    // re-points imports at the per-source temp files, which validate
    // themselves on import), so the barrel file hash is the right key.
    // Skips the multi-second export-graph walk on a hit.
    const persistentBarrel = await getCachedCompile(resolvedPath)
    if (persistentBarrel) {
      traceEnd(barrelId, 'persistent cache hit')
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const wrapperAbs = path.join(getCwd(), getTempFilePath(resolvedPath))
      const relativePath = computeRelativePath(fromDir, wrapperAbs)
      return { filePath: resolvedPath, js: persistentBarrel.js, url: relativePath }
    }
    const exports = await getSvelteExports(resolvedPath)
    if (exports.length > 0) {
      const barrelResult = await compileBarrel(resolvedPath, importChain, exports)
      // Record the wrapper in the persistent cache so sibling workers and
      // future runs skip the export-graph walk entirely.
      await recordCompile(resolvedPath, barrelResult.js)
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
    let absoluteUrl = plainFileUrlCache.get(resolvedPath)
    if (!absoluteUrl) {
      absoluteUrl = pathToFileURL(resolvedPath).href
      plainFileUrlCache.set(resolvedPath, absoluteUrl)
    }
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
  const tmpFileAbs = path.join(getCwd(), tmpFile)
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
  // Cross-worker reuse: the persistent cache (manifest + compiled temp file)
  // is shared on disk. If a sibling worker already compiled this file and
  // recorded it, skip the compile + import processing entirely.
  const diskCached = await getCachedCompile(resolvedPath)
  if (diskCached) {
    const stats = await fs.stat(resolvedPath)
    importCache.set(resolvedPath, { js: diskCached.js, absPath: tmpFileAbs, mtime: stats.mtimeMs })
    traceEnd(compileId, 'disk cache hit')
    const sourceTmpFile = getTempFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, tmpFileAbs)
    return { filePath: resolvedPath, js: diskCached.js, url: relativePath }
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
  // Record in the persistent cache so sibling workers (same run) and future
  // runs can skip the compile entirely.
  await recordCompile(resolvedPath, processed)
  const sourceTmpFile = getTempFilePath(sourceFilePath)
  const fromDir = path.dirname(sourceTmpFile)
  const relativePath = computeRelativePath(fromDir, tmpFileAbs)
  return { filePath: resolvedPath, js: processed, url: relativePath }
}
//# sourceMappingURL=resolveAndCompileImport.js.map
