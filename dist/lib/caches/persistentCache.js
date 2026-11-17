import fs from '@magic/fs'
import { open as openFile, rm as rmFile } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { LRUCache } from './LRUCache.js'
import { clearResolveTransformCache } from './resolveTransformCache.js'
import { CACHE_DIR } from '../../constants.js'
const MANIFEST_FILE = path.join(CACHE_DIR, 'manifest.json')
const LOCK_FILE = path.join(CACHE_DIR, 'manifest.lock')
// Shared relative-path mapping for the compile cache location of a source
// file. Used by BOTH getCachePath here and getTempFilePath (svelte/compile)
// so the "persistent cache file" and the "temp file" are always the same
// path. Sources that resolve outside the project (pnpm store, monorepo
// siblings, /tmp fixtures) would otherwise escape CACHE_DIR via `../`
// relatives and scatter compiled files through the project tree — anchor
// them under `outside/`.
export const getCacheRelPath = sourcePath => {
  let rel = path.relative(process.cwd(), sourcePath)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    rel = path.join('outside', sourcePath)
  }
  return rel.replace(/\.svelte$/, '.svelte.js')
}
// In-memory caches for performance
let manifestCache = null
// The on-disk mtime the in-memory manifest was loaded from. Parallel test
// workers share the manifest file: reload whenever another worker has
// written a newer version so cache entries recorded mid-run are visible.
let manifestMtime = 0
// SHA-256 hash of a source file, cached by (path → {hash, mtime, size}).
// The cache entry is only trusted when the file's current stat matches the
// recorded stat — a bare path→hash cache would keep returning the PRE-edit
// hash after a rewrite (within one mtime tick the size can even match),
// silently defeating the authoritative hash check in getCachedCompile.
const hashCache = new LRUCache(4096)
const hashFile = async filePath => {
  const stats = await fs.stat(filePath)
  const cached = hashCache.get(filePath)
  if (cached && cached.mtime === stats.mtimeMs && cached.size === stats.size) {
    return cached.hash
  }
  const content = await fs.readFile(filePath, 'utf-8')
  const hash = crypto.createHash('sha256').update(content).digest('hex')
  hashCache.set(filePath, { hash, mtime: stats.mtimeMs, size: stats.size })
  return hash
}
// Atomic write: a concurrent reader (sibling worker) must never observe a
// truncated/partial file — write to a unique temp name, then rename (POSIX
// renames are atomic).
export const writeAtomic = async (filePath, content) => {
  const tmp = `${filePath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`
  await fs.writeFile(tmp, content)
  try {
    await fs.rename(tmp, filePath)
  } catch (e) {
    try {
      await fs.unlink(tmp)
    } catch {
      // temp cleanup is best-effort
    }
    throw e
  }
}
// Get relative cache path for a source file
const getCachePath = sourcePath => {
  return path.join(CACHE_DIR, getCacheRelPath(sourcePath))
}
// Installed svelte version (lazy read, cached). Used to invalidate the whole
// cache when svelte is upgraded — the compiled output is a function of the
// compiler, not just the source hash.
let installedSvelteVersion
const getInstalledSvelteVersion = async () => {
  if (installedSvelteVersion === undefined) {
    let version = 'unknown'
    try {
      const pkgData = await fs.readFile(
        path.join(process.cwd(), 'node_modules/svelte/package.json'),
        'utf-8',
      )
      version = JSON.parse(pkgData).version ?? 'unknown'
    } catch {
      // svelte not installed
    }
    installedSvelteVersion = version
  }
  return installedSvelteVersion
}
let clearInFlight = null
const clearCacheLocked = async () => {
  clearInFlight ??= (async () => {
    try {
      await clearCache()
    } finally {
      clearInFlight = null
    }
  })()
  return clearInFlight
}
export const loadManifest = async () => {
  try {
    const stats = await fs.stat(MANIFEST_FILE)
    if (manifestCache && stats.mtimeMs === manifestMtime) {
      return manifestCache
    }
    const data = await fs.readFile(MANIFEST_FILE, 'utf-8')
    const m = JSON.parse(data)
    // Compiler changed since the cache was recorded → the compiled output is
    // stale even though every source hash still matches. Invalidate once;
    // the next recordCompile rewrites the manifest with the new version.
    if (m.svelteVersion !== (await getInstalledSvelteVersion())) {
      await clearCacheLocked()
      return null
    }
    manifestCache = m
    manifestMtime = stats.mtimeMs
    return manifestCache
  } catch {
    return null
  }
}
export const saveManifest = async manifest => {
  // Merge with the latest on-disk manifest so concurrent writers (parallel
  // test workers) don't clobber each other's entries: a stale in-memory copy
  // must not drop entries another worker recorded in the meantime.
  //
  // The merge must read the DISK (not the in-memory copy — a stale mtime can
  // mask another writer's save within the same mtime tick) and runs under a
  // short file lock so the read-merge-write window is atomic across
  // processes. Losing this window previously let a worker's save silently
  // drop entries other workers had just recorded (→ phantom cache misses
  // and duplicate compiles).
  const token = await acquireManifestLock()
  try {
    let latest = null
    try {
      latest = JSON.parse(await fs.readFile(MANIFEST_FILE, 'utf-8'))
    } catch {
      // no manifest on disk yet
    }
    let m = manifest
    if (!m) {
      m = latest
    } else if (latest) {
      for (const [key, value] of Object.entries(latest.sources)) {
        const mine = m.sources[key]
        if (!mine || (value.mtime ?? 0) > (mine.mtime ?? 0)) {
          m.sources[key] = value
        }
      }
    }
    if (!m) {
      return
    }
    await fs.mkdirp(CACHE_DIR)
    await writeAtomic(MANIFEST_FILE, JSON.stringify(m, null, 2))
    manifestCache = m
    manifestMtime = (await fs.stat(MANIFEST_FILE)).mtimeMs
  } finally {
    await releaseManifestLock(token)
  }
}
const readLockRecord = async () => {
  try {
    const raw = await fs.readFile(LOCK_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}
const pidAlive = pid => {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    // EPERM means the pid exists (different user); ESRCH means dead
    return e.code === 'EPERM'
  }
}
const acquireManifestLock = async () => {
  const token = `${process.pid}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  for (;;) {
    try {
      const fh = await openFile(LOCK_FILE, 'wx')
      await fh.writeFile(JSON.stringify({ pid: process.pid, token, time: Date.now() }))
      await fh.close()
      return token
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e
      }
      // Someone holds it — can we steal?
      const rec = await readLockRecord()
      let steal = false
      try {
        const st = await fs.stat(LOCK_FILE)
        const age = Date.now() - st.mtimeMs
        if (rec === null) {
          // Unreadable record: crash between create and write
          steal = age > 2000
        } else if (rec.pid !== process.pid && !pidAlive(rec.pid)) {
          steal = true
        } else if (age > 10000) {
          // Pathological stall (a same-pid holder is an async continuation
          // behind a long sync task). Steal; the stale holder's release is
          // neutralized by the token check.
          steal = true
        }
      } catch {
        // lock vanished mid-check — retry
      }
      if (steal) {
        await rmFile(LOCK_FILE, { force: true }).catch(() => undefined)
        continue
      }
      await new Promise(resolve => setTimeout(resolve, 2 + Math.random() * 6))
    }
  }
}
const releaseManifestLock = async token => {
  try {
    const rec = await readLockRecord()
    if (rec && rec.token === token) {
      await rmFile(LOCK_FILE, { force: true })
    }
    // token mismatch (or no record): our lock was stolen — never delete it
  } catch {
    // best-effort
  }
}
/**
 * Read the manifest fresh from disk, apply `fn`, write back — atomically
 * across processes (file lock). Used by every mutation path so deletions
 * (lazy stale-drop, sweep) are not re-merged from a stale on-disk copy.
 */
const mutateManifest = async fn => {
  const token = await acquireManifestLock()
  try {
    let m
    try {
      m = JSON.parse(await fs.readFile(MANIFEST_FILE, 'utf-8'))
    } catch {
      m = { version: 1, svelteVersion: await getInstalledSvelteVersion(), sources: {} }
    }
    await fn(m)
    await fs.mkdirp(CACHE_DIR)
    await writeAtomic(MANIFEST_FILE, JSON.stringify(m, null, 2))
    manifestCache = m
    manifestMtime = (await fs.stat(MANIFEST_FILE)).mtimeMs
    return m
  } finally {
    await releaseManifestLock(token)
  }
}
export const getCachedCompile = async sourcePath => {
  const m = await loadManifest()
  if (!m) {
    return null
  }
  const entry = m.sources[sourcePath]
  if (!entry) {
    return null
  }
  // Fast path: stat only (no read, no hash). The mtime+size pair is recorded
  // at record time; a rewrite that changes neither within one mtime tick is
  // the only undetectable case — accepted trade-off, the hash stays
  // authoritative whenever the pair does not match (and for legacy entries
  // that predate the size field).
  let currentHash = null
  try {
    const stats = await fs.stat(sourcePath)
    if (entry.size === undefined || stats.mtimeMs !== entry.mtime || stats.size !== entry.size) {
      currentHash = await hashFile(sourcePath)
    }
  } catch {
    // Source deleted since recording → stale entry; drop it so the manifest
    // doesn't grow unboundedly (e.g. /tmp fixture packages from test runs).
    // Fire-and-forget, under the manifest lock so the deletion is not
    // re-merged from a stale on-disk copy.
    void mutateManifest(m => {
      delete m.sources[sourcePath]
    }).catch(() => undefined)
    return null
  }
  // Check if hash matches
  if (currentHash !== null && currentHash !== entry.hash) {
    return null
  }
  // Check compiled file exists
  const compiledPath = getCachePath(sourcePath)
  if (!(await fs.exists(compiledPath))) {
    return null
  }
  const js = await fs.readFile(compiledPath, 'utf-8')
  return { js, css: null }
}
export const recordCompile = async (sourcePath, compiledJs) => {
  // mtime+size is the fast-path validator, hash is authoritative
  const stats = await fs.stat(sourcePath)
  const hash = await hashFile(sourcePath)
  // Save compiled file first — a manifest entry without its compiled file is
  // a guaranteed miss (getCachedCompile checks existence), never a corrupt
  // hit.
  //
  // SINGLE-WRITER DISCIPLINE: another path (writeCompiledFile) usually
  // writes this exact content moments earlier. Re-writing identical bytes
  // only churns the file mtime (breaking "not rewritten on cache hit"
  // semantics) and can interleave with concurrent readers — skip the write
  // when the file is already byte-identical.
  const compiledPath = getCachePath(sourcePath)
  await fs.mkdirp(path.dirname(compiledPath))
  let existing = null
  try {
    existing = await fs.readFile(compiledPath, 'utf-8')
  } catch {
    // missing — will write
  }
  if (existing !== compiledJs) {
    await writeAtomic(compiledPath, compiledJs)
  }
  // Update manifest (locked read-modify-write; concurrent workers' entries
  // are preserved by the lock + fresh disk read)
  await mutateManifest(manifest => {
    manifest.sources[sourcePath] = { mtime: stats.mtimeMs, size: stats.size, hash }
  })
}
export const clearCache = async () => {
  try {
    await fs.rmrf(CACHE_DIR)
  } catch {
    // Ignore
  }
  manifestCache = null
  manifestMtime = 0
  hashCache.clear()
  await clearResolveTransformCache()
}
/**
 * One-shot cleanup of manifest entries whose source no longer exists (e.g.
 * /tmp fixture packages created by test runs). Called at run start, best
 * effort — a failed sweep never affects the run. Individual stale entries
 * are also dropped lazily by getCachedCompile when it hits a missing source.
 */
export const sweepStaleManifest = async () => {
  // The bulk of the work (N existence checks) runs OUTSIDE the lock so the
  // lock window stays a short read-modify-write. A source created between
  // the check and the locked delete only loses its entry, which the next
  // recordCompile re-adds — harmless.
  const m = await loadManifest()
  if (!m) {
    return 0
  }
  const keys = Object.keys(m.sources)
  const existing = await Promise.all(keys.map(k => fs.exists(k).catch(() => false)))
  const missing = keys.filter((_, i) => !existing[i])
  if (missing.length === 0) {
    return 0
  }
  let dropped = 0
  await mutateManifest(mm => {
    for (const key of missing) {
      if (mm.sources[key]) {
        delete mm.sources[key]
        dropped++
      }
    }
  })
  return dropped
}
export const getCacheDir = () => CACHE_DIR
//# sourceMappingURL=persistentCache.js.map
