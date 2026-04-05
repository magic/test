import path from 'node:path'
import { fs } from '@magic/fs'
import { aliasCache } from '../../src/lib/svelte/viteConfig/cache.js'
import { parseTsConfig } from '../../src/lib/svelte/viteConfig/parseTsConfig.js'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'parseTsConfig')

export default {
  beforeAll: async () => {
    aliasCache.clear()
    await fs.mkdir(TEST_ROOT, { recursive: true })
  },
  afterAll: async () => {
    await fs.rmrf(TEST_ROOT)
  },
  tests: [
    {
      fn: async () => {
        const result = await parseTsConfig(TEST_ROOT)
        return result
      },
      expect: [],
      info: 'returns empty array when tsconfig.json does not exist',
    },
    {
      fn: async () => {
        await fs.writeFile(
          path.join(TEST_ROOT, 'tsconfig.json'),
          JSON.stringify({
            compilerOptions: {
              paths: {
                '@/*': ['src/*'],
                '~/*': ['components/*'],
              },
            },
          }),
        )
        const result = await parseTsConfig(TEST_ROOT)
        return result.length
      },
      expect: 2,
      info: 'parses tsconfig paths correctly',
    },
    {
      fn: async () => {
        await fs.writeFile(
          path.join(TEST_ROOT, 'tsconfig.json'),
          JSON.stringify({
            compilerOptions: {
              baseUrl: '.',
              paths: {
                '$lib/*': ['src/lib/*'],
              },
            },
          }),
        )
        const svelteKitDir = path.join(TEST_ROOT, '.svelte-kit')
        await fs.mkdir(svelteKitDir)
        await fs.writeFile(
          path.join(svelteKitDir, 'tsconfig.json'),
          JSON.stringify({
            compilerOptions: {
              paths: {
                '$lib/*': ['../src/lib/*'],
              },
            },
          }),
        )
        const result = await parseTsConfig(TEST_ROOT)
        const libAlias = result.find(a => String(a.find).includes('$lib'))
        return libAlias?.replacement.includes('src/lib')
      },
      expect: true,
      info: 'merges .svelte-kit tsconfig with ../ normalization',
    },
    {
      fn: async () => {
        await fs.writeFile(
          path.join(TEST_ROOT, 'tsconfig.json'),
          JSON.stringify({
            compilerOptions: {
              baseUrl: '/absolute/path',
              paths: {
                '@/*': ['src/*'],
              },
            },
          }),
        )
        const result = await parseTsConfig(TEST_ROOT)
        const alias = result[0]
        return alias.replacement.includes('/absolute/path')
      },
      expect: true,
      info: 'handles absolute baseUrl',
    },
    {
      fn: async () => {
        await fs.writeFile(path.join(TEST_ROOT, 'tsconfig.json'), '{ invalid json')
        const result = await parseTsConfig(TEST_ROOT)
        return result
      },
      expect: [],
      info: 'catches parse error for invalid JSON',
    },
  ],
}
