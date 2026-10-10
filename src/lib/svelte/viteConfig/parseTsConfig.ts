import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'

import { stripJsonComments } from './stripJsonComments.ts'
import { escapeRegex } from './escapeRegex.ts'

import { aliasCache, type AliasEntry } from './cache.ts'

// mtime + size of the tsconfig last parsed per root (null = no tsconfig.json).
// This module keeps per-thread state — the ESM loader runs in its own
// thread with its own cache — so cached entries are validated against the
// filesystem on every lookup: a tsconfig may appear or change after the
// first lookup (e.g. SvelteKit scaffolds one during a run).
const loadedTsconfigMeta = new Map<string, { mtime: number; size: number } | null>()

interface TSConfig {
  compilerOptions?: {
    baseUrl?: string
    paths?: Record<string, string[]>
  }
}

export const parseTsConfig = async (rootDir: string): Promise<AliasEntry[]> => {
  const cacheKey = rootDir + ':tsconfig'
  const cached = aliasCache.get(cacheKey)

  if (cached) {
    if (loadedTsconfigMeta.has(rootDir)) {
      const tsconfigPath = path.join(rootDir, 'tsconfig.json')
      const recorded = loadedTsconfigMeta.get(rootDir)
      if (!recorded) {
        if (!(await fs.exists(tsconfigPath))) {
          return cached
        }
      } else {
        try {
          const stat = await fs.stat(tsconfigPath)
          if (stat.mtimeMs === recorded.mtime && stat.size === recorded.size) {
            return cached
          }
        } catch {
          // Unreadable — fall through and re-parse
        }
      }
    }
  }

  const tsconfigPath = path.join(rootDir, 'tsconfig.json')
  const exists = await fs.exists(tsconfigPath)

  if (!exists) {
    aliasCache.set(cacheKey, [])
    loadedTsconfigMeta.set(rootDir, null)
    return []
  }

  try {
    const rawContent = await fs.readFile(tsconfigPath, 'utf-8')
    const content = stripJsonComments(rawContent)
    const tsconfig = JSON.parse(content) as TSConfig
    const baseUrl = tsconfig.compilerOptions?.baseUrl || '.'
    let paths: Record<string, string[]> = tsconfig.compilerOptions?.paths || {}

    // Also check .svelte-kit/tsconfig.json for additional paths (like $lib)
    const svelteKitTsconfigPath = path.join(rootDir, '.svelte-kit', 'tsconfig.json')
    const svelteKitExists = await fs.exists(svelteKitTsconfigPath)

    if (svelteKitExists) {
      const svelteKitRaw = await fs.readFile(svelteKitTsconfigPath, 'utf-8')
      const svelteKitConfig = JSON.parse(svelteKitRaw) as TSConfig
      const svelteKitPaths = svelteKitConfig.compilerOptions?.paths || {}
      // Normalize svelte-kit paths that use ../ to point to correct location
      const normalizedSvelteKitPaths: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(svelteKitPaths)) {
        if (is.array(value) && value[0]?.startsWith('../')) {
          // ../src/lib/* -> the ../ is relative to .svelte-kit/, so we need to go UP one level
          // then back to src/lib/. So ../src/lib/* becomes src/lib/*
          const normalizedTarget = value[0].replace(/^\.\.\//, '')
          normalizedSvelteKitPaths[key] = [normalizedTarget]
        } else {
          normalizedSvelteKitPaths[key] = value
        }
      }

      // Merge paths, with svelte-kit paths taking precedence
      paths = { ...paths, ...normalizedSvelteKitPaths }
    }

    const resolvedBaseUrl = path.isAbsolute(baseUrl) ? baseUrl : path.resolve(rootDir, baseUrl)

    const aliases = Object.entries(paths).map(([pattern, targets]) => {
      const target = targets[0]
      if (!target) {
        return null
      }

      const hasWildcard = pattern.endsWith('*') && !pattern.startsWith('^')
      const hasTargetWildcard = target.endsWith('*')

      let find

      let replacement

      if (hasWildcard) {
        const prefix = pattern.slice(0, -1)
        find = new RegExp(`^${escapeRegex(prefix)}(.*)`)

        if (hasTargetWildcard) {
          const targetPrefix = target.slice(0, -1)
          // If target is absolute (starts with /), use it directly without path.sep
          // Otherwise resolve relative to baseUrl
          if (targetPrefix.startsWith('/')) {
            replacement = targetPrefix + '$1'
          } else {
            replacement = path.resolve(resolvedBaseUrl, targetPrefix) + path.sep + '$1'
          }
        } else if (target.startsWith('/')) {
          // Absolute path without wildcard
          replacement = target
        } else {
          replacement = path.resolve(resolvedBaseUrl, target)
        }
      } else {
        find = pattern
        replacement = path.resolve(resolvedBaseUrl, target)
      }

      return { find, replacement }
    })

    const filteredAliases = aliases.filter(x => x !== null)
    aliasCache.set(cacheKey, filteredAliases as AliasEntry[])
    const stat = await fs.stat(tsconfigPath)
    loadedTsconfigMeta.set(rootDir, { mtime: stat.mtimeMs, size: stat.size })
    return filteredAliases as AliasEntry[]
  } catch (e) {
    const message = is.error(e) ? e.message : String(e)
    console.warn(`[svelte-alias] Failed to parse tsconfig.json: ${message}`)
    return []
  }
}
