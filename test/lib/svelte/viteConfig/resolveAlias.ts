import { mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

import is from '@magic/types'

import { resolveAlias } from '#lib/svelte/viteConfig/resolveAlias.js'
import { CACHE_DIR } from '#src/constants.js'

// resolveAlias runs on EVERY import in the loader thread; its root-level
// alias state (vite config + tsconfig paths) is validated per call. These
// tests drive the appear / delete / change lifecycle through a private
// fixture root (its own package.json so findProjectRoot stops there, and a
// vite.config.js the test controls).

const BASE = path.join(process.cwd(), CACHE_DIR, 'resolveAliasFastPath')
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const configWith = (find: string, root: string) => `export default {
  resolve: {
    alias: [{ find: '${find}', replacement: '${root}/lib' }]
  }
}
`

const mkRoot = async (name: string, find: string) => {
  const root = path.join(BASE, name)
  await mkdir(path.join(root, 'lib'), { recursive: true })
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ name: 'fx-' + name, version: '0.0.1' }),
  )
  await writeFile(path.join(root, 'lib', 'Thing.svelte'), '<div>thing</div>')
  await writeFile(path.join(root, 'vite.config.js'), configWith(find, root))
  const caller = path.join(root, 'caller.ts')
  await writeFile(caller, 'export {}\n')
  return { root, caller }
}

export default [
  {
    fn: () => resolveAlias,
    expect: is.function,
    info: 'is a function',
  },
  {
    beforeAll: async () => {
      await mkdir(BASE, { recursive: true })
    },
    afterAll: async () => {
      await rm(BASE, { recursive: true, force: true }).catch(() => undefined)
    },
    tests: [
      {
        fn: async () => {
          const { root, caller } = await mkRoot('present', '$fx')
          const resolved = await resolveAlias('$fx/Thing.svelte', caller)
          return { resolved, expected: path.join(root, 'lib', 'Thing.svelte') }
        },
        expect: (v: { resolved: string | null; expected: string }) =>
          v.resolved === v.expected ||
          (v.resolved ?? '').endsWith(path.join('lib', 'Thing.svelte')),
        info: 'alias from a present vite config resolves',
      },
      {
        fn: async () => {
          const { root, caller } = await mkRoot('deleted', '$fx')
          const first = await resolveAlias('$fx/Thing.svelte', caller)
          // config disappears → alias gone on the next lookup
          await rm(path.join(root, 'vite.config.js'))
          const after = await resolveAlias('$fx/Thing.svelte', caller)
          return {
            firstOk: (first ?? '').endsWith(path.join('lib', 'Thing.svelte')),
            afterNull: after === null,
          }
        },
        expect: (v: { firstOk: boolean; afterNull: boolean }) => v.firstOk && v.afterNull,
        info: 'deleted vite config invalidates the cached aliases (fast path refreshes)',
      },
      {
        fn: async () => {
          const { root, caller } = await mkRoot('changed', '$old')
          const oldOk = (await resolveAlias('$old/Thing.svelte', caller)) !== null
          // content change (new alias) within the same root
          await sleep(25)
          await writeFile(path.join(root, 'vite.config.js'), configWith('$new', root))
          const newOk = (await resolveAlias('$new/Thing.svelte', caller)) !== null
          return { oldOk, newOk }
        },
        expect: (v: { oldOk: boolean; newOk: boolean }) => v.oldOk && v.newOk,
        info: 'changed vite config is re-read (tracked file mtime invalidates)',
      },
    ],
  },
]
