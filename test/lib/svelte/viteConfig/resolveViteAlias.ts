import path from 'node:path'
import { fs } from '@magic/fs'
import { resolveViteAlias } from '../../../../src/lib/svelte/viteConfig/resolveViteAlias.js'
import { aliasCache } from '../../../../src/lib/svelte/viteConfig/cache.js'
import { configCache } from '../../../../src/lib/svelte/viteConfig/cache.js'

const PROJECT_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'resolveViteAlias')

export default {
  name: 'resolveViteAlias',
  beforeAll: async () => {
    await fs.mkdir(PROJECT_ROOT, { recursive: true })
  },
  afterAll: async () => {
    await fs.rmrf(PROJECT_ROOT)
  },
  tests: [
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const projectDir = path.join(
          PROJECT_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(projectDir, { recursive: true })
        await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'test' }))
        const sourceFile = path.join(projectDir, 'src', 'App.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const result = await resolveViteAlias('./relative', sourceFile)
        if (result !== null) throw new Error(`Expected null, got ${result}`)
        return true
      },
      expect: true,
      info: 'returns null for relative imports',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const projectDir = path.join(
          PROJECT_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(projectDir, { recursive: true })
        await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'test' }))
        const sourceFile = path.join(projectDir, 'src', 'App.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const shimPath = path.join(
          projectDir,
          'src',
          'lib',
          'svelte',
          'shims',
          '$app',
          'navigation.js',
        )
        await fs.mkdir(path.dirname(shimPath), { recursive: true })
        await fs.writeFile(shimPath, '')
        const result = await resolveViteAlias('$app/navigation', sourceFile)
        const expected = shimPath
        if (result !== expected) throw new Error(`Expected ${expected}, got ${result}`)
        return true
      },
      expect: true,
      info: 'resolves $app/ via shims',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const projectDir = path.join(
          PROJECT_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(projectDir, { recursive: true })
        await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'test' }))
        const sourceFile = path.join(projectDir, 'src', 'App.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const viteConfig = path.join(projectDir, 'vite.config.js')
        await fs.writeFile(
          viteConfig,
          `
          export default defineConfig({
            resolve: { alias: { find: '$lib/*', replacement: './src/lib/*' } }
          })
        `,
        )
        const utilsFile = path.join(projectDir, 'src', 'lib', 'utils.js')
        await fs.mkdir(path.dirname(utilsFile), { recursive: true })
        await fs.writeFile(utilsFile, '')
        const result = await resolveViteAlias('$lib/utils', sourceFile)
        const expected = utilsFile
        if (result !== expected) throw new Error(`Expected ${expected}, got ${result}`)
        return true
      },
      expect: true,
      info: 'resolves $lib via alias',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const projectDir = path.join(
          PROJECT_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(projectDir, { recursive: true })
        await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'test' }))
        const sourceFile = path.join(projectDir, 'src', 'App.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const viteConfig = path.join(projectDir, 'vite.config.js')
        await fs.writeFile(
          viteConfig,
          `
            export default defineConfig({
              resolve: { alias: { find: /^@org\\/(.*)/, replacement: './pkg/$1' } }
            })
          `,
        )
        const pkgDir = path.join(projectDir, 'pkg', 'component')
        await fs.mkdir(pkgDir, { recursive: true })
        await fs.writeFile(path.join(pkgDir, 'index.ts'), '')
        const result = await resolveViteAlias('@org/component', sourceFile)
        const expected = path.join(pkgDir, 'index.ts')
        if (result !== expected) throw new Error(`Expected ${expected}, got ${result}`)
        return true
      },
      expect: true,
      info: 'resolves regex alias',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const projectDir = path.join(
          PROJECT_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(projectDir, { recursive: true })
        await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'test' }))
        const sourceFile = path.join(projectDir, 'src', 'App.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const libFile = path.join(projectDir, 'src', 'lib', 'test.js')
        await fs.mkdir(path.dirname(libFile), { recursive: true })
        await fs.writeFile(libFile, '')
        aliasCache.set(projectDir + ':vite', [])
        const result = await resolveViteAlias('$lib/test', sourceFile)
        const expected = libFile
        if (result !== expected) throw new Error(`Expected ${expected}, got ${result}`)
        return true
      },
      expect: true,
      info: 'falls back to src/lib for $lib',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const projectDir = path.join(
          PROJECT_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(projectDir, { recursive: true })
        await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'test' }))
        const sourceFile = path.join(projectDir, 'src', 'App.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const result = await resolveViteAlias('some-package', sourceFile)
        if (result !== null) throw new Error(`Expected null, got ${result}`)
        return true
      },
      expect: true,
      info: 'returns null for bare imports',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const projectDir = path.join(
          PROJECT_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(projectDir, { recursive: true })
        await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'test' }))
        const sourceFile = path.join(projectDir, 'src', 'App.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const shimPath = path.join(projectDir, 'src', 'lib', 'svelte', 'shims', '$app', 'stores.js')
        await fs.mkdir(path.dirname(shimPath), { recursive: true })
        await fs.writeFile(shimPath, '')
        const result = await resolveViteAlias('$app/stores', sourceFile)
        const expected = shimPath
        if (result !== expected) throw new Error(`Expected ${expected}, got ${result}`)
        return true
      },
      expect: true,
      info: 'second $app/ shim block also resolves',
    },
  ],
}
