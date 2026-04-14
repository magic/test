import path from 'node:path'
import { fs } from '@magic/fs'
import { configCache } from '../../../../src/lib/svelte/viteConfig/cache.js'
import { parseViteConfig } from '../../../../src/lib/svelte/viteConfig/parseViteConfig.js'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'parseViteConfig')

export default {
  beforeAll: async () => {
    await fs.mkdir(TEST_ROOT, { recursive: true })
  },
  afterAll: async () => {
    await fs.rmrf(TEST_ROOT)
  },
  tests: [
    {
      fn: async () => {
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(configPath, `export default defineConfig({})`)
        const result = await parseViteConfig(configPath)
        return result
      },
      expect: {},
      info: 'empty config returns empty object',
    },
    {
      fn: async () => {
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(
          configPath,
          `
          export default defineConfig({
            resolve: { alias: { find: '@', replacement: './src' } }
          })
        `,
        )
        const result = await parseViteConfig(configPath)
        const actual = result.resolve?.alias?.[0]
        const expectedReplacement = path.join(testDir, 'src')
        const expected = { find: '@', replacement: expectedReplacement }
        if (
          !actual ||
          actual.find !== expected.find ||
          actual.replacement !== expected.replacement
        ) {
          throw new Error(
            `Object alias test failed. Got: ${JSON.stringify(actual)}, expected: ${JSON.stringify(expected)}`,
          )
        }
        return true
      },
      expect: true,
      info: 'parses object-style alias',
    },
    {
      fn: async () => {
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(
          configPath,
          `
          export default defineConfig({
            resolve: { alias: [
              { find: '@', replacement: './src' },
              { find: '~', replacement: './components' }
            ] }
          })
        `,
        )
        const result = await parseViteConfig(configPath)
        return result.resolve?.alias?.length
      },
      expect: 2,
      info: 'parses array-style alias',
    },
    {
      fn: async () => {
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(
          configPath,
          `
          export default defineConfig({
            resolve: { alias: { find: '/invalid[regex/', replacement: './src' } }
          })
        `,
        )
        const result = await parseViteConfig(configPath)
        return result.resolve?.alias?.[0]?.find
      },
      expect: '/invalid[regex/',
      info: 'handles invalid regex pattern',
    },
    {
      fn: async () => {
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(
          configPath,
          `
          export default defineConfig({
            resolve: { alias: { find: @ } } // bare @ will cause syntax error
          })
        `,
        )
        const result = await parseViteConfig(configPath)
        return result.resolve
      },
      expect: undefined,
      info: 'catches alias processing errors',
    },
    {
      fn: async () => {
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(
          configPath,
          `
          export default defineConfig({
            define: { __VITE_PROD__: false, __VITE_DEV__: true }
          })
        `,
        )
        const result = await parseViteConfig(configPath)
        return result.define
      },
      expect: { __VITE_PROD__: false, __VITE_DEV__: true },
      info: 'parses define from config',
    },
    {
      fn: async () => {
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(
          configPath,
          `
          export default defineConfig({
            define: { __VITE_PROD__: } // syntax error
          })
        `,
        )
        const result = await parseViteConfig(configPath)
        return result.define
      },
      expect: undefined,
      info: 'catches define parse errors',
    },
    {
      fn: async () => {
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(configPath, `export default defineConfig({})`)
        const config = await parseViteConfig(configPath)
        return config
      },
      expect: {},
      info: 'uses cache on subsequent calls',
    },
  ],
}
