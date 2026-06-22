import is from '@magic/types'
import path from 'node:path'
import fs from '@magic/fs'
import { createRequire } from 'node:module'
import log from '@magic/log'
import { LRUCache } from '../../caches/LRUCache.js'
import { traceStart, traceEnd } from '../../trace/timing.js'
import { existsCached } from '../../caches/pathCache.js'
import { pendingPromises, packageExportCache } from '../../caches/cache.js'
// Combined LRU cache for file scanning operations (boolean results)
// Keys prefixed: 'reexports:' or 'exportstar:'
const fileScanCache = new LRUCache(500)
// Cache for package resolution paths (nodeModulesPath per package, LRU for memory safety)
const nodeModulesPathCache = new LRUCache(100)
// Skip pattern regex (faster than array.some)
import {
  SVELTE_RUNE_REGEX,
  SVELTE_COMPILED_REGEX,
  SVELTE_REEXPORT_REGEX,
  SVELTE_DEFAULT_REEXPORT_REGEX,
  EXPORT_STAR_REGEX,
  EXPORT_NAMED_REGEX,
} from '../constants.js'
const getPackageName = spec => {
  const parts = spec.split('/')
  if (spec.startsWith('@')) {
    if (parts.length < 2) {
      return null
    }
    return { name: parts.slice(0, 2).join('/'), subpath: parts.slice(2).join('/') }
  }
  const name = parts[0]
  if (!name) {
    return null
  }
  return { name, subpath: parts.slice(1).join('/') }
}
const pathToFileURL = p => {
  return new URL(`file://${p}`)
}
const tryResolvePath = async (basePath, ...candidates) => {
  // Build all potential paths upfront (JS + MJS variants)
  const paths = []
  for (const candidate of candidates) {
    paths.push(path.join(basePath, candidate))
    if (candidate.endsWith('.js')) {
      paths.push(path.join(basePath, candidate + '.mjs'))
    }
  }
  // Check all in parallel
  const results = await Promise.all(
    paths.map(p => fs.exists(p).then(exists => (exists ? p : null))),
  )
  return results.find(r => r !== null) ?? null
}
const hasSvelteReExports = async (filePath, visited, _content) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.mjs')) {
    return false
  }
  visited ??= new Set()
  if (visited.has(filePath)) {
    return false
  }
  visited.add(filePath)
  // Check cache first
  const cached = fileScanCache.get(`reexports:${filePath}`)
  if (cached !== undefined) {
    return cached
  }
  // Read content once, reuse it
  const content = _content ?? (await fs.readFile(filePath, 'utf-8').catch(() => null))
  if (!content) {
    fileScanCache.set(`reexports:${filePath}`, false)
    return false
  }
  // If file has Svelte compiler output pattern, it's already compiled
  if (SVELTE_COMPILED_REGEX.test(content)) {
    fileScanCache.set(`reexports:${filePath}`, false)
    return false
  }
  if (SVELTE_REEXPORT_REGEX.test(content) || SVELTE_DEFAULT_REEXPORT_REGEX.test(content)) {
    fileScanCache.set(`reexports:${filePath}`, true)
    return true
  }
  if (SVELTE_RUNE_REGEX.test(content)) {
    fileScanCache.set(`reexports:${filePath}`, true)
    return true
  }
  const dir = path.dirname(filePath)
  const exportStarMatches = [...content.matchAll(EXPORT_STAR_REGEX)]
  const exportNamedMatches = [...content.matchAll(EXPORT_NAMED_REGEX)]
  for (const match of exportStarMatches) {
    const reexportPath = match[1]
    if (!reexportPath) {
      continue
    }
    const resolved = path.resolve(dir, reexportPath)
    if (resolved.endsWith('.svelte') || resolved.endsWith('.svelte.js')) {
      fileScanCache.set(`reexports:${filePath}`, true)
      return true
    }
    if (
      (resolved.endsWith('.js') || resolved.endsWith('.mjs')) &&
      (await hasSvelteReExports(resolved, visited))
    ) {
      fileScanCache.set(`reexports:${filePath}`, true)
      return true
    }
  }
  for (const match of exportNamedMatches) {
    const reexportPath = match[1]
    if (!reexportPath) {
      continue
    }
    const resolved = path.resolve(dir, reexportPath)
    if (resolved.endsWith('.svelte.js')) {
      fileScanCache.set(`reexports:${filePath}`, true)
      return true
    }
    if (
      (resolved.endsWith('.js') || resolved.endsWith('.mjs')) &&
      (await hasSvelteReExports(resolved, visited))
    ) {
      fileScanCache.set(`reexports:${filePath}`, true)
      return true
    }
  }
  fileScanCache.set(`reexports:${filePath}`, false)
  return false
}
const hasExportStarToSvelte = async (filePath, visited, _content) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.mjs')) {
    return false
  }
  visited ??= new Set()
  if (visited.has(filePath)) {
    return false
  }
  visited.add(filePath)
  // Check cache first
  const cached = fileScanCache.get(`exportstar:${filePath}`)
  if (cached !== undefined) {
    return cached
  }
  // Read content once, reuse it
  const content = _content ?? (await fs.readFile(filePath, 'utf-8').catch(() => null))
  if (!content) {
    fileScanCache.set(`exportstar:${filePath}`, false)
    return false
  }
  // If file has Svelte compiler output, it's already compiled
  if (SVELTE_COMPILED_REGEX.test(content)) {
    fileScanCache.set(`exportstar:${filePath}`, false)
    return false
  }
  const dir = path.dirname(filePath)
  const exportStarMatches = [...content.matchAll(EXPORT_STAR_REGEX)]
  for (const match of exportStarMatches) {
    const reexportPath = match[1]
    if (!reexportPath) {
      continue
    }
    const resolved = path.resolve(dir, reexportPath)
    if (resolved.endsWith('.svelte')) {
      fileScanCache.set(`exportstar:${filePath}`, true)
      return true
    }
    if (resolved.endsWith('.js') || resolved.endsWith('.mjs')) {
      if (await hasExportStarToSvelte(resolved, visited)) {
        fileScanCache.set(`exportstar:${filePath}`, true)
        return true
      }
      if (await hasSvelteReExports(resolved)) {
        fileScanCache.set(`exportstar:${filePath}`, true)
        return true
      }
    }
  }
  fileScanCache.set(`exportstar:${filePath}`, false)
  return false
}
const hasOnlySvelteCondition = conditions => {
  const allKeys = Object.keys(conditions)
  const nonSvelteKeys = allKeys.filter(k => k !== 'svelte' && k !== 'types' && k !== 'default')
  return nonSvelteKeys.length === 0 && 'svelte' in conditions
}
export const resolvePackageExport = async (pkgSpec, sourceDir) => {
  // Fast skip check
  if (
    pkgSpec.startsWith('./') ||
    pkgSpec.startsWith('../') ||
    pkgSpec.startsWith('$app/') ||
    pkgSpec.startsWith('$lib/') ||
    pkgSpec.startsWith('$') ||
    pkgSpec.startsWith('/')
  ) {
    return { resolvedPath: null, isSvelteOnly: false }
  }
  const pkgName = getPackageName(pkgSpec)
  if (!pkgName) {
    return { resolvedPath: null, isSvelteOnly: false }
  }
  const id = traceStart(`resolvePackageExport ${pkgSpec}`)
  const cacheKey = `pkg:${pkgSpec}:${sourceDir}`
  // Check cache first
  const cached = packageExportCache.get(cacheKey)
  if (cached) {
    traceEnd(id, 'cache hit')
    return cached
  }
  // Check deduplication (using shared pendingPromises)
  const pending = pendingPromises.get(cacheKey)
  if (pending) {
    traceEnd(id, 'dedup')
    return pending
  }
  const promise = resolvePackageExportImpl(pkgSpec, sourceDir, pkgName)
  pendingPromises.set(cacheKey, promise)
  try {
    const result = await promise
    packageExportCache.set(cacheKey, result)
    return result
  } finally {
    pendingPromises.delete(cacheKey)
  }
}
const resolvePackageExportImpl = async (_pkgSpec, sourceDir, pkgName) => {
  let nodeModulesPath
  // Use cached nodeModulesPath if available
  const cachedNodeModules = nodeModulesPathCache.get(pkgName.name)
  if (cachedNodeModules) {
    nodeModulesPath = cachedNodeModules
  } else {
    // Use require.resolve with paths from sourceDir
    try {
      const require_ = createRequire(pathToFileURL(sourceDir + '/'))
      const resolved = require_.resolve(pkgName.name)
      nodeModulesPath = path.dirname(resolved)
    } catch {
      nodeModulesPath = path.join(process.cwd(), 'node_modules', pkgName.name)
    }
    // Cache for future calls
    nodeModulesPathCache.set(pkgName.name, nodeModulesPath)
  }
  let pkgPath = path.join(nodeModulesPath, 'package.json')
  if (!(await existsCached(pkgPath))) {
    // Collect all potential package.json paths up the tree
    const candidates = []
    let current = nodeModulesPath
    while (current !== path.dirname(current)) {
      candidates.push({ dir: current, pkgPath: path.join(current, 'package.json') })
      current = path.dirname(current)
    }
    // Check all paths in parallel
    const results = await Promise.all(
      candidates.map(c => existsCached(c.pkgPath).then(exists => ({ ...c, exists }))),
    )
    const found = results.find(r => r.exists)
    if (found) {
      pkgPath = found.pkgPath
      nodeModulesPath = found.dir
    }
  }
  if (!(await existsCached(pkgPath))) {
    return { resolvedPath: null, isSvelteOnly: false }
  }
  let pkg
  try {
    pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
  } catch (e) {
    log.warn('Failed to parse package.json:', pkgPath, e.message)
    return { resolvedPath: null, isSvelteOnly: false }
  }
  const subpath = pkgName.subpath
  const exports = pkg.exports
  let result = { resolvedPath: null, isSvelteOnly: false }
  if (!exports) {
    const fallbackCandidates = [
      pkg.main,
      pkg.module,
      './dist/index.js',
      'index.js',
      'src/index.js',
    ].filter(a => !is.undef(a) && is.str(a))
    const resolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
    result = { resolvedPath: resolved, isSvelteOnly: false }
  } else if (is.string(exports)) {
    const resolved = await tryResolvePath(nodeModulesPath, exports)
    result = { resolvedPath: resolved, isSvelteOnly: false }
  } else if (subpath && is.object(exports) && !Array.isArray(exports)) {
    const subExport = exports[`./${subpath}`] ?? exports[`./${subpath}.js`]
    if (subExport) {
      if (is.string(subExport)) {
        const resolved = await tryResolvePath(nodeModulesPath, subExport)
        result = { resolvedPath: resolved, isSvelteOnly: resolved?.endsWith('.svelte') ?? false }
      } else if (is.object(subExport) && subExport !== null) {
        const conditions = subExport
        const hasImport = 'import' in conditions || 'node' in conditions || 'module' in conditions
        if (hasImport) {
          result = { resolvedPath: null, isSvelteOnly: false }
        } else {
          const sveltePath = conditions.svelte
          if (sveltePath) {
            const resolved = await tryResolvePath(nodeModulesPath, sveltePath)
            result = { resolvedPath: resolved, isSvelteOnly: true }
          } else {
            const fallbackCandidates = ['./lib/' + subpath, './' + subpath, subpath]
            const resolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
            result = {
              resolvedPath: resolved,
              isSvelteOnly: resolved?.endsWith('.svelte') ?? false,
            }
          }
        }
      } else {
        const fallbackCandidates = ['./lib/' + subpath, './' + subpath, subpath]
        const resolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
        result = { resolvedPath: resolved, isSvelteOnly: resolved?.endsWith('.svelte') ?? false }
      }
    } else {
      const fallbackCandidates = ['./lib/' + subpath, './' + subpath, subpath]
      const resolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
      result = { resolvedPath: resolved, isSvelteOnly: resolved?.endsWith('.svelte') ?? false }
    }
  } else if (is.object(exports) && exports !== null && !Array.isArray(exports)) {
    const rootExport = exports['.']
    if (!rootExport) {
      return { resolvedPath: null, isSvelteOnly: false }
    }
    if (is.string(rootExport)) {
      const resolved = await tryResolvePath(nodeModulesPath, rootExport)
      result = { resolvedPath: resolved, isSvelteOnly: resolved?.endsWith('.svelte') ?? false }
    } else if (is.object(rootExport) && rootExport !== null) {
      const conditions = rootExport
      const hasNonSvelteCondition = ['import', 'node', 'module', 'require', 'default'].some(
        c => c in conditions && c !== 'svelte' && c !== 'types',
      )
      const packageHasOnlySvelteCondition = hasOnlySvelteCondition(conditions)
      if (hasNonSvelteCondition) {
        const importPath = conditions.import || conditions.module || conditions.default
        if (importPath) {
          const resolved = await tryResolvePath(nodeModulesPath, importPath)
          if (resolved) {
            const svelteReExports = await hasSvelteReExports(resolved)
            if (svelteReExports || (await hasExportStarToSvelte(resolved))) {
              result = { resolvedPath: resolved, isSvelteOnly: true, hasSvelteReExports: true }
            } else {
              const sveltePath = conditions.svelte
              if (sveltePath) {
                const resolved2 = await tryResolvePath(nodeModulesPath, sveltePath)
                if (resolved2) {
                  const svelteReExports2 = await hasSvelteReExports(resolved2)
                  if (svelteReExports2 || (await hasExportStarToSvelte(resolved2))) {
                    result = {
                      resolvedPath: resolved2,
                      isSvelteOnly: true,
                      hasSvelteReExports: true,
                    }
                  } else {
                    result = { resolvedPath: null, isSvelteOnly: false }
                  }
                } else {
                  result = { resolvedPath: null, isSvelteOnly: false }
                }
              } else {
                result = { resolvedPath: null, isSvelteOnly: false }
              }
            }
          } else {
            result = { resolvedPath: null, isSvelteOnly: false }
          }
        } else {
          result = { resolvedPath: null, isSvelteOnly: false }
        }
      } else {
        const sveltePath = conditions.svelte
        if (sveltePath) {
          const resolved = await tryResolvePath(nodeModulesPath, sveltePath)
          if (resolved) {
            const svelteReExports = await hasSvelteReExports(resolved)
            if (svelteReExports) {
              result = {
                resolvedPath: resolved,
                isSvelteOnly: true,
                hasSvelteReExports: true,
                isSvelteOnlyPackage: packageHasOnlySvelteCondition,
              }
            } else if (packageHasOnlySvelteCondition) {
              result = {
                resolvedPath: resolved,
                isSvelteOnly: true,
                hasSvelteReExports: false,
                isSvelteOnlyPackage: true,
              }
            } else {
              const fallbackCandidates = [
                pkg.main,
                pkg.module,
                './dist/index.js',
                'index.js',
                'src/index.js',
              ].filter(Boolean)
              const fallbackResolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
              if (fallbackResolved) {
                const svelteReExports = await hasSvelteReExports(fallbackResolved)
                result = {
                  resolvedPath: fallbackResolved,
                  isSvelteOnly: svelteReExports,
                  hasSvelteReExports: svelteReExports,
                  isSvelteOnlyPackage: packageHasOnlySvelteCondition,
                }
              } else {
                // Check subpath exports
                const pkgExports = pkg.exports
                const subpathKeys = pkgExports
                  ? Object.keys(pkgExports).filter(
                      k =>
                        k !== '.' &&
                        (k.includes('component') || k.includes('svelte') || k.endsWith('.svelte')),
                    )
                  : []
                let found = false
                for (const subpathKey of subpathKeys) {
                  const subpathExport = pkgExports?.[subpathKey]
                  const subpathStr = is.string(subpathExport)
                    ? subpathExport
                    : subpathExport?.svelte || subpathExport?.import || subpathExport?.default
                  if (subpathStr) {
                    const subpathResolved = await tryResolvePath(nodeModulesPath, subpathStr)
                    if (subpathResolved) {
                      const svelteReExports = await hasSvelteReExports(subpathResolved)
                      if (svelteReExports) {
                        result = {
                          resolvedPath: subpathResolved,
                          isSvelteOnly: true,
                          hasSvelteReExports: true,
                        }
                        found = true
                        break
                      }
                    }
                  }
                }
                if (!found) {
                  result = { resolvedPath: null, isSvelteOnly: false }
                }
              }
            }
          } else {
            result = { resolvedPath: null, isSvelteOnly: false }
          }
        } else {
          const fallbackCandidates = [
            pkg.main,
            pkg.module,
            './dist/index.js',
            'index.js',
            'src/index.js',
          ].filter(Boolean)
          const fallbackResolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
          result = { resolvedPath: fallbackResolved ?? null, isSvelteOnly: false }
        }
      }
    } else {
      result = { resolvedPath: null, isSvelteOnly: false }
    }
  }
  return result
}
