import is from '@magic/types'
import path from 'node:path'
import fs from '@magic/fs'
import { createRequire } from 'node:module'
import { packageExportCache } from './packageExportCache.js'
const SKIP_PATTERNS = ['./', '../', '$app/', '$lib/', '$', '/']
const isSkipPattern = spec => {
  return SKIP_PATTERNS.some(p => spec.startsWith(p))
}
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
const tryResolvePath = async (basePath, ...candidates) => {
  for (const candidate of candidates) {
    const fullPath = path.join(basePath, candidate)
    if (await fs.exists(fullPath)) {
      return fullPath
    }
    // Try with .mjs if .js doesn't exist
    if (candidate.endsWith('.js')) {
      const mjsPath = candidate + '.mjs'
      const mjsFullPath = path.join(basePath, mjsPath)
      if (await fs.exists(mjsFullPath)) {
        return mjsFullPath
      }
    }
  }
  return null
}
const SVELTE_REEXPORT_RE = /export\s+\{[^}]*\}\s+from\s+['"][^'"]*\.svelte['"]/g
const SVELTE_DEFAULT_REEXPORT_RE = /export\s+.*\s+from\s+['"][^'"]*\.svelte['"]/g
const EXPORT_STAR_RE = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g
const SVELTE_RUNE_RE =
  /\$(?:state|derived|effect|props|bindable|state\.config|effect\.pre|effect\.post|derived\.by)\b/
