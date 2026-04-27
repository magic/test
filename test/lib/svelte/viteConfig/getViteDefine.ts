import path from 'node:path'
import { fs } from '@magic/fs'
import { getViteDefine } from '../../../../src/lib/svelte/viteConfig/getViteDefine.js'
import { defineCache, configCache } from '../../../../src/lib/svelte/viteConfig/cache.js'
import is from '@magic/types'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'getViteDefine')

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
        await defineCache.clear()
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const testFile = path.join(testDir, 'test.js')

        const result = await getViteDefine(testFile)
        return result
      },
      expect: is.objectNative,
      info: 'returns an object',
    },
    {
      fn: async () => {
        await defineCache.clear()
        await configCache.clear()

        // Create a sub-project with its own package.json and vite.config
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })

        // Create package.json so findProjectRoot stops here
        await fs.writeFile(path.join(testDir, 'package.json'), '{"name": "test-sub"}')

        // Create vite.config with define
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(
          configPath,
          `
          export default defineConfig({
            define: { __VITE_PROD__: false }
          })
        `,
        )

        const testFile = path.join(testDir, 'test.js')
        const result = await getViteDefine(testFile)
        return result.__VITE_PROD__
      },
      expect: false,
      info: 'loads define from sub-project config',
    },
  ],
}