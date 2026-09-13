import fs from '@magic/fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveAlias } from '../../lib/svelte/viteConfig/resolveAlias.js'
import is from '@magic/types'
import log from '@magic/log'
import { traceStart, traceEnd } from '../../lib/trace/timing.js'
import { cacheManager } from '../../lib/caches/cache.js'
import { writeQueue } from '../../lib/svelte/compile/writeQueue.js'
import { hasSvelteRunes, extractImportsSync } from '../../lib/svelte/compile/astParse.js'
import { getTempFilePath } from '../../lib/svelte/compile/getTempFilePath.js'
import { transpileWithTypescript } from './tsTranspile.js'
import { compileSvelteWithWrite } from '../../lib/svelte/compile/compileSvelteWithWrite.js'
import { writeTempFile } from '../../lib/svelte/compile/resolveSvelteOnlyExports.js'
import { processImports } from '../../lib/svelte/compile/processImports.js'
import { transformForNode } from '../../lib/svelte/compile/transformForNode.js'
import { loadViteConfig } from '../../lib/svelte/viteConfig/loadViteConfig.js'
import { initGlobals } from '../../lib/dom/globals.js'
// Svelte is optional - only required when .svelte files are tested
let svelteAvailable = false
let svelteCompilerCache = null
try {
  const mod = await import('svelte/compiler')
  svelteCompilerCache = mod
  svelteAvailable = true
} catch {
  // svelte not installed, svelte-specific blocks will be skipped
}
const getCompileModule = () => {
  if (!svelteCompilerCache) {
    svelteCompilerCache = import('svelte/compiler')
  }
  return Promise.resolve(svelteCompilerCache)
}
// Track files currently being loaded to prevent circular dependency hangs
const currentlyLoading = new Set()
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
const compileSvelteFile = async filePath => {
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
    traceEnd(id, `ERROR: ${e.message}`)
    throw e
  }
}
export const resolve = async (specifier, context, nextResolve) => {
  const id = traceStart(`tsLoader.resolve ${specifier.split('/').pop() || specifier}`)
  try {
    return await resolveImpl(specifier, context, nextResolve)
  } finally {
    traceEnd(id)
  }
}
// Resolve a $app/* import to the built-in shims directory.
// Returns the absolute shim path or null if no shim exists.
const resolveAppImport = async importPath => {
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
const resolveImpl = async (specifier, context, nextResolve) => {
  try {
    // Direct handling of $app imports - resolve to built-in shims
    if (specifier.startsWith('$app')) {
      const resolved = await resolveAppImport(specifier)
      if (resolved) {
        return { url: pathToFileURL(resolved).href, shortCircuit: true }
      }
    }
    // Skip alias resolution if parent is already being loaded (prevents circular deps)
    if (context.parentURL && currentlyLoading.has(context.parentURL)) {
      return nextResolve(specifier, context)
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
    // Try alias resolution
    if (context.parentURL) {
      try {
        const aliasResolved = await resolveAlias(specifier, new URL(context.parentURL).pathname, {
          includeShims: true,
        })
        if (aliasResolved) {
          // Check if resolved path exists, try extensions if not
          const withExtensions = ['', '.ts', '.svelte.ts', '.js', '/index.ts', '/index.js']
          for (const ext of withExtensions) {
            if (await fs.exists(aliasResolved + ext)) {
              return { url: pathToFileURL(aliasResolved + ext).href, shortCircuit: true }
            }
          }
          return { url: pathToFileURL(aliasResolved).href, shortCircuit: true }
        }
      } catch (e) {
        log.error('Error', e)
      }
    }
    // Handle .svelte files
    if (svelteAvailable && specifier.endsWith('.svelte') && context.parentURL) {
      let resolvedPath
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
        let finalSveltePath = undefined
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
  } catch (e) {
    log.error('Error resolving file', e)
    throw e
  }
  return nextResolve(specifier, context)
}
const transpileWithTypeScript = code => {
  const id = traceStart('tsLoader.transpile')
  const output = transpileWithTypescript(code)
  traceEnd(id)
  return output
}
const resolveDollarLibImports = async (code, filePath) => {
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
  const replacements = []
  const parentDir = path.dirname(filePath)
  for (const imp of dollarImports) {
    let resolved
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
export const load = async (url, context, nextLoad) => {
  const id = traceStart(`tsLoader.load ${url.split('/').pop() || url}`)
  try {
    return await loadImpl(url, context, nextLoad)
  } finally {
    traceEnd(id)
  }
}
const loadImpl = async (url, context, nextLoad) => {
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
const loadImplInner = async (url, context, nextLoad) => {
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
          source:
            ';typeof globalThis.addEventListener !== "function" && (globalThis.addEventListener = function(){}); ' +
            result.js.code,
          shortCircuit: true,
        }
      } catch {
        // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
        // Fall back to TypeScript transpilation only
        return {
          format: 'module',
          source:
            ';typeof globalThis.addEventListener !== "function" && (globalThis.addEventListener = function(){}); ' +
            transpiled,
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
          source:
            ';typeof globalThis.addEventListener !== "function" && (globalThis.addEventListener = function(){}); ' +
            result.js.code,
          shortCircuit: true,
        }
      } catch {
        // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
        // Fall back to TypeScript transpilation only
        return {
          format: 'module',
          source:
            ';typeof globalThis.addEventListener !== "function" && (globalThis.addEventListener = function(){}); ' +
            transpiled,
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
      return {
        format: 'module',
        source:
          ';typeof globalThis.addEventListener !== "function" && (globalThis.addEventListener = function(){}); ' +
          transpiled,
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
