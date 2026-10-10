import { AsyncLocalStorage } from 'node:async_hooks'
import fs from '@magic/fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { findConfigFile } from './findConfigFile.ts'

import { aliasCache, type AliasEntry } from './cache.ts'
import { normalizeAlias } from './normalizeAlias.ts'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.ts'

// In-flight loads per config path: concurrent callers (parallel tests)
// await the same promise instead of double-importing — a "someone is
// already loading" guard would hand the losers an empty alias list.
const pendingLoads = new Map<string, Promise<AliasEntry[]>>()

// Config paths being loaded in the CURRENT async chain. A true re-entrant
// call (the config's own import triggering another lookup) must not await
// its own pending promise — that deadlocks — so it gets the historical
// empty result. Concurrent (sibling) calls are unaffected and share the
// pending promise via pendingLoads.
const loadingStore = new AsyncLocalStorage<Set<string>>()

// mtime + size of the vite config last loaded per root (null = no config
// file). This module keeps per-thread state — the ESM loader runs in its own
// thread with its own cache — so cached entries are validated against the
// filesystem on every lookup: a vite config may appear, disappear or change
// after the first lookup (tests write vite.config.js mid-run, and clearing
// the main-thread caches does not reach the loader thread).
//
// mtime alone is not enough (writes within one filesystem tick tie), so the
// size is part of the validation too.
const loadedConfigMeta = new Map<string, { mtime: number; size: number } | null>()

const isCacheValid = async (rootDir: string): Promise<boolean> => {
  if (!loadedConfigMeta.has(rootDir)) {
    return false
  }
  const recorded = loadedConfigMeta.get(rootDir)
  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)
  if (!configPath) {
    return recorded === null
  }
  if (!recorded) {
    return false
  }
  try {
    const stat = await fs.stat(configPath)
    return stat.mtimeMs === recorded.mtime && stat.size === recorded.size
  } catch {
    return false
  }
}

export const loadViteAliases = async (rootDir: string): Promise<AliasEntry[]> => {
  const cacheKey = rootDir + ':vite'
  const cached = aliasCache.get(cacheKey)
  if (cached && (await isCacheValid(rootDir))) {
    return cached
  }

  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)

  if (!configPath) {
    aliasCache.set(cacheKey, [])
    loadedConfigMeta.set(rootDir, null)
    return []
  }

  const active = loadingStore.getStore()
  if (active?.has(configPath)) {
    // Re-entrant lookup from the config's own import chain
    return []
  }

  const pending = pendingLoads.get(configPath)
  if (pending) {
    return pending
  }

  const chain = active ? new Set([...active, configPath]) : new Set([configPath])
  const load = loadingStore.run(chain, async () => {
    try {
      const stat = await fs.stat(configPath)
      // Cache-bust with mtime+size so a changed config is re-evaluated —
      // Node's ESM module cache would otherwise return the stale module for
      // the same URL (mtime alone ties for sub-tick rewrites).
      const configUrl = `${pathToFileURL(configPath).href}?t=${stat.mtimeMs}-${stat.size}`
      const config = (await import(configUrl)).default ?? (await import(configUrl))
      const configDir = path.dirname(configPath)
      const resolveConfig = config.resolve as Record<string, unknown> | undefined
      const aliases = normalizeAlias(resolveConfig?.alias, configDir)

      aliasCache.set(cacheKey, aliases)
      loadedConfigMeta.set(rootDir, { mtime: stat.mtimeMs, size: stat.size })
      return aliases
    } catch {
      return []
    }
  })

  pendingLoads.set(configPath, load)
  try {
    return await load
  } finally {
    pendingLoads.delete(configPath)
  }
}
