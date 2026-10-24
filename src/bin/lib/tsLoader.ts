import fs from '@magic/fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import is from '@magic/types'
import log from '@magic/log'
import { resolveAlias } from '../../lib/svelte/viteConfig/resolveAlias.js'
import { traceStart, traceEnd } from '../../lib/trace/timing.js'
import { cacheManager } from '../../lib/caches/cache.js'
import { writeQueue } from '../../lib/svelte/compile/writeQueue.js'
import { hasSvelteRunes, extractImportsSync } from '../../lib/svelte/compile/astParse.js'
import { getTempFilePath } from '../../lib/svelte/compile/getTempFilePath.js'
import { transpileWithTypescript } from './tsTranspile.js'
import { compileSvelteWithWrite } from '../../lib/svelte/compile/compileSvelteWithWrite.js'
import { findNearestPackageJson } from '../../lib/svelte/compile/resolveImportMap.js'
import { writeTempFile } from '../../lib/svelte/compile/resolveSvelteOnlyExports.js'
import { processImports } from '../../lib/svelte/compile/processImports.js'
import { transformForNode } from '../../lib/svelte/compile/transformForNode.js'
import { loadViteConfig } from '../../lib/svelte/viteConfig/loadViteConfig.js'
import { initGlobals } from '../../lib/dom/globals.js'
import { CACHE_DIR } from '../../constants.js'

// Svelte is optional - only required when .svelte files are tested
let svelteAvailable = false
let svelteCompilerCache:
  Promise<typeof import('svelte/compiler')> | typeof import('svelte/compiler') | null = null

try {
  const mod = await import('svelte/compiler')
  svelteCompilerCache = mod
  svelteAvailable = true
} catch {
  // svelte not installed, svelte-specific blocks will be skipped
}

const getCompileModule = (): Promise<typeof import('svelte/compiler')> => {
  if (!svelteCompilerCache) {
    svelteCompilerCache = import('svelte/compiler')
  }
  return Promise.resolve(svelteCompilerCache as typeof import('svelte/compiler'))
}

// Track files currently being loaded to prevent circular dependency hangs
const currentlyLoading = new Set<string>()

// Warm the user vite config and the whole compile pipeline at loader init.
// Dynamic imports that run while a resolve/load hook is still being awaited can
// deadlock Node's ESM loader, so eagerly load them here (outside hook context)
// to populate the module map before any test module is imported.
await loadViteConfig(process.cwd())

// Initialize DOM globals (window, addEventListener, etc.) so that
// .svelte.ts files using browser APIs don't crash in Node.js
initGlobals()

// Use shared cache manager for all Svelte compilation
// Helper to get or compile a Svelte file with caching
const compileSvelteFile = async (filePath: string): Promise<string | undefined> => {
  const id = traceStart(`compileSvelteWithWrite ${path.basename(filePath)}`)

  try {
    const result = await cacheManager.getOrCompile(filePath, async () =>
      compileSvelteWithWrite(filePath),
    )
    traceEnd(
      id,
      result?.cacheStatus?.cached ? `cached [${result.cacheStatus.source || '?'}]` : 'compiled',
    )
    if (result?.importUrl) {
      await writeQueue.flushPath(result.importUrl.replace('file://', ''))
      return result.importUrl
    }
    if (result?.js) {
      const tmpFile = getTempFilePath(filePath)
      const tmpFileAbs = path.resolve(process.cwd(), tmpFile)
      await writeQueue.flushPath(tmpFileAbs)
      return pathToFileURL(tmpFileAbs).href
    }
    traceEnd(id, 'ERROR: no result')
    return undefined
  } catch (e) {
    traceEnd(id, `ERROR: ${(e as Error).message}`)
    throw e
  }
}

// Node cannot load raw .svelte sources - if the resolved file is a .svelte
// component, compile it first and return the compiled module URL instead of
// the raw file URL (the load hook has no handler for .svelte URLs).
const returnFileUrl = async (filePath: string): Promise<{ url: string; shortCircuit: boolean }> => {
  if (svelteAvailable && filePath.endsWith('.svelte')) {
    const importUrl = await compileSvelteFile(filePath)
    if (importUrl) {
      return { url: importUrl, shortCircuit: true }
    }
  }
  return { url: pathToFileURL(filePath).href, shortCircuit: true }
}

