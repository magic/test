import crypto from 'node:crypto'
import path from 'node:path'

import fs from '@magic/fs'

import { CACHE_DIR, getCwd } from '../../constants.js'
import { traceStart, traceEnd } from '../../lib/trace/timing.js'
/**
 * Persistent, content-addressed cache for ts.transpileModule output.
 *
 * Every process in a run (main + workers) re-transpiles the same .ts test
 * files: ~250 transpiles per full run at 2-4ms each, plus each process
 * statically paying the `typescript` package import. The transpiled output
 * is a pure function of the input code and the compiler options (fixed
 * here), so a hash of the exact input string is a complete cache key — no
 * mtime validation, no staleness, ever.
 *
 * On a hit the loader thread reads one small file and NEVER loads the
 * `typescript` package (the transpiler module is imported lazily on first
 * miss), which also removes a heavy startup import from cache-warm
 * processes.
 *
 * MAGIC_TEST_COMPILE_CACHE=0 disables the persistent layer (the in-memory
 * layer stays; it is correctness-neutral).
 */
const TRANSPILE_DIR = () => path.join(getCwd(), CACHE_DIR, 'transpile')
// Bounded in-memory layer (loader thread + process-local).
const memory = new Map()
const MEMORY_CAP = 512
// Cap the on-disk layer; when exceeded, drop the oldest entries (best-effort,
// amortized — the check itself is a single readdir that runs rarely).
const DISK_CAP = 4096
let diskWrites = 0
let diskSweepPending = false
const diskSweep = async () => {
  if (diskSweepPending) {
    return
  }
  diskSweepPending = true
  try {
    const files = await fs
      .getFiles(TRANSPILE_DIR(), { maxDepth: 1, extension: '.js' })
      .catch(() => [])
    if (files.length > DISK_CAP) {
      const entries = await Promise.all(
        files.map(async f => {
          try {
            const st = await fs.stat(f)
            return { f, mtime: st.mtimeMs }
          } catch {
            return null
          }
        }),
      )
      const valid = entries.filter(e => e !== null)
      valid.sort((a, b) => a.mtime - b.mtime)
      for (const e of valid.slice(0, valid.length - DISK_CAP / 2)) {
        await fs.rmrf(e.f).catch(() => undefined)
      }
    }
  } finally {
    diskSweepPending = false
  }
}
// Lazily loaded transpiler + typescript package version (mixed into the hash
// so a typescript upgrade can never serve output from an older version).
let transpiler = null
let tsVersion = null
const loadTranspiler = async () => {
  if (!transpiler) {
    const [mod, tsPkg] = await Promise.all([
      import('./tsTranspile.js'),
      fs
        .readFile(path.join(getCwd(), 'node_modules', 'typescript', 'package.json'), 'utf-8')
        .then(raw => JSON.parse(raw).version ?? 'unknown')
        .catch(() => 'unknown'),
    ])
    transpiler = mod.transpileWithTypescript
    tsVersion = tsPkg
  }
  return transpiler
}
const cacheEnabled = () => process.env.MAGIC_TEST_COMPILE_CACHE !== '0'
export const cachedTranspile = async code => {
  const id = traceStart('transpileCache')
  try {
    const key = crypto
      .createHash('sha256')
      .update((tsVersion ?? 'unknown') + '\0' + code)
      .digest('hex')
      .slice(0, 32)
    const mem = memory.get(key)
    if (mem !== undefined) {
      traceEnd(id, 'mem hit')
      return mem
    }
    const file = path.join(TRANSPILE_DIR(), key + '.js')
    if (cacheEnabled()) {
      try {
        const js = await fs.readFile(file, 'utf-8')
        if (memory.size < MEMORY_CAP) {
          memory.set(key, js)
        }
        traceEnd(id, 'disk hit')
        return js
      } catch {
        // miss — compile below
      }
    }
    const impl = await loadTranspiler()
    const js = impl(code)
    if (memory.size < MEMORY_CAP) {
      memory.set(key, js)
    }
    if (cacheEnabled()) {
      try {
        await fs.mkdirp(TRANSPILE_DIR())
        await fs.writeFile(file, js)
        // Amortized disk-size guard (the check is a single readdir and runs
        // at most once per 64 disk writes).
        if (++diskWrites % 64 === 0) {
          void diskSweep().catch(() => undefined)
        }
      } catch {
        // best-effort persistence; a failed write only costs the next miss
      }
    }
    traceEnd(id, 'miss')
    return js
  } catch (e) {
    traceEnd(id, `ERROR: ${e.message}`)
    throw e
  }
}
//# sourceMappingURL=transpileCache.js.map