const EXPORT_NAMED_RE = /export\s+\{\s*\w[\w\s,]*\}\s+from\s+['"]([^'"]+)['"]/g
const hasSvelteReExports = async (filePath, visited) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.mjs')) {
    return false
  }
  visited ??= new Set()
  if (visited.has(filePath)) {
    return false
  }
  visited.add(filePath)
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    if (SVELTE_REEXPORT_RE.test(content) || SVELTE_DEFAULT_REEXPORT_RE.test(content)) {
      return true
    }
    if (SVELTE_RUNE_RE.test(content)) {
      return true
    }
    const dir = path.dirname(filePath)
    for (const match of content.matchAll(EXPORT_STAR_RE)) {
      const reexportPath = match[1]
      if (!reexportPath) {
        continue
      }
      const resolved = path.resolve(dir, reexportPath)
      if (resolved.endsWith('.svelte') || resolved.endsWith('.svelte.js')) {
        return true
      }
      if (
        (resolved.endsWith('.js') || resolved.endsWith('.mjs')) &&
        (await hasSvelteReExports(resolved, visited))
      ) {
        return true
      }
    }
    for (const match of content.matchAll(EXPORT_NAMED_RE)) {
      const reexportPath = match[1]
      if (!reexportPath) {
        continue
      }
      const resolved = path.resolve(dir, reexportPath)
      if (resolved.endsWith('.svelte.js')) {
        return true
      }
      if (
        (resolved.endsWith('.js') || resolved.endsWith('.mjs')) &&
        (await hasSvelteReExports(resolved, visited))
      ) {
        return true
      }
    }
    return false
  } catch {
    return false
  }
}
const hasExportStarToSvelte = async (filePath, visited) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.mjs')) {
    return false
  }
  visited ??= new Set()
  if (visited.has(filePath)) {
    return false
  }
  visited.add(filePath)
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const dir = path.dirname(filePath)
    for (const match of content.matchAll(EXPORT_STAR_RE)) {
      const reexportPath = match[1]
      if (!reexportPath) {
        continue
      }
      const resolved = path.resolve(dir, reexportPath)
      if (resolved.endsWith('.svelte')) {
        return true
      }
      if (resolved.endsWith('.js') || resolved.endsWith('.mjs')) {
        if (await hasExportStarToSvelte(resolved, visited)) {
          return true
        }
        if (await hasSvelteReExports(resolved)) {
          return true
        }
      }
    }
  } catch {
    return false
  }
  return false
}
const hasOnlySvelteCondition = conditions => {
  const allKeys = Object.keys(conditions)
  const nonSvelteKeys = allKeys.filter(k => k !== 'svelte' && k !== 'types' && k !== 'default')
  return nonSvelteKeys.length === 0 && 'svelte' in conditions
}
export const resolvePackageExport = async (pkgSpec, sourceDir) => {
  if (isSkipPattern(pkgSpec)) {
    return { resolvedPath: null, isSvelteOnly: false }
  }
  const pkgName = getPackageName(pkgSpec)
  if (!pkgName) {
    return { resolvedPath: null, isSvelteOnly: false }
  }
  const cacheKey = `${pkgSpec}:${sourceDir}`
  const cached = packageExportCache.get(cacheKey)
  if (cached) {
    return cached
  }
  let nodeModulesPath
  // Use require.resolve with paths from sourceDir to properly resolve packages
  // from the project that contains the source file, not from process.cwd()
  try {
    const require_ = createRequire(pathToFileURL(sourceDir + '/'))
    const resolved = require_.resolve(pkgName.name)
    nodeModulesPath = path.dirname(resolved)
  } catch {
    nodeModulesPath = path.join(process.cwd(), 'node_modules', pkgName.name)
  }
  let pkgPath = path.join(nodeModulesPath, 'package.json')
  if (!(await fs.exists(pkgPath))) {
    let current = nodeModulesPath
    while (current !== path.dirname(current)) {
      const parentPkg = path.join(current, 'package.json')
      if (await fs.exists(parentPkg)) {
        pkgPath = parentPkg
        nodeModulesPath = current
        break
      }
      current = path.dirname(current)
    }
  }
  if (!(await fs.exists(pkgPath))) {
    return { resolvedPath: null, isSvelteOnly: false }
  }
  if (!(await fs.exists(pkgPath))) {
    return { resolvedPath: null, isSvelteOnly: false }
  }
  let pkg
  try {
    pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
  } catch {
    return { resolvedPath: null, isSvelteOnly: false }
  }
  const subpath = pkgName.subpath
  const exports = pkg.exports
  if (!exports) {
    const fallbackCandidates = [
      pkg.main,
      pkg.module,
      './dist/index.js',
      'index.js',
      'src/index.js',
    ].filter(a => !is.undef(a) && is.str(a))
    const resolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
    return { resolvedPath: resolved, isSvelteOnly: false }
  }
  if (is.string(exports)) {
    const resolved = await tryResolvePath(nodeModulesPath, exports)
    return { resolvedPath: resolved, isSvelteOnly: false }
  }
  if (subpath && is.object(exports) && !Array.isArray(exports)) {
    const subExport = exports[`./${subpath}`] ?? exports[`./${subpath}.js`]
    if (subExport) {
      if (is.string(subExport)) {
        const resolved = await tryResolvePath(nodeModulesPath, subExport)
        return { resolvedPath: resolved, isSvelteOnly: resolved?.endsWith('.svelte') ?? false }
      }
      if (is.object(subExport) && subExport !== null) {
        const conditions = subExport
        const hasImport = 'import' in conditions || 'node' in conditions || 'module' in conditions
        if (hasImport) {
          return { resolvedPath: null, isSvelteOnly: false }
        }
        const sveltePath = conditions.svelte
        if (sveltePath) {
          const resolved = await tryResolvePath(nodeModulesPath, sveltePath)
          return { resolvedPath: resolved, isSvelteOnly: true }
        }
      }
    }
    const fallbackCandidates = ['./lib/' + subpath, './' + subpath, subpath]
    const resolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
    return { resolvedPath: resolved, isSvelteOnly: resolved?.endsWith('.svelte') ?? false }
  }
  if (is.object(exports) && exports !== null && !Array.isArray(exports)) {
    const rootExport = exports['.']
    if (!rootExport) {
      return { resolvedPath: null, isSvelteOnly: false }
    }
    if (is.string(rootExport)) {
      const resolved = await tryResolvePath(nodeModulesPath, rootExport)
      return { resolvedPath: resolved, isSvelteOnly: resolved?.endsWith('.svelte') ?? false }
    }
    if (is.object(rootExport) && rootExport !== null) {
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
              return { resolvedPath: resolved, isSvelteOnly: true, hasSvelteReExports: true }
            }
          }
        }
        // import condition exists but no direct Svelte re-exports found
        // Check svelte condition before returning false
        const sveltePath = conditions.svelte
        if (sveltePath) {
          const resolved = await tryResolvePath(nodeModulesPath, sveltePath)
          if (resolved) {
            // Only return isSvelteOnly: true if the svelte condition file actually has Svelte re-exports
            // This prevents false positives for packages like @systemkollektiv/i18n that have
            // a svelte condition but don't actually re-export any Svelte components
            const svelteReExports = await hasSvelteReExports(resolved)
            if (svelteReExports || (await hasExportStarToSvelte(resolved))) {
              return { resolvedPath: resolved, isSvelteOnly: true, hasSvelteReExports: true }
            }
            // svelte condition exists but no Svelte re-exports found
            // Continue to check subpath exports
          }
        }
      }
      const sveltePath = conditions.svelte
      if (sveltePath) {
        const resolved = await tryResolvePath(nodeModulesPath, sveltePath)
        if (resolved) {
          const svelteReExports = await hasSvelteReExports(resolved)
          if (svelteReExports) {
            return {
              resolvedPath: resolved,
              isSvelteOnly: true,
              hasSvelteReExports: true,
              isSvelteOnlyPackage: packageHasOnlySvelteCondition,
            }
          }
          // svelte condition exists but no Svelte re-exports found
          // If package only has svelte condition (no import/node), still mark it
          if (packageHasOnlySvelteCondition) {
            return {
              resolvedPath: resolved,
              isSvelteOnly: true,
              hasSvelteReExports: false,
              isSvelteOnlyPackage: true,
            }
          }
        }
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
          if (svelteReExports) {
            return {
              resolvedPath: fallbackResolved,
              isSvelteOnly: true,
              hasSvelteReExports: true,
              isSvelteOnlyPackage: packageHasOnlySvelteCondition,
            }
          }
        }
        // No Svelte re-exports found in root export conditions
        // Check subpath exports for Svelte re-exports
        const pkgExports = pkg.exports
        const subpathKeys = pkgExports
          ? Object.keys(pkgExports).filter(
              k =>
                k !== '.' &&
                (k.includes('component') || k.includes('svelte') || k.endsWith('.svelte')),
            )
          : []
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
                return {
                  resolvedPath: subpathResolved,
                  isSvelteOnly: true,
                  hasSvelteReExports: true,
                }
              }
            }
          }
        }
        // No Svelte re-exports found anywhere, return false
        return { resolvedPath: null, isSvelteOnly: false }
      }
      const fallbackCandidates = [
        pkg.main,
        pkg.module,
        './dist/index.js',
        'index.js',
        'src/index.js',
      ].filter(Boolean)
      const fallbackResolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
      return { resolvedPath: fallbackResolved ?? null, isSvelteOnly: false }
    }
  }
  return { resolvedPath: null, isSvelteOnly: false }
}
const pathToFileURL = p => {
  return new URL(`file://${p}`)
}