export const resolve = async (
  specifier: string,
  context: { parentURL?: string },
  nextResolve: (specifier: string, context?: object) => Promise<{ url: string }>,
): Promise<{ url: string; shortCircuit?: boolean }> => {
  const id = traceStart(`tsLoader.resolve ${specifier.split('/').pop() || specifier}`)
  try {
    return await resolveImpl(specifier, context, nextResolve)
  } finally {
    traceEnd(id)
  }
}

// Resolve a $app/* import to the built-in shims directory.
// Returns the absolute shim path or null if no shim exists.
const resolveAppImport = async (importPath: string): Promise<string | null> => {
  const loaderDir = path.dirname(new URL(import.meta.url).pathname)
  // loaderDir is .../bin/lib - go up two levels to reach .../src or .../dist
  const shimsDir = path.join(loaderDir, '..', '..', 'lib', 'svelte', 'shims', '$app')
  const shimPath = path.join(shimsDir, importPath.slice(5))
  const withExtensions = ['.ts', '.js', '/index.ts', '/index.js']
  for (const ext of withExtensions) {
    if (await fs.exists(shimPath + ext)) {
      return shimPath + ext
    }
  }
  return null
}

// Node's default ESM conditions resolve the bare `svelte` import to the server
// entry (the `default` condition of svelte's package exports), but this
// framework always mounts components with the client runtime. Svelte's runtime
// state (component_context for setContext/getContext, listeners, ...) lives in
// per-module globals, so the whole test graph must share a single client
// instance. When svelte's exports declare a `browser` condition for the
// corresponding subpath (the client variant), resolve to that file instead.
// Driven by svelte's own exports map so it adapts to future svelte versions.
let svelteExportsCache: Record<string, unknown> | null | undefined

const resolveSvelteBrowserTarget = async (specifier: string): Promise<string | null> => {
  if (specifier !== 'svelte' && !specifier.startsWith('svelte/')) {
    return null
  }

  if (svelteExportsCache === undefined) {
    try {
      const pkgPath = path.join(process.cwd(), 'node_modules', 'svelte', 'package.json')
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
      svelteExportsCache = is.objectNative(pkg.exports)
        ? (pkg.exports as Record<string, unknown>)
        : null
    } catch {
      svelteExportsCache = null
    }
  }

  const exportsMap = svelteExportsCache
  if (!exportsMap) {
    return null
  }

  const exportsKey = specifier === 'svelte' ? '.' : `.${specifier.slice('svelte'.length)}`
  const entry = exportsMap[exportsKey]
  if (is.objectNative(entry)) {
    const browser = (entry as Record<string, unknown>).browser
    if (is.str(browser)) {
      return path.join(process.cwd(), 'node_modules', 'svelte', browser)
    }
  }

  return null
}

// Resolve a bare package specifier to an entry file of the REAL node_modules
// package (not the cache's partial mirror). Handles the exports map (import /
// module / browser / default conditions) with main/module fallbacks. Returns
// null when nothing resolvable is found so callers can fall back.
const resolveRealPackageEntry = async (specifier: string): Promise<string | null> => {
  const parts = specifier.split('/')
  const isScoped = specifier.startsWith('@')
  const pkgName = isScoped ? parts.slice(0, 2).join('/') : parts[0]
  const subpath = isScoped ? parts.slice(2).join('/') : parts.slice(1).join('/')
  if (!pkgName) {
    return null
  }
  const pkgDir = path.join(process.cwd(), 'node_modules', pkgName)
  const pkgJsonPath = path.join(pkgDir, 'package.json')
  if (!(await fs.exists(pkgJsonPath))) {
    return null
  }
  let pkg: Record<string, unknown>
  try {
    pkg = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'))
  } catch {
    return null
  }
  const pick = (value: unknown): string | null => {
    if (is.str(value)) {
      return value
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>
      for (const cond of ['import', 'module', 'browser', 'default']) {
        if (cond in obj) {
          const picked = pick(obj[cond])
          if (picked) {
            return picked
          }
        }
      }
    }
    return null
  }
  let rel: string | null = null
  const exportsMap = pkg.exports
  if (exportsMap && typeof exportsMap === 'object' && !Array.isArray(exportsMap)) {
    const obj = exportsMap as Record<string, unknown>
    const key = subpath ? `./${subpath}` : '.'
    if (key in obj) {
      rel = pick(obj[key])
    }
  }
  if (!rel && !subpath) {
    rel = pick(pkg.module) || pick(pkg.main)
  }
  if (!rel) {
    return null
  }
  const candidates = [path.join(pkgDir, rel)]
  if (rel.endsWith('.js')) {
    candidates.push(path.join(pkgDir, rel.slice(0, -3) + '.ts'))
    candidates.push(path.join(pkgDir, rel.slice(0, -3) + '.mjs'))
  }
  for (const candidate of candidates) {
    if (await fs.exists(candidate)) {
      return candidate
    }
  }
  return null
}

