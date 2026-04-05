import path from 'node:path'
import { fs } from '@magic/fs'
import { configCache } from '../../src/lib/svelte/viteConfig/cache.js'
import { parseViteConfig } from '../../src/lib/svelte/viteConfig/parseViteConfig.js'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'parseViteConfig')
const CONFIG_PATH = path.join(TEST_ROOT, 'vite.config.js')
const EXPECTED_REPLACEMENT = path.join(TEST_ROOT, 'src')

export default {
  beforeAll: async () => {
    configCache.clear()
    await fs.mkdir(TEST_ROOT, { recursive: true })
  },
  afterAll: async () => {
    await fs.rmrf(TEST_ROOT)
  },
  tests: [
    {
      fn: async () => {
        // No alias, no define
        await fs.writeFile(CONFIG_PATH, `export default defineConfig({})`)
        const result = await parseViteConfig(CONFIG_PATH)
        return result
      },
      expect: {},
      info: 'empty config returns empty object',
    },
    {
      fn: async () => {
        // Object alias
        await fs.writeFile(
          CONFIG_PATH,
          `
          export default defineConfig({
            resolve: { alias: { find: '@', replacement: './src' } }
          })
        `,
        )
        const result = await parseViteConfig(CONFIG_PATH)
        return result.resolve?.alias?.[0]
      },
      expect: { find: '@', replacement: EXPECTED_REPLACEMENT },
      info: 'parses object-style alias',
    },
    {
      fn: async () => {
        // Array alias
        await fs.writeFile(
          CONFIG_PATH,
          `
          export default defineConfig({
            resolve: { alias: [
              { find: '@', replacement: './src' },
              { find: '~', replacement: './components' }
            ] }
          })
        `,
        )
        const result = await parseViteConfig(CONFIG_PATH)
        return result.resolve?.alias?.length
      },
      expect: 2,
      info: 'parses array-style alias',
    },
    {
      fn: async () => {
        // Invalid regex in alias - should be kept as string
        await fs.writeFile(
          CONFIG_PATH,
          `
          export default defineConfig({
            resolve: { alias: { find: '/invalid[regex/', replacement: './src' } }
          })
        `,
        )
        const result = await parseViteConfig(CONFIG_PATH)
        return result.resolve?.alias?.[0]?.find
      },
      expect: '/invalid[regex/',
      info: 'handles invalid regex pattern',
    },
    {
      fn: async () => {
        // Alias processing error: malformed alias object causing syntax error in new Function
        await fs.writeFile(
          CONFIG_PATH,
          `
          export default defineConfig({
            resolve: { alias: { find: @ } } // bare @ will cause syntax error
          })
        `,
        )
        const result = await parseViteConfig(CONFIG_PATH)
        return result.resolve
      },
      expect: undefined,
      info: 'catches alias processing errors',
    },
    {
      fn: async () => {
        // Define parsing
        await fs.writeFile(
          CONFIG_PATH,
          `
          export default defineConfig({
            define: { __VITE_PROD__: false, __VITE_DEV__: true }
          })
        `,
        )
        const result = await parseViteConfig(CONFIG_PATH)
        return result.define
      },
      expect: { __VITE_PROD__: false, __VITE_DEV__: true },
      info: 'parses define from config',
    },
    {
      fn: async () => {
        // Define parse error: invalid syntax
        await fs.writeFile(
          CONFIG_PATH,
          `
          export default defineConfig({
            define: { __VITE_PROD__: } // syntax error
          })
        `,
        )
        const result = await parseViteConfig(CONFIG_PATH)
        return result.define
      },
      expect: undefined,
      info: 'catches define parse errors',
    },
    {
      fn: async () => {
        // Cache hit: pre-populate cache with any mtime
        const fakeMtime = Date.now()
        configCache.set(CONFIG_PATH, {
          config: { define: { cached: true } },
          mtime: fakeMtime,
        })
        // Ensure file exists because fs.stat will be called
        await fs.writeFile(CONFIG_PATH, `export default defineConfig({})`)
        const result = await parseViteConfig(CONFIG_PATH)
        return result
      },
      expect: { define: { cached: true } },
      info: 'uses cached config when mtime matches',
    },
  ],
}
