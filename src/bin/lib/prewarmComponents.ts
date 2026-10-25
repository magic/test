/**
 * Prewarm the component compile graphs before the test workers start.
 *
 * Every isolated test worker re-imports the component's full module graph
 * (package barrel + svelte dependencies) on its first mount. With the default
 * worker count (cores - 2) that is N× redundant compile work — the dominant
 * cost of a cold run, and under machine load it pushes individual tests past
 * the per-test timeout (rotating flakes). Importing each referenced component
 * here compiles the graphs once; the loader records everything in the shared
 * disk cache (manifest + compiled temp files), so the test workers reuse the
 * compiled output instead of recompiling it.
 *
 * The prewarm runs on a small pool of dedicated worker threads (default 4)
 * so the cold build is parallel. It is best-effort: failures (including a
 * global timeout) never fail the run — a worker will surface a real error
 * during the actual test.
 *
 * MAGIC_TEST_PREWARM=0 disables the prewarm.
 * MAGIC_TEST_PREWARM_WORKERS sets the prewarm thread count (default 4).
 */
import path from 'node:path'
import { Worker } from 'node:worker_threads'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

import {
  resolveImportMapSpecifier,
  findNearestPackageJson,
} from '../../lib/svelte/compile/resolveImportMap.js'
import { loadManifest, getCachedCompile } from '../../lib/caches/persistentCache.js'
import { traceStart, traceEnd } from '../../lib/trace/timing.js'

const DEFAULT_PREWARM_WORKERS = 4
const DEFAULT_PREWARM_TIMEOUT_MS = 120_000
const WARM_PROBE_SAMPLE = 5

/**
 * Skip the prewarm when the package graph is already warm: a fresh/cold
 * cache is the case the prewarm protects against; on a warm cache it is pure
 * overhead. Probe a sample of the recorded node_modules sources (hash check
 * via getCachedCompile) — a mismatch (dep update) or an empty manifest means
 * the graph needs (re)building.
 */
const graphLooksWarm = async (): Promise<boolean> => {
  const m = await loadManifest()
  if (!m) {
    return false
  }
  const entries = Object.keys(m.sources).filter(k =>
    k.includes(`${path.sep}node_modules${path.sep}`),
  )
  if (entries.length === 0) {
    return false
  }
  for (const sourcePath of entries.slice(0, WARM_PROBE_SAMPLE)) {
    try {
      if (await getCachedCompile(sourcePath)) {
        return true
      }
    } catch {
      // source deleted since recording → stale entry, keep probing
    }
  }
  return false
}

interface PrewarmResult {
  url: string
  ok: boolean
  error?: string
}

/**
 * Collect `component` strings from the test data. Test exports are arbitrary
 * module values (e.g. an eslint config), so the object graph can contain
 * cycles — typescript-eslint's plugin object self-references via
 * `configs['flat/all'][0].plugins`. The visited set breaks those cycles (and
 * skips repeated shared subtrees); a first visit already collects everything
 * beneath a node, so skipping later visits loses nothing.
 */
const collectComponentPaths = (node: unknown, out: Set<string>, seen: WeakSet<object>): void => {
  if (is.array(node) || is.objectNative(node)) {
    if (seen.has(node)) {
      return
    }
    seen.add(node)
  }
  if (is.array(node)) {
    for (const item of node) {
      collectComponentPaths(item, out, seen)
    }
    return
  }
  if (is.objectNative(node)) {
    if (is.string(node.component)) {
      out.add(node.component)
    }
    for (const value of Object.values(node)) {
      collectComponentPaths(value, out, seen)
    }
  }
}

const resolveComponentPath = async (component: string): Promise<string | null> => {
  let abs: string
  if (component.startsWith('#')) {
    // Import-map specifier (e.g. "#lib/Foo.svelte") — resolve against the
    // project's package.json, same as the component mount path.
    const pkgJsonPath = await findNearestPackageJson(process.cwd())
    const resolved = await resolveImportMapSpecifier(component, pkgJsonPath)
    if (!resolved) {
      return null
    }
    abs = resolved
  } else {
    abs = path.isAbsolute(component) ? component : path.resolve(process.cwd(), component)
  }
  if (!(await fs.exists(abs))) {
    return null
  }
  return abs
}

const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

const runPrewarmWorker = (urls: string[], timeoutMs: number): Promise<PrewarmResult[]> => {
  return new Promise(resolve => {
    let settled = false
    const finish = (results: PrewarmResult[]): void => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      void worker.terminate()
      resolve(results)
    }
    const failed = (error: string): PrewarmResult[] => urls.map(url => ({ url, ok: false, error }))
    const worker = new Worker(new URL('./prewarmWorker.js', import.meta.url), {
      workerData: { urls },
    })
    const timer = setTimeout(() => finish(failed('prewarm timeout')), timeoutMs)
    worker.on('message', message => finish(message as PrewarmResult[]))
    worker.on('error', error => finish(failed(String(error))))
    worker.on('exit', () => finish([]))
  })
}

export const prewarmComponentGraphs = async (tests: unknown): Promise<void> => {
  if (process.env.MAGIC_TEST_PREWARM === '0') {
    return
  }

  const components = new Set<string>()
  collectComponentPaths(tests, components, new WeakSet())
  if (components.size === 0) {
    return
  }

  // Warm cache → nothing to build; the test workers reuse the disk cache
  // directly (the probe is a handful of hash checks, not a graph walk).
  if (await graphLooksWarm()) {
    return
  }

  const urls: string[] = []
  for (const component of components) {
    const abs = await resolveComponentPath(component)
    if (abs) {
      urls.push(pathToFileURL(abs).href)
    }
  }
  if (urls.length === 0) {
    return
  }

  const workerCount = Math.max(
    1,
    Math.min(
      DEFAULT_PREWARM_WORKERS,
      urls.length,
      Number(process.env.MAGIC_TEST_PREWARM_WORKERS) || DEFAULT_PREWARM_WORKERS,
    ),
  )
  const timeoutMs = Number(process.env.MAGIC_TEST_PREWARM_TIMEOUT_MS) || DEFAULT_PREWARM_TIMEOUT_MS

  const id = traceStart('prewarmComponents')
  const slices = chunk(urls, Math.ceil(urls.length / workerCount))
  const results = (
    await Promise.all(slices.map(slice => runPrewarmWorker(slice, timeoutMs)))
  ).flat()
  const warmed = results.filter(r => r.ok).length
  const failed = results.length - warmed
  if (failed > 0 && process.env.MAGIC_TEST_VERBOSE_ERRORS) {
    for (const r of results) {
      if (!r.ok) {
        log.error('[prewarm] failed to import', r.url, r.error)
      }
    }
  }
  traceEnd(id, `${warmed} warmed, ${failed} failed`)
}
