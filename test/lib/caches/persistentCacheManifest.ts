import { mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

import {
  getCachedCompile,
  recordCompile,
  getCacheRelPath,
  sweepStaleManifest,
  loadManifest,
} from '#lib/caches/persistentCache.js'
import { CACHE_DIR } from '#src/constants.js'

// Manifest-level semantics of the persistent compile cache. Fixture sources
// live under the cache dir so they anchor to normal (non-outside) paths;
// each test uses its own subdirectory so parallel tests never collide.
// afterAll removes the fixtures and sweeps the manifest so no stale entries
// survive in the shared manifest.

const BASE = path.join(process.cwd(), CACHE_DIR, 'persistentCacheManifest')
const SRC = (name: string) => path.join(BASE, name, 'Fixture.svelte')

const mk = async (name: string, content: string) => {
  const file = SRC(name)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, content)
  return file
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default {
  beforeAll: async () => {
    await mkdir(BASE, { recursive: true })
  },
  afterAll: async () => {
    await rm(BASE, { recursive: true, force: true }).catch(() => undefined)
    await sweepStaleManifest().catch(() => undefined)
  },
  tests: [
    {
      fn: async () => {
        const file = await mk('hit', '<div>one</div>')
        const js = 'const x = 1\n//# sourceMappingURL=Fixture.svelte.js.map\n'
        await recordCompile(file, js)
        const hit = await getCachedCompile(file)
        return { js: hit?.js ?? null }
      },
      expect: (v: { js: string | null }) =>
        v.js === 'const x = 1\n//# sourceMappingURL=Fixture.svelte.js.map\n',
      info: 'recordCompile then getCachedCompile returns the recorded js',
    },
    {
      fn: async () => {
        const file = await mk('changed', '<div>a</div>')
        await recordCompile(file, 'jsA')
        await sleep(25)
        await writeFile(file, '<div>different content, different size</div>')
        const after = await getCachedCompile(file)
        return after === null
      },
      expect: true,
      info: 'changed source (mtime+size mismatch → hash) invalidates the entry',
    },
    {
      fn: async () => {
        const file = await mk('deleted', '<div>d</div>')
        await recordCompile(file, 'jsD')
        await rm(file)
        const after = await getCachedCompile(file)
        // The stale drop is fire-and-forget (must not block the read path);
        // poll briefly for it to land.
        let entryDropped = false
        for (let i = 0; i < 100 && !entryDropped; i++) {
          const m = await loadManifest()
          entryDropped = !m?.sources[file]
          if (!entryDropped) {
            await new Promise(resolve => setTimeout(resolve, 25))
          }
        }
        return { miss: after === null, entryDropped }
      },
      expect: (v: { miss: boolean; entryDropped: boolean }) => v.miss && v.entryDropped,
      info: 'deleted source: stale entry is dropped lazily',
    },
    {
      fn: () => {
        const rel = getCacheRelPath('/tmp/some-outside-dir/Comp.svelte')
        return { rel, anchored: rel.startsWith('outside/tmp/some-outside-dir') }
      },
      expect: (v: { rel: string; anchored: boolean }) => v.anchored && !v.rel.startsWith('..'),
      info: 'outside-root sources anchor under outside/ (cannot escape the cache dir)',
    },
    {
      fn: async () => {
        const file = await mk('sweep', '<div>s</div>')
        await recordCompile(file, 'jsS')
        await rm(file)
        const dropped = await sweepStaleManifest()
        return { droppedAtLeast1: dropped >= 1 }
      },
      expect: (v: { droppedAtLeast1: boolean }) => v.droppedAtLeast1,
      info: 'sweepStaleManifest drops entries whose source is gone',
    },
    {
      fn: async () => {
        const file = await mk('fastpath', '<div>fp</div>')
        await recordCompile(file, 'jsFP')
        const hit1 = await getCachedCompile(file)
        // two consecutive reads must both hit (stat fast path, no rewrite)
        const hit2 = await getCachedCompile(file)
        return { a: hit1?.js ?? null, same: hit1?.js === hit2?.js }
      },
      expect: (v: { a: string | null; same: boolean }) => v.a === 'jsFP' && v.same,
      info: 'consecutive getCachedCompile calls both hit (stat fast path)',
    },
  ],
}
