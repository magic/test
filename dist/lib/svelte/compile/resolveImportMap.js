import path from 'node:path'
import fs from '@magic/fs'
import { existsCached } from '#src/lib/caches/pathCache.js'
import { CWD } from '#src/constants.js'
/**
 * Find the nearest package.json by walking up from the directory containing
 * `fromPath`. Node resolves "#-prefixed" import-map specifiers against the
 * package scope of the IMPORTING file, not against process.cwd() - so
 * compiling files from nested/workspace packages must use the nearest
 * package.json to find their "imports" mappings.
 *
 * Falls back to the CWD package.json if no package.json is found up the tree
 * (or the input is not an absolute path).
 */
export const findNearestPackageJson = async fromPath => {
  const fallback = path.resolve(CWD, 'package.json')
  if (!path.isAbsolute(fromPath)) {
    return fallback
  }
  let dir = path.dirname(fromPath)
  let stopped = false
  while (!stopped) {
    const candidate = path.join(dir, 'package.json')
    if (await existsCached(candidate)) {
      return candidate
    }
    const parent = path.dirname(dir)
    if (parent === dir) {
      stopped = true
    } else {
      dir = parent
    }
  }
  return fallback
}
/**
 * Resolve a "#-prefixed" import-map specifier against a package.json
 * "imports" mapping (e.g. "#lib/*": "./src/lib/*",
 * "#client": "./src/internal/client.js").
 *
 * Resolution rules (longest matching key wins):
 *   1) Exact match: "#client" -> "./src/internal/client.js"
 *   2) Wildcard match: "#lib/*" -> "./src/lib/*"
 *   3) Parent-key base-dir match: "#lib" -> "./src/lib/index.js" resolves
 *      "#lib/forms/Button.svelte" to "./src/lib/forms/Button.svelte"
 *
 * After mapping, .js -> .ts conversion and common extension/index fallbacks
 * are applied. Returns the absolute file path, or null if no mapping matches
 * or no candidate file exists.
 */
export const resolveImportMapSpecifier = async (specifier, pkgJsonPath) => {
  if (!specifier.startsWith('#') || !(await existsCached(pkgJsonPath))) {
    return null
  }
  try {
    const pkgRaw = await fs.readFile(pkgJsonPath, 'utf-8')
    const pkg = JSON.parse(pkgRaw)
    const imports = pkg.imports
    if (!imports || typeof imports !== 'object') {
      return null
    }
    let target
    let suffix
    // 1) Exact match: "#client": "./src/internal/client.js"
    if (typeof imports[specifier] === 'string') {
      target = imports[specifier]
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
    if (!target) {
      return null
    }
    // A file target (has extension) implies its directory as the base;
    // a directory target is used as the base directly.
    const isFile = path.extname(target) !== ''
    const local =
      suffix === undefined
        ? target
        : target.includes('*')
          ? target.replace('*', suffix)
          : path.join(isFile ? path.dirname(target) : target, suffix)
    const packageRoot = path.dirname(pkgJsonPath)
    const fullResolvedPath = path.resolve(packageRoot, local)
    if (await existsCached(fullResolvedPath)) {
      return fullResolvedPath
    }
    // If the resolved path has .js extension but the file is .ts, try .ts instead
    if (path.extname(fullResolvedPath) === '.js') {
      const tsPath = fullResolvedPath.slice(0, -3) + '.ts'
      if (await existsCached(tsPath)) {
        return tsPath
      }
    }
    // Try with extensions
    for (const ext of ['.svelte', '.js', '.ts']) {
      const candidate = fullResolvedPath + ext
      if (await existsCached(candidate)) {
        return candidate
      }
    }
    // Try as directory with index
    for (const ext of ['/index.svelte', '/index.js', '/index.ts']) {
      const candidate = fullResolvedPath + ext
      if (await existsCached(candidate)) {
        return candidate
      }
    }
    return null
  } catch {
    return null
  }
}
//# sourceMappingURL=resolveImportMap.js.map
