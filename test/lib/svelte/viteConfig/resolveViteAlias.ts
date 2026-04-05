import path from 'node:path'
import { fs } from '@magic/fs'
import { resolveViteAlias } from '../../src/lib/svelte/viteConfig/resolveViteAlias.js'
import { aliasCache } from '../../src/lib/svelte/viteConfig/cache.js'
import { configCache } from '../../src/lib/svelte/viteConfig/cache.js'

const PROJECT_ROOT = path.join(
  process.cwd(),
  'test',
  '.tmp',
  'viteConfig',
  'resolveViteAlias',
  'project',
)
const SOURCE_FILE = path.join(PROJECT_ROOT, 'src', 'App.svelte')
const VITE_CONFIG = path.join(PROJECT_ROOT, 'vite.config.js')

export default {
  name: 'resolveViteAlias',
  beforeAll: async () => {
    aliasCache.clear()
    configCache.clear()
    await fs.mkdir(PROJECT_ROOT, { recursive: true })
    await fs.writeFile(path.join(PROJECT_ROOT, 'package.json'), JSON.stringify({ name: 'test' }))
    await fs.mkdir(path.dirname(SOURCE_FILE), { recursive: true })
    await fs.writeFile(SOURCE_FILE, '')
  },
  afterAll: async () => {
    await fs.rmrf(path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'resolveViteAlias'))
  },
  tests: [
    {
      fn: async () => {
        const result = await resolveViteAlias('./relative', SOURCE_FILE)
        return result
      },
      expect: null,
      info: 'returns null for relative imports',
    },
    {
      fn: async () => {
        const shimPath = path.join(
          PROJECT_ROOT,
          'src',
          'lib',
          'svelte',
          'shims',
          '$app',
          'navigation.js',
        )
        await fs.mkdir(path.dirname(shimPath), { recursive: true })
        await fs.writeFile(shimPath, '')
        const result = await resolveViteAlias('$app/navigation', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'src', 'lib', 'svelte', 'shims', '$app', 'navigation.js'),
      info: 'resolves $app/ via shims',
    },
    {
      fn: async () => {
        await fs.writeFile(
          VITE_CONFIG,
          `
          export default defineConfig({
            resolve: { alias: { find: '$lib/*', replacement: './src/lib/*' } }
          })
        `,
        )
        const utilsFile = path.join(PROJECT_ROOT, 'src', 'lib', 'utils.js')
        await fs.mkdir(path.dirname(utilsFile), { recursive: true })
        await fs.writeFile(utilsFile, '')
        const result = await resolveViteAlias('$lib/utils', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'src', 'lib', 'utils.js'),
      info: 'resolves $lib via alias',
    },
    {
      fn: async () => {
        await fs.writeFile(
          VITE_CONFIG,
          `
          export default defineConfig({
            resolve: { alias: { find: /^@org\\/(.*)/, replacement: './pkg/$1' } }
          })
        `,
        )
        const pkgDir = path.join(PROJECT_ROOT, 'pkg', 'component')
        await fs.mkdir(pkgDir, { recursive: true })
        await fs.writeFile(path.join(pkgDir, 'index.js'), '')
        const result = await resolveViteAlias('@org/component', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'pkg', 'component', 'index.js'),
      info: 'resolves regex alias',
    },
    {
      fn: async () => {
        const libFile = path.join(PROJECT_ROOT, 'src', 'lib', 'test.js')
        await fs.mkdir(path.dirname(libFile), { recursive: true })
        await fs.writeFile(libFile, '')
        aliasCache.set(PROJECT_ROOT + ':vite', [])
        const result = await resolveViteAlias('$lib/test', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'src', 'lib', 'test.js'),
      info: 'falls back to src/lib for $lib',
    },
    {
      fn: async () => {
        const result = await resolveViteAlias('some-package', SOURCE_FILE)
        return result
      },
      expect: null,
      info: 'returns null for bare imports',
    },
    {
      fn: async () => {
        const shimPath = path.join(
          PROJECT_ROOT,
          'src',
          'lib',
          'svelte',
          'shims',
          '$app',
          'stores.js',
        )
        await fs.mkdir(path.dirname(shimPath), { recursive: true })
        await fs.writeFile(shimPath, '')
        const result = await resolveViteAlias('$app/stores', SOURCE_FILE)
        return result
      },
      expect: path.join(PROJECT_ROOT, 'src', 'lib', 'svelte', 'shims', '$app', 'stores.js'),
      info: 'second $app/ shim block also resolves',
    },
  ],
}
