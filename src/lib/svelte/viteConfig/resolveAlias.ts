import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'

import { LRUCache } from '../../caches/LRUCache.js'
import { findProjectRoot } from './findProjectRoot.js'
import { parseTsConfig } from './parseTsConfig.js'
import { loadViteAliases } from './loadViteAliases.js'
import { classifyImport } from './classifyImport.js'
import { findConfigFile } from './findConfigFile.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
import type { AliasEntry } from './cache.js'

export interface ResolveAliasOptions {
  includeShims?: boolean
}

/**
 * Fast-path state for the combined vite+ts alias set of a project root.
 *
 * resolveAlias runs on EVERY import resolution (thousands of times per
 * process). The underlying loadViteAliases/parseTsConfig re-validate their
 * caches against the filesystem on every call — 5 config-name existence
 * probes plus stats — because configs may appear, disappear or change
 * mid-run (tests write vite.config.js). That is 6-8 syscalls per resolve.
 *
 * A single stat of the root directory is a cheaper, equally valid signal
 * for the appear/disappear case: any file creation or deletion inside a
 * directory updates the directory mtime. In-place modification of an
 * already-tracked config is caught by stat'ing that one file. So the
 * steady state costs 2-3 syscalls instead of 6-8 while preserving the same
 * invalidation guarantees (appear / delete / modify all invalidate).
 *
 * The state is per-thread like the other alias caches (the ESM loader has
 * its own module instances) — it is just a further layer in front of the
 * per-function validators, which remain the source of truth.
 */
interface RootAliasState {
  rootMtimeMs: number
  tsconfig: { mtimeMs: number; size: number } | null
  vite: { path: string; mtimeMs: number; size: number } | null
  aliases: AliasEntry[]
}

const rootAliasState = new LRUCache<RootAliasState>(200)

const refreshRootAliasState = async (rootDir: string): Promise<RootAliasState> => {
  const [viteAliases, tsAliases, rootStat] = await Promise.all([
    loadViteAliases(rootDir),
    parseTsConfig(rootDir),
    fs.stat(rootDir).catch(() => null),
  ])

  const tsconfigPath = path.join(rootDir, 'tsconfig.json')
  const tsStat = await fs.stat(tsconfigPath).catch(() => null)
  const viteConfigPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)
  const viteStat = viteConfigPath ? await fs.stat(viteConfigPath).catch(() => null) : null

  const state: RootAliasState = {
    rootMtimeMs: rootStat ? rootStat.mtimeMs : -1,
    tsconfig: tsStat ? { mtimeMs: tsStat.mtimeMs, size: tsStat.size } : null,
    vite:
      viteStat && viteConfigPath
        ? { path: viteConfigPath, mtimeMs: viteStat.mtimeMs, size: viteStat.size }
        : null,
    aliases: [...viteAliases, ...tsAliases],
  }
  rootAliasState.set(rootDir, state)
  return state
}

const getRootAliases = async (rootDir: string): Promise<AliasEntry[]> => {
  const state = rootAliasState.get(rootDir)
  if (state) {
    const rootStat = await fs.stat(rootDir).catch(() => null)
    if (rootStat && rootStat.mtimeMs === state.rootMtimeMs) {
      // Root unchanged since the last refresh: no file could have appeared
      // or been deleted. Only in-place edits of the tracked configs remain
      // possible — check exactly those (one stat each, zero when untracked).
      if (state.tsconfig) {
        const tsStat = await fs.stat(path.join(rootDir, 'tsconfig.json')).catch(() => null)
        if (
          !tsStat ||
          tsStat.mtimeMs !== state.tsconfig.mtimeMs ||
          tsStat.size !== state.tsconfig.size
        ) {
          return (await refreshRootAliasState(rootDir)).aliases
        }
      }
      if (state.vite) {
        const viteStat = await fs.stat(state.vite.path).catch(() => null)
        if (
          !viteStat ||
          viteStat.mtimeMs !== state.vite.mtimeMs ||
          viteStat.size !== state.vite.size
        ) {
          return (await refreshRootAliasState(rootDir)).aliases
        }
      }
      return state.aliases
    }
  }
  return (await refreshRootAliasState(rootDir)).aliases
}

export const resolveAlias = async (
  importPath: string,
  sourceFilePath: string,
  options: ResolveAliasOptions = {},
): Promise<string | null> => {
  const { includeShims } = options
  const importType = classifyImport(importPath)

  // For non-shim mode, only process relative, vite-alias and scoped imports
  if (
    !includeShims &&
    importType !== 'relative' &&
    importType !== 'vite-alias' &&
    importType !== 'scoped'
  ) {
    return null
  }

  // For shim mode, also handle bare imports
  if (
    includeShims &&
    importType !== 'vite-alias' &&
    importType !== 'bare' &&
    importType !== 'scoped'
  ) {
    return null
  }

  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)

  const allAliases = await getRootAliases(rootDir)

  for (const { find, replacement } of allAliases) {
    let resolved: string | null = null

    if (is.string(find)) {
      if (importPath === find || importPath.startsWith(find + '/')) {
        if (importPath === find) {
          resolved = replacement
        } else {
          resolved = importPath.replace(find, replacement)
        }
      }
    } else if (is.regex(find)) {
      const match = importPath.match(find)
      if (match) {
        resolved = importPath.replace(find, replacement)
      }
    }

    if (resolved) {
      // Remote URL alias targets (e.g. a custom engine build served over
      // http/https) are not local files: return them as-is so the load hook
      // can fetch the source. fs.exists probing below is only for local paths.
      if (/^https?:\/\//.test(resolved)) {
        return resolved
      }
      // Try with extensions, handling .js->.ts conversion
      const withExtensions = [
        '',
        '.js',
        '.svelte',
        '.ts',
        '/index.js',
        '/index.svelte',
        '/index.ts',
      ]

      // Also try removing .js extension and adding .ts
      let baseResolved = resolved
      if (resolved.endsWith('.js')) {
        baseResolved = resolved.slice(0, -3) // remove .js
      }

      for (const ext of withExtensions) {
        const withExt = resolved + ext
        const exists = await fs.exists(withExt)
        if (exists) {
          // Skip if withExt is a directory and ext is empty (raw resolved path is a directory)
          if (ext === '') {
            try {
              const stat = await fs.stat(withExt)
              if (stat.isDirectory()) {
                continue
              }
            } catch {
              continue
            }
          }
          return withExt
        }
        // Also try without .js
        if (baseResolved !== resolved) {
          const noJsExt = baseResolved + ext
          if (await fs.exists(noJsExt)) {
            // Similarly, skip if noJsExt is a directory when ext is empty?
            // baseResolved likely is a file without extension, but if ext is '' then noJsExt = baseResolved (file). Check directory?
            if (ext === '') {
              try {
                const stat = await fs.stat(noJsExt)
                if (stat.isDirectory()) {
                  continue
                }
              } catch {
                continue
              }
            }
            return noJsExt
          }
        }
      }
    }
  }

  return null
}
