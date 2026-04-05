import path from 'node:path'
import { fs } from '@magic/fs'
import { resolveAlias } from '../../src/lib/svelte/viteConfig/resolveAlias.js'
import { aliasCache } from '../../src/lib/svelte/viteConfig/cache.js'
import { configCache } from '../../src/lib/svelte/viteConfig/cache.js'

const PROJECT_ROOT = path.join(
  process.cwd(),
  'test',
  '.tmp',
  'viteConfig',
  'resolveAlias',
  'project',
)
const SOURCE_FILE = path.join(PROJECT_ROOT, 'src', 'Component.svelte')
const VITE_CONFIG = path.join(PROJECT_ROOT, 'vite.config.js')

export default {
  beforeAll: async () => {
    aliasCache.clear()
    configCache.clear()
    await fs.mkdir(PROJECT_ROOT, { recursive: true })
    await fs.writeFile(path.join(PROJECT_ROOT, 'package.json'), JSON.stringify({ name: 'test' }))
    await fs.mkdir(path.dirname(SOURCE_FILE), { recursive: true })
    await fs.writeFile(SOURCE_FILE, '')
  },
  afterAll: async () => {
    await fs.rmrf(path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'resolveAlias'))
  },
  tests: [
    {
      fn: async () => {
        const result = await resolveAlias('react', SOURCE_FILE)
        return result
      },
      expect: null,
      info: 'returns null for bare imports',
    },
    {
      fn: async () => {
        const targetDir = path.join(PROJECT_ROOT, 'test-alias')
        await fs.mkdir(targetDir, { recursive: true })
        await fs.writeFile(path.join(targetDir, 'Button.svelte'), '')
        await fs.writeFile(
          VITE_CONFIG,
          `
          export default defineConfig({
            resolve: { alias: { find: '$test', replacement: './test-alias' } }
          })
        `,
        )
        const result = await resolveAlias('$test/Button.svelte', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'test-alias', 'Button.svelte'),
      info: 'resolves exact alias match',
    },
    {
      fn: async () => {
        const utilsDir = path.join(PROJECT_ROOT, 'src', 'utils')
        await fs.mkdir(utilsDir, { recursive: true })
        await fs.writeFile(path.join(utilsDir, 'helpers.js'), '')
        await fs.writeFile(
          VITE_CONFIG,
          `
          export default defineConfig({
            resolve: { alias: { find: '@', replacement: './src' } }
          })
        `,
        )
        const result = await resolveAlias('@/utils/helpers', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'src', 'utils', 'helpers'),
      info: 'resolves prefix match',
    },
    {
      fn: async () => {
        const pkgDir = path.join(PROJECT_ROOT, 'packages', 'comp')
        await fs.mkdir(pkgDir, { recursive: true })
        await fs.writeFile(path.join(pkgDir, 'index.ts'), '')
        await fs.writeFile(
          VITE_CONFIG,
          `
          export default defineConfig({
            resolve: { alias: { find: /^@org\\/(.*)/, replacement: './packages/$1' } }
          })
        `,
        )
        const result = await resolveAlias('@org/comp', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'packages', 'comp', 'index.ts'),
      info: 'resolves regex alias',
    },
    {
      fn: async () => {
        const libDir = path.join(PROJECT_ROOT, 'lib')
        await fs.mkdir(libDir, { recursive: true })
        await fs.writeFile(path.join(libDir, 'logger.js'), '')
        await fs.writeFile(
          VITE_CONFIG,
          `
          export default defineConfig({
            resolve: { alias: { find: '$lib', replacement: './lib' } }
          })
        `,
        )
        const result = await resolveAlias('$lib/logger', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'lib', 'logger.js'),
      info: 'falls back to .js extension',
    },
    {
      fn: async () => {
        await fs.mkdir(path.join(PROJECT_ROOT, 'components'), { recursive: true })
        await fs.writeFile(path.join(PROJECT_ROOT, 'components', 'index.ts'), '')
        await fs.writeFile(
          VITE_CONFIG,
          `
          export default defineConfig({
            resolve: { alias: { find: '$comp', replacement: './components' } }
          })
        `,
        )
        const result = await resolveAlias('$comp', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'components', 'index.ts'),
      info: 'falls back to /index.ts',
    },
    {
      fn: async () => {
        const utilsDir = path.join(PROJECT_ROOT, 'src', 'utils')
        await fs.mkdir(utilsDir, { recursive: true })
        await fs.writeFile(path.join(utilsDir, 'helper.ts'), '')
        await fs.writeFile(
          VITE_CONFIG,
          `
          export default defineConfig({
            resolve: { alias: { find: '@', replacement: './src' } }
          })
        `,
        )
        const result = await resolveAlias('@/utils/helper', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'src', 'utils', 'helper.ts'),
      info: 'converts .js to .ts',
    },
    {
      fn: async () => {
        await fs.writeFile(
          VITE_CONFIG,
          `
          export default defineConfig({
            resolve: { alias: { find: '$missing', replacement: './missing' } }
          })
        `,
        )
        const result = await resolveAlias('$missing/xyz', SOURCE_FILE)
        return result
      },
      expect: null,
      info: 'returns null when no matching file exists',
    },
  ],
}
