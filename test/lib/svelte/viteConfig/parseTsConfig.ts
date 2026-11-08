import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import is from '@magic/types'
import { parseTsConfig } from '#lib/svelte/viteConfig/parseTsConfig.js'
import type { TestCase } from '#src/types.js'

const withDir = async (files: Record<string, string>, fn: (dir: string) => Promise<unknown>) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'magic-tsconfig-'))
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel)
    await mkdir(path.dirname(full), { recursive: true })
    await writeFile(full, content)
  }
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

const byFind = async (dir: string) =>
  (await parseTsConfig(dir)).map(a => ({
    find: a.find instanceof RegExp ? a.find.source : (a.find as string),
    replacement: a.replacement,
  }))

export default [
  {
    fn: () => withDir({}, dir => parseTsConfig(dir)),
    expect: [],
    info: 'parseTsConfig returns [] when tsconfig.json is absent',
  },
  {
    fn: () =>
      withDir(
        {
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              paths: {
                '@app': ['src/app'],
                '@/*': ['src/*'],
                '@abs/*': ['/opt/abs/*'],
                '@plain/*': ['src/plain'],
              },
            },
          }),
        },
        async dir => {
          const entries = await byFind(dir)
          const plain = entries.find(e => e.find === '@app')?.replacement
          const wildcard = entries.find(e =>
            e.replacement.endsWith(path.join('src') + path.sep + '$1'),
          )?.replacement
          const absWildcard = entries.find(e => e.replacement.startsWith('/opt/abs'))?.replacement
          const noStar = entries.find(e =>
            e.replacement.endsWith(path.join('src', 'plain')),
          )?.replacement
          return { plain, wildcard, absWildcard, noStar, count: entries.length }
        },
      ),
    expect: (v: {
      plain?: string
      wildcard?: string
      absWildcard?: string
      noStar?: string
      count: number
    }) =>
      v.count === 4 &&
      !!v.plain?.endsWith(path.join('src', 'app')) &&
      !!v.wildcard?.endsWith(path.join('src') + path.sep + '$1') &&
      !!v.absWildcard?.startsWith('/opt/abs') &&
      v.absWildcard.endsWith('$1') &&
      !!v.noStar?.endsWith(path.join('src', 'plain')),
    info: 'parseTsConfig builds find/replacement entries for each path pattern shape',
  },
  {
    fn: () =>
      withDir(
        {
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              baseUrl: 'src',
              paths: {
                '@/*': ['./util/*'],
              },
            },
          }),
        },
        async dir => {
          const entries = await byFind(dir)
          return entries.find(e =>
            e.replacement.endsWith(path.join('src', 'util') + path.sep + '$1'),
          )?.replacement
        },
      ),
    expect: (v: string | undefined) =>
      !!v && v.endsWith(path.join('src', 'util') + path.sep + '$1'),
    info: 'parseTsConfig resolves wildcard targets against a custom baseUrl',
  },
  {
    fn: () =>
      withDir(
        {
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              paths: {
                '@empty': [],
                '@real': ['src/real'],
              },
            },
          }),
        },
        async dir => {
          const entries = await byFind(dir)
          return { finds: entries.map(e => e.find).sort() }
        },
      ),
    expect: { finds: ['@real'] },
    info: 'parseTsConfig drops path entries with an empty target list',
  },
  {
    fn: () =>
      withDir(
        {
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              paths: {
                $lib: ['old-lib'],
                $app: ['src/app'],
              },
            },
          }),
          '.svelte-kit/tsconfig.json': JSON.stringify({
            compilerOptions: {
              paths: {
                $lib: ['../src/lib'],
              },
            },
          }),
        },
        async dir => {
          const entries = await byFind(dir)
          return {
            // '../src/lib' normalized to 'src/lib' then resolved against the root
            libNormalized:
              entries.find(e => e.find === '$lib')?.replacement === path.resolve(dir, 'src/lib'),
            appKept:
              entries.find(e => e.find === '$app')?.replacement === path.resolve(dir, 'src/app'),
          }
        },
      ),
    expect: { libNormalized: true, appKept: true },
    info: 'parseTsConfig merges .svelte-kit paths, normalizing ../ targets with precedence',
  },
  {
    fn: () =>
      withDir(
        {
          'tsconfig.json': `// leading comment
{
  "compilerOptions": {
    /* block comment */
    "paths": { "@x": ["src/x"] }
  }
}`,
        },
        async dir => {
          const entries = await byFind(dir)
          return { finds: entries.map(e => e.find) }
        },
      ),
    expect: { finds: ['@x'] },
    info: 'parseTsConfig strips comments before parsing',
  },
  {
    fn: async () =>
      withDir({ 'tsconfig.json': `{"compilerOptions": {"paths": ` }, async dir => {
        const originalWarn = console.warn
        let warned = ''
        console.warn = ((m: unknown) => {
          warned += String(m)
        }) as typeof console.warn
        try {
          const result = await parseTsConfig(dir)
          return { result, warned }
        } finally {
          console.warn = originalWarn
        }
      }),
    expect: (v: { result: unknown; warned: string }) =>
      is.array(v.result) &&
      (v.result as unknown[]).length === 0 &&
      v.warned.includes('Failed to parse tsconfig'),
    info: 'parseTsConfig warns and returns [] on invalid JSON',
  },
  {
    fn: () =>
      withDir(
        {
          'tsconfig.json': JSON.stringify({
            compilerOptions: { paths: { '@c': ['src/c'] } },
          }),
        },
        async dir => {
          const first = await parseTsConfig(dir)
          const second = await parseTsConfig(dir)
          return { sameReference: first === second, length: second.length }
        },
      ),
    expect: { sameReference: true, length: 1 },
    info: 'parseTsConfig caches parsed aliases per root directory',
  },
] satisfies TestCase[]