const resolveImpl = async (
  specifier: string,
  context: { parentURL?: string },
  nextResolve: (specifier: string, context?: object) => Promise<{ url: string }>,
): Promise<{ url: string; shortCircuit?: boolean }> => {
  try {
    // svelte runtime: prefer the `browser` (client) variant so that dependencies
    // importing bare `svelte` (e.g. svelte-maplibre's context.svelte.js)
    // share the client runtime instance used by mount() - a single
    // component_context for setContext/getContext.
    if (specifier === 'svelte' || specifier.startsWith('svelte/')) {
      const browserTarget = await resolveSvelteBrowserTarget(specifier)
      if (browserTarget && (await fs.exists(browserTarget))) {
        return { url: pathToFileURL(browserTarget).href, shortCircuit: true }
      }
    }

    // Direct handling of $app imports - resolve to built-in shims
    if (specifier.startsWith('$app')) {
      const resolved = await resolveAppImport(specifier)
      if (resolved) {
        return { url: pathToFileURL(resolved).href, shortCircuit: true }
      }
    }

    // Bare package imports from files living inside CACHE_DIR (transpiled test
    // files, compiled components) would resolve against the cache's partial
    // `node_modules` mirror (compiled .svelte.js files only, no package.json)
    // and fail. Resolve such specifiers against the real node_modules instead.
    if (
      context.parentURL &&
      context.parentURL.startsWith('file://') &&
      !specifier.startsWith('.') &&
      !specifier.startsWith('#') &&
      !specifier.startsWith('$') &&
      !specifier.startsWith('file:') &&
      !specifier.startsWith('node:') &&
      new URL(context.parentURL).pathname.startsWith(path.join(process.cwd(), CACHE_DIR) + path.sep)
    ) {
      const entry = await resolveRealPackageEntry(specifier)
      if (entry) {
        return { url: pathToFileURL(entry).href, shortCircuit: true }
      }
    }

    // Handle .js -> .ts conversion for absolute file:// URLs
    if (specifier.endsWith('.js') && specifier.startsWith('file://')) {
      const tsUrl = specifier.replace(/\.js$/, '.ts')
      const tsPath = tsUrl.replace('file://', '')
      if (await fs.exists(tsPath)) {
        return { url: tsUrl, shortCircuit: true }
      }
    }

    // Handle .js -> .ts conversion for imports without compiled JS
    if (specifier.endsWith('.js') && context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      const jsPath = path.resolve(parentDir, specifier)
      const tsPath = jsPath.slice(0, -3) + '.ts'
      if (await fs.exists(tsPath)) {
        return nextResolve(specifier.replace(/\.js$/, '.ts'), context)
      }
    }

    // Try alias resolution — skip if parent is already being loaded (prevents circular deps)
    if (context.parentURL) {
      try {
        if (currentlyLoading.has(context.parentURL)) {
          return nextResolve(specifier, context)
        }
        const aliasResolved = await resolveAlias(specifier, new URL(context.parentURL).pathname, {
          includeShims: true,
        })
        if (aliasResolved) {
          // Check if resolved path exists, try extensions if not
          const withExtensions = ['', '.ts', '.svelte.ts', '.js', '/index.ts', '/index.js']
          for (const ext of withExtensions) {
            if (await fs.exists(aliasResolved + ext)) {
              return await returnFileUrl(aliasResolved + ext)
            }
          }
          return await returnFileUrl(aliasResolved)
        }
      } catch (e) {
        log.error('Error', e)
      }
    }

    // Handle .svelte files
    if (svelteAvailable && specifier.endsWith('.svelte') && context.parentURL) {
      let resolvedPath: string
      if (specifier.startsWith('file://')) {
        resolvedPath = specifier.replace('file://', '')
      } else {
        const parentDir = path.dirname(new URL(context.parentURL).pathname)
        resolvedPath = path.resolve(parentDir, specifier)
      }
      if (await fs.exists(resolvedPath)) {
        const importUrl = await compileSvelteFile(resolvedPath)
        if (importUrl) {
          return { url: importUrl, shortCircuit: true }
        }
      }
    }

    // Handle .svelte.js files with Svelte 5 runes
    if (svelteAvailable && specifier.endsWith('.svelte.js') && context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      const resolvedPath = path.resolve(parentDir, specifier)
      if (await fs.exists(resolvedPath)) {
        const source = await fs.readFile(resolvedPath, 'utf-8')
        const hasRune = hasSvelteRunes(source)
        if (hasRune) {
          try {
            const compiler = await getCompileModule()
            const result = compiler.compileModule(source, { filename: resolvedPath })
            const jsCode = String(result.js.code)
            const processed = await processImports(jsCode, resolvedPath)
            const transformed = transformForNode(processed, resolvedPath)
            const importUrl = pathToFileURL(await writeTempFile(resolvedPath, transformed)).href
            return { url: importUrl, shortCircuit: true }
          } catch {
            // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
            // Fall through to let Node.js handle it
          }
        }
      }
    }

    // Handle scoped packages (non-magic)
    if (specifier.startsWith('@') && specifier.includes('/') && context.parentURL) {
      if (specifier.startsWith('@magic/')) {
        return nextResolve(specifier, context)
      }
      const parts = specifier.split('/')
      const packageName = parts[0] + '/' + parts[1]
      const nodeModulesPath = path.join(process.cwd(), 'node_modules', packageName)
      const pkgPath = path.join(nodeModulesPath, 'package.json')

      if (await fs.exists(pkgPath)) {
        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))

        if (svelteAvailable && pkg.exports?.['.']?.svelte && !pkg.exports?.['.']?.import) {
          const sveltePath = path.join(nodeModulesPath, pkg.exports['.'].svelte)
          if (await fs.exists(sveltePath)) {
            const importUrl = await compileSvelteFile(sveltePath)
            if (importUrl) {
              return { url: importUrl, shortCircuit: true }
            }
          }
        }

        if (pkg.exports) {
          const parts = specifier.split('/')
          const subpath = parts.slice(2).join('/')
          for (const [key, val] of Object.entries(pkg.exports)) {
            if (key !== '.' && is.str(val)) {
              const keyWithoutExt = key.replace(/\.js$/, '').replace(/\.mjs$/, '')
              const subpathWithoutExt = subpath.replace(/\.js$/, '').replace(/\.mjs$/, '')
              if (
                key === `./${subpath}` ||
                key === `./${subpath}.js` ||
                keyWithoutExt === `./${subpathWithoutExt}`
              ) {
                const jsPath = path.join(nodeModulesPath, val)
                if (await fs.exists(jsPath)) {
                  return { url: pathToFileURL(jsPath).href, shortCircuit: true }
                }
              }
            }
          }
        }
      }
    }

    // Handle relative imports without extension - check .svelte
    if (
      svelteAvailable &&
      specifier.startsWith('.') &&
      !specifier.endsWith('.ts') &&
      !specifier.endsWith('.js') &&
      !specifier.endsWith('.mjs')
    ) {
      if (context.parentURL) {
        const parentDir = path.dirname(new URL(context.parentURL).pathname)
        const sveltePath = path.resolve(parentDir, specifier + '.svelte')
        const svelteTsPath = path.resolve(parentDir, specifier + '.svelte.ts')
        const svelteJsPath = path.resolve(parentDir, specifier + '.svelte.js')

        const sveltePathExists = await fs.exists(sveltePath)
        const svelteTsPathExists = await fs.exists(svelteTsPath)
        const svelteJsPathExists = await fs.exists(svelteJsPath)

        let finalSveltePath: string | undefined = undefined

        if (sveltePathExists) {
          finalSveltePath = sveltePath
        } else if (svelteTsPathExists) {
          finalSveltePath = svelteTsPath
        } else if (svelteJsPathExists) {
          finalSveltePath = svelteJsPath
        }

        if (finalSveltePath) {
          const importUrl = await compileSvelteFile(finalSveltePath)
          if (importUrl) {
            return { url: importUrl, shortCircuit: true }
          }
        }

        const tsPath = path.resolve(parentDir, specifier + '.ts')
        const jsPath = path.resolve(parentDir, specifier + '.js')
        if (await fs.exists(tsPath)) {
          return { url: pathToFileURL(tsPath).href, shortCircuit: true }
        }
        if (await fs.exists(jsPath)) {
          return { url: pathToFileURL(jsPath).href, shortCircuit: true }
        }
      }
    }

    // Handle explicit .ts imports (e.g., import './file.ts')
    if (specifier.endsWith('.ts') && context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      const tsPath = path.resolve(parentDir, specifier)
      if (await fs.exists(tsPath)) {
        return { url: pathToFileURL(tsPath).href, shortCircuit: true }
      }
    }

    // Handle #-prefixed import map specifiers (defined in package.json imports field)
    // e.g. #src/lib/stats/info.js -> src/lib/stats/info.ts, #lib/actions/clickOutside.svelte.js -> src/lib/actions/clickOutside.svelte.ts
    if (specifier.startsWith('#')) {
      // Use the nearest package.json to the importing module (not process.cwd())
      // so import maps from nested packages (e.g. node_modules/@magic/test) work too.
      let pkgJsonPath: string
      if (context.parentURL && !context.parentURL.startsWith('data:')) {
        pkgJsonPath = await findNearestPackageJson(new URL(context.parentURL).pathname)
      } else {
        pkgJsonPath = path.resolve(process.cwd(), 'package.json')
      }
      const packageRoot = path.dirname(pkgJsonPath)
      if (await fs.exists(pkgJsonPath)) {
        try {
          const pkgRaw = await fs.readFile(pkgJsonPath, 'utf-8')
          const pkg = JSON.parse(pkgRaw)
          const imports = pkg.imports as Record<string, unknown> | undefined
          if (is.objectNative(imports)) {
            let target: string | undefined
            let suffix: string | undefined

            // 1) Exact match: "#client": "./src/internal/client.js"
            if (is.string(imports[specifier])) {
              target = imports[specifier]
            } else {
              // 2) Wildcard match, longest prefix wins:
              //    "#lib/*": "./src/lib/*"
              // 3) Parent-key base-dir match, longest prefix wins:
              //    "#lib": "./src/lib/index.js" resolves "#lib/forms/Button.svelte"
              //    to "./src/lib/forms/Button.svelte"
              let bestLen = -1
              for (const [key, value] of Object.entries(imports)) {
                if (!is.string(value)) {
                  continue
                }
                if (key.endsWith('*')) {
                  const prefix = key.slice(0, -1)
                  if (specifier.startsWith(prefix) && prefix.length > bestLen) {
                    target = value
                    suffix = specifier.slice(prefix.length)
                    bestLen = prefix.length
                  }
                } else if (key !== specifier) {
                  const sep = key + '/'
                  if (specifier.startsWith(sep) && key.length > bestLen) {
                    target = value
                    suffix = specifier.slice(sep.length)
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
              const fullResolvedPath = path.resolve(packageRoot, local)
              let finalPath: string | undefined
              if (await fs.exists(fullResolvedPath)) {
                finalPath = fullResolvedPath
              } else if (path.extname(fullResolvedPath) === '.js') {
                // If the resolved path has .js extension but the file is .ts, try .ts instead
                const tsPath = fullResolvedPath.slice(0, -3) + '.ts'
                if (await fs.exists(tsPath)) {
                  finalPath = tsPath
                }
              }
              if (!finalPath) {
                // Try with extensions
                for (const ext of ['.svelte', '.js', '.ts']) {
                  const candidate = fullResolvedPath + ext
                  if (await fs.exists(candidate)) {
                    finalPath = candidate
                    break
                  }
                }
              }
              // Try as directory with index
              if (!finalPath) {
                for (const ext of ['/index.svelte', '/index.js', '/index.ts']) {
                  const candidate = fullResolvedPath + ext
                  if (await fs.exists(candidate)) {
                    finalPath = candidate
                    break
                  }
                }
              }
              if (finalPath) {
                return await returnFileUrl(finalPath)
              }
            }
          }
        } catch {
          // ignore - fallback to other resolution
        }
      }
    }
  } catch (e) {
    log.error('Error resolving file', e)
    throw e
  }

  return nextResolve(specifier, context)
}

const transpileWithTypeScript = (code: string): string => {
  const id = traceStart('tsLoader.transpile')
  const output = transpileWithTypescript(code)
  traceEnd(id)
  return output
}

const resolveDollarLibImports = async (code: string, filePath: string): Promise<string> => {
  const imports = extractImportsSync(code)
  const dollarImports = imports.filter(i => {
    if (!i.source) {
      return false
    }
    return i.source.startsWith('$lib') || i.source.startsWith('$app')
  })
  if (dollarImports.length === 0) {
    return code
  }

  const replacements: Array<{ original: string; replacement: string }> = []
  const parentDir = path.dirname(filePath)

  for (const imp of dollarImports) {
    let resolved: string | null

    if (imp.source.startsWith('$app')) {
      // Resolve $app imports directly to built-in shims
      resolved = await resolveAppImport(imp.source)
    } else {
      resolved = await resolveAlias(imp.source, parentDir, { includeShims: true })
    }

    if (resolved) {
      replacements.push({
        original: imp.originalText || `import { ${imp.specifiers} } from '${imp.source}'`,
        replacement: `import ${imp.specifiers} from '${pathToFileURL(resolved).href}'`,
      })
    }
  }

  for (const { original, replacement } of replacements) {
    code = code.replace(original, replacement)
  }
  return code
}

export const load = async (
  url: string,
  context: { format?: string },
  nextLoad: (url: string, context?: object) => Promise<{ format?: string; source?: string }>,
): Promise<{ format?: string; source?: string; shortCircuit?: boolean }> => {
  const id = traceStart(`tsLoader.load ${url.split('/').pop() || url}`)
  try {
    return await loadImpl(url, context, nextLoad)
  } finally {
    traceEnd(id)
  }
}

const loadImpl = async (
  url: string,
  context: { format?: string },
  nextLoad: (url: string, context?: object) => Promise<{ format?: string; source?: string }>,
): Promise<{ format?: string; source?: string; shortCircuit?: boolean }> => {
  // Track file loading to prevent circular dependency hangs
  const wasLoading = currentlyLoading.has(url)
  currentlyLoading.add(url)

  try {
    return await loadImplInner(url, context, nextLoad)
  } finally {
    // Only remove if it wasn't already being tracked (prevents clearing for nested loads)
    if (!wasLoading) {
      currentlyLoading.delete(url)
    }
  }
}

const loadImplInner = async (
  url: string,
  context: { format?: string },
  nextLoad: (url: string, context?: object) => Promise<{ format?: string; source?: string }>,
): Promise<{ format?: string; source?: string; shortCircuit?: boolean }> => {
  if (url.includes('/magic/util/test/src/') && url.endsWith('.js')) {
    const tsUrl = url.replace(/\.js$/, '.ts')
    const filePath = tsUrl.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')
      return { format: 'module', source, shortCircuit: true }
    }
  }

  if (svelteAvailable && url.endsWith('.svelte.ts')) {
    const filePath = url.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')
      const withResolvedImports = await resolveDollarLibImports(source, filePath)
      const transpiled = transpileWithTypeScript(withResolvedImports)

      try {
        const compiler = await getCompileModule()
        const result = compiler.compileModule(transpiled, { filename: filePath })
        return {
          format: 'module',
          source: result.js.code,
          shortCircuit: true,
        }
      } catch {
        // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
        // Fall back to TypeScript transpilation only
        return {
          format: 'module',
          source: transpiled,
          shortCircuit: true,
        }
      }
    }
  }

  if (svelteAvailable && url.endsWith('.svelte.js')) {
    const filePath = url.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')
      const withResolvedImports = await resolveDollarLibImports(source, filePath)
      const transpiled = transpileWithTypeScript(withResolvedImports)

      try {
        const compiler = await getCompileModule()
        const result = compiler.compileModule(transpiled, { filename: filePath })
        return {
          format: 'module',
          source: result.js.code,
          shortCircuit: true,
        }
      } catch {
        // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
        // Fall back to TypeScript transpilation only
        return {
          format: 'module',
          source: transpiled,
          shortCircuit: true,
        }
      }
    }
  }

  if (url.endsWith('.ts') && !url.includes('/magic/util/test/src/')) {
    const filePath = url.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')
      const withResolvedImports = await resolveDollarLibImports(source, filePath)
      const transpiled = transpileWithTypeScript(withResolvedImports)
      // No in-memory preamble (e.g. a globalThis.addEventListener shim): the
      // loader-init initGlobals() already installs those globals, and any
      // in-memory-only prefix would shift V8 coverage offsets for c8 (c8
      // remaps against the on-disk file, which has no such prefix), showing
      // up as phantom uncovered import lines.
      return {
        format: 'module',
        source: transpiled,
        shortCircuit: true,
      }
    }
  }

  if (url.endsWith('.mjs')) {
    const filePath = url.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')

      const hasTypeScript =
        source.includes('import type') ||
        source.includes(' as const') ||
        source.includes(' as ') ||
        source.includes('satisfies') ||
        source.includes('declare ')

      if (hasTypeScript) {
        const transpiled = transpileWithTypeScript(source)
        return { format: 'module', source: transpiled, shortCircuit: true }
      }
    }
  }

  if (url.endsWith('.css')) {
    return { format: 'module', source: 'export default ""', shortCircuit: true }
  }

  return nextLoad(url, context)
}
