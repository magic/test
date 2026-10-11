/* ---------------------------------------------------------------------------
 * Disk cache for resolveSvelteOnlyExports results.
 *
 * resolveSvelteOnlyExports runs a full AST parse + per-specifier package
 * resolution on every test file during collection. In most projects the
 * overwhelming majority of test files contain no svelte imports and come out
 * completely unchanged, so the work is pure overhead that is repeated on
 * every test run (fresh process = empty in-memory caches).
 *
 * The transformation is a pure function of (code, sourceDir), so it can be
 * cached on disk keyed by their combined hash. Warm runs skip the parse
 * entirely.
 *
 * Writes are fire-and-forget with atomic rename: a torn write can never
 * poison the cache, and a missing/partial write simply means a cache miss.
 * ------------------------------------------------------------------------- */

import crypto from 'node:crypto'
import path from 'node:path'

import fs from '@magic/fs'

import { LRUCache } from './LRUCache.js'
import { CACHE_DIR } from '../../constants.js'

const DIR = path.join(CACHE_DIR, 'resolve-transform')
const SAME_SENTINEL = '\u0000RESOLVE_SAME'

// In-memory layer for the current process
const mem = new LRUCache<string>(1000)

// Ensures the cache directory exists exactly once per process
let dirReady: Promise<void> | null = null
const ensureDir = (): Promise<void> => {
  dirReady ??= fs.mkdirp(DIR).then(
    () => undefined,
    () => undefined,
  )
  return dirReady
}

const keyFor = (code: string, sourceDir: string): string =>
  crypto
    .createHash('sha256')
    .update(code)
    .update('\u0000')
    .update(path.resolve(sourceDir))
    .digest('hex')

/**
 * Look up a cached transformation.
 * Returns the transformed code, or `code` itself when the cached result was
 * "no change", or null on a miss.
 */
export const getResolveTransform = async (
  code: string,
  sourceDir: string,
): Promise<string | null> => {
  const key = keyFor(code, sourceDir)

  const memHit = mem.get(key)
  if (memHit !== undefined) {
    return memHit === SAME_SENTINEL ? code : memHit
  }

  const p = path.join(DIR, `${key}.js`)
  try {
    if (await fs.exists(p)) {
      const val = await fs.readFile(p, 'utf-8')
      mem.set(key, val)
      return val === SAME_SENTINEL ? code : val
    }
  } catch {
    // unreadable entry = miss
  }
  return null
}

/**
 * Store a transformation result. Fire-and-forget: callers must not await this
 * on hot paths. Safe to call with transformed === code (stores a sentinel).
 */
export const recordResolveTransform = (
  code: string,
  sourceDir: string,
  transformed: string,
): void => {
  const key = keyFor(code, sourceDir)
  const val = transformed === code ? SAME_SENTINEL : transformed
  mem.set(key, val)

  void (async () => {
    try {
      await ensureDir()
      const target = path.join(DIR, `${key}.js`)
      const tmp = path.join(DIR, `${key}.tmp`)
      await fs.writeFile(tmp, val)
      try {
        await fs.rename(tmp, target)
      } catch {
        // exists already or other error — entry is best-effort
      }
    } catch {
      // best-effort; a failed write just means a miss next time
    }
  })()
}

/**
 * Remove all cached transformations (used by clearCache).
 */
export const clearResolveTransformCache = async (): Promise<void> => {
  try {
    await fs.rmrf(DIR)
  } catch {
    // ignore
  }
  dirReady = null
  mem.clear()
}
