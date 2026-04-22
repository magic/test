import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from '@magic/fs'
import { packageExportCache } from './packageExportCache.js'
const SKIP_PATTERNS = ['./', '../', '$app/', '$lib/', '$', '/']
const isSkipPattern = spec => {
  return SKIP_PATTERNS.some(p => spec.startsWith(p))
}
const getPackageName = spec => {
  const parts = spec.split('/')
  if (spec.startsWith('@')) {
    if (parts.length < 2) return null
    return { name: parts.slice(0, 2).join('/'), subpath: parts.slice(2).join('/') }
  }
  const name = parts[0]
  if (!name) return null
  return { name, subpath: parts.slice(1).join('/') }
}
const tryResolvePath = async (basePath, ...candidates) => {
  for (const candidate of candidates) {
    const fullPath = path.join(basePath, candidate)
    if (await fs.exists(fullPath)) {
      return fullPath
    }
  }
  return null
}
const SVELTE_REEXPORT_RE = /export\s+\{[^}]*\}\s+from\s+['"][^'"]*\.svelte['"]/g
const SVELTE_DEFAULT_REEXPORT_RE = /export\s+.*\s+from\s+['"][^'"]*\.svelte['"]/g
const hasSvelteReExports = async filePath => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.mjs')) {
    return false
  }
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return SVELTE_REEXPORT_RE.test(content) || SVELTE_DEFAULT_REEXPORT_RE.test(content)
  } catch {
    return false
  }
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
  let resolvedFilePath
  let importMetaResolved = false
  try {
    const resolved = import.meta.resolve(pkgName.name, pathToFileURL(sourceDir + '/'))
    resolvedFilePath = fileURLToPath(resolved)
    nodeModulesPath = path.dirname(resolvedFilePath)
    importMetaResolved = true
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
    ].filter(Boolean)
    const resolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
    return { resolvedPath: resolved, isSvelteOnly: false }
  }
  if (typeof exports === 'string') {
    const resolved = await tryResolvePath(nodeModulesPath, exports)
    return { resolvedPath: resolved, isSvelteOnly: false }
  }
  if (subpath && typeof exports === 'object' && !Array.isArray(exports)) {
    const subExport = exports[`./${subpath}`]
    if (subExport) {
      if (typeof subExport === 'string') {
        const resolved = await tryResolvePath(nodeModulesPath, subExport)
        return { resolvedPath: resolved, isSvelteOnly: resolved?.endsWith('.svelte') ?? false }
      }
      if (typeof subExport === 'object' && subExport !== null) {
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
  if (typeof exports === 'object' && exports !== null && !Array.isArray(exports)) {
    const rootExport = exports['.']
    if (!rootExport) {
      return { resolvedPath: null, isSvelteOnly: false }
    }
    if (typeof rootExport === 'string') {
      const resolved = await tryResolvePath(nodeModulesPath, rootExport)
      return { resolvedPath: resolved, isSvelteOnly: resolved?.endsWith('.svelte') ?? false }
    }
    if (typeof rootExport === 'object' && rootExport !== null) {
      const conditions = rootExport
      const hasNonSvelteCondition = ['import', 'node', 'module', 'require', 'default'].some(
        c => c in conditions && c !== 'svelte' && c !== 'types',
      )
      if (hasNonSvelteCondition) {
        const importPath = conditions.import || conditions.module || conditions.default
        if (importPath) {
          const resolved = await tryResolvePath(nodeModulesPath, importPath)
          if (resolved) {
            const svelteReExports = await hasSvelteReExports(resolved)
            if (svelteReExports) {
              return { resolvedPath: resolved, isSvelteOnly: true, hasSvelteReExports: true }
            }
          }
        }
        return { resolvedPath: null, isSvelteOnly: false }
      }
      const sveltePath = conditions.svelte
      if (sveltePath) {
        const resolved = await tryResolvePath(nodeModulesPath, sveltePath)
        if (resolved) {
          return { resolvedPath: resolved, isSvelteOnly: true }
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
          return { resolvedPath: fallbackResolved, isSvelteOnly: true }
        }
        throw new Error(
          `Package ${pkgName.name} has svelte-only exports but no fallback found. ` +
            `Svelte path: ${sveltePath}, checked fallbacks: ${fallbackCandidates.join(', ')}`,
        )
      }
      const fallbackCandidates = [
        pkg.main,
        pkg.module,
        './dist/index.js',
        'index.js',
        'src/index.js',
      ].filter(Boolean)
      const fallbackResolved = await tryResolvePath(nodeModulesPath, ...fallbackCandidates)
      return { resolvedPath: fallbackResolved, isSvelteOnly: false }
    }
  }
  return { resolvedPath: null, isSvelteOnly: false }
}
const pathToFileURL = p => {
  return new URL(`file://${p}`)
}
