import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import type { Test } from '#src/index.js'
import { load } from '#src/bin/lib/tsLoader.js'
import { CACHE_DIR, getCwd } from '#src/constants.js'

export default [
  {
    fn: async () => {
      const file = path.join(getCwd(), CACHE_DIR, 'loader-cache-probe.svelte.js')
      // The #lib import is deliberate: the legacy loader pipeline rewrote it to
      // a file: URL, so this file only loads verbatim with the cache fast path.
      const source =
        "import * as $ from 'svelte/internal/client';\nimport { probeDep } from '#lib/probe.js'\nexport const probe = () => probeDep\n// coverage offset marker\n"
      await writeFile(file, source)
      try {
        const result = await load(
          pathToFileURL(file).href,
          {},
          // eslint-disable-next-line @typescript-eslint/require-await
          async () => {
            throw new Error('expected shortCircuit')
          },
        )
        return { shortCircuit: result?.shortCircuit === true, verbatim: result?.source === source }
      } finally {
        await rm(file)
      }
    },
    expect: (v: { shortCircuit: boolean; verbatim: boolean }) => v.shortCircuit && v.verbatim,
    info: 'load serves .svelte.js files under the compile cache verbatim, keeping V8 coverage offsets aligned with the on-disk source map',
  },
  {
    fn: async () => {
      const dir = await mkdtemp(path.join(os.tmpdir(), 'magic-test-loader-'))
      const file = path.join(dir, 'outside-cache.svelte.js')
      await writeFile(file, 'const x: number = 1\nexport { x }\n')
      try {
        const result = await load(
          pathToFileURL(file).href,
          {},
          // eslint-disable-next-line @typescript-eslint/require-await
          async () => {
            throw new Error('expected shortCircuit')
          },
        )
        const src = result?.source ?? ''
        return {
          shortCircuit: result?.shortCircuit === true,
          typesStripped: !src.includes(': number'),
        }
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
    },
    expect: (v: { shortCircuit: boolean; typesStripped: boolean }) =>
      v.shortCircuit && v.typesStripped,
    info: 'load still transpiles .svelte.js files outside the compile cache',
  },
] satisfies Test[]
