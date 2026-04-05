import path from 'node:path'
import { fs } from '@magic/fs'
import { resolveAlias } from '../../../../src/lib/svelte/viteConfig/resolveAlias.js'
import { aliasCache } from '../../../../src/lib/svelte/viteConfig/cache.js'
import { configCache } from '../../../../src/lib/svelte/viteConfig/cache.js'

const PROJECT_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'resolveAlias')

export default {
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
        const sourceFile = path.join(projectDir, 'src', 'Component.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const result = await resolveAlias('react', sourceFile)
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
        const sourceFile = path.join(projectDir, 'src', 'Component.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const targetDir = path.join(projectDir, 'test-alias')
        await fs.mkdir(targetDir, { recursive: true })
        await fs.writeFile(path.join(targetDir, 'Button.svelte'), '')
        const viteConfig = path.join(projectDir, 'vite.config.js')
        await fs.writeFile(
          viteConfig,
          `
          export default defineConfig({
            resolve: { alias: { find: '$test', replacement: './test-alias' } }
          })
        `,
        )
        const result = await resolveAlias('$test/Button.svelte', sourceFile)
        if (result === null) throw new Error('Expected a result, got null')
        const expectedRel = path.join('test-alias', 'Button.svelte')
        const rel = path.relative(projectDir, result)
        if (rel !== expectedRel)
          throw new Error(`Expected ${expectedRel}, got ${rel} (full: ${result})`)
        return true
      },
      expect: true,
      info: 'resolves exact alias match',
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
        const sourceFile = path.join(projectDir, 'src', 'Component.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const utilsDir = path.join(projectDir, 'src', 'utils')
        await fs.mkdir(utilsDir, { recursive: true })
        await fs.writeFile(path.join(utilsDir, 'helpers.js'), '')
        const viteConfig = path.join(projectDir, 'vite.config.js')
        await fs.writeFile(
          viteConfig,
          `
          export default defineConfig({
            resolve: { alias: { find: '@', replacement: './src' } }
          })
        `,
        )
        const result = await resolveAlias('@/utils/helpers', sourceFile)
        if (result === null) throw new Error('Expected a result, got null')
        const expectedRel = path.join('src', 'utils', 'helpers.js')
        const rel = path.relative(projectDir, result)
        if (rel !== expectedRel) throw new Error(`Expected ${expectedRel}, got ${rel}`)
        return true
      },
      expect: true,
      info: 'resolves prefix match',
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
        const sourceFile = path.join(projectDir, 'src', 'Component.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const pkgDir = path.join(projectDir, 'packages', 'comp')
        await fs.mkdir(pkgDir, { recursive: true })
        await fs.writeFile(path.join(pkgDir, 'index.ts'), '')
        const viteConfig = path.join(projectDir, 'vite.config.js')
        await fs.writeFile(
          viteConfig,
          `
            export default defineConfig({
              resolve: { alias: { find: /^@org\\/(.*)/, replacement: './packages/$1' } }
            })
          `,
        )
        const result = await resolveAlias('@org/comp', sourceFile)
        if (result === null) throw new Error('Expected a result, got null')
        const expectedRel = path.join('packages', 'comp', 'index.ts')
        const rel = path.relative(projectDir, result)
        if (rel !== expectedRel) throw new Error(`Expected ${expectedRel}, got ${rel}`)
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
        const sourceFile = path.join(projectDir, 'src', 'Component.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const libDir = path.join(projectDir, 'lib')
        await fs.mkdir(libDir, { recursive: true })
        await fs.writeFile(path.join(libDir, 'logger.js'), '')
        const viteConfig = path.join(projectDir, 'vite.config.js')
        await fs.writeFile(
          viteConfig,
          `
          export default defineConfig({
            resolve: { alias: { find: '$lib', replacement: './lib' } }
          })
        `,
        )
        const result = await resolveAlias('$lib/logger', sourceFile)
        if (result === null) throw new Error('Expected a result, got null')
        const expectedRel = path.join('lib', 'logger.js')
        const rel = path.relative(projectDir, result)
        if (rel !== expectedRel) throw new Error(`Expected ${expectedRel}, got ${rel}`)
        return true
      },
      expect: true,
      info: 'falls back to .js extension',
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
        const sourceFile = path.join(projectDir, 'src', 'Component.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const componentsDir = path.join(projectDir, 'components')
        await fs.mkdir(componentsDir, { recursive: true })
        await fs.writeFile(path.join(componentsDir, 'index.ts'), '')
        const viteConfig = path.join(projectDir, 'vite.config.js')
        await fs.writeFile(
          viteConfig,
          `
            export default defineConfig({
              resolve: { alias: { find: '$comp', replacement: './components' } }
            })
          `,
        )
        const result = await resolveAlias('$comp', sourceFile)
        if (result === null) throw new Error('Expected a result, got null')
        const expectedRel = path.join('components', 'index.ts')
        const rel = path.relative(projectDir, result)
        if (rel !== expectedRel) throw new Error(`Expected ${expectedRel}, got ${rel}`)
        return true
      },
      expect: true,
      info: 'falls back to /index.ts',
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
        const sourceFile = path.join(projectDir, 'src', 'Component.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const utilsDir = path.join(projectDir, 'src', 'utils')
        await fs.mkdir(utilsDir, { recursive: true })
        await fs.writeFile(path.join(utilsDir, 'helper.ts'), '')
        const viteConfig = path.join(projectDir, 'vite.config.js')
        await fs.writeFile(
          viteConfig,
          `
          export default defineConfig({
            resolve: { alias: { find: '@', replacement: './src' } }
          })
        `,
        )
        const result = await resolveAlias('@/utils/helper', sourceFile)
        if (result === null) throw new Error('Expected a result, got null')
        const expectedRel = path.join('src', 'utils', 'helper.ts')
        const rel = path.relative(projectDir, result)
        if (rel !== expectedRel) throw new Error(`Expected ${expectedRel}, got ${rel}`)
        return true
      },
      expect: true,
      info: 'converts .js to .ts',
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
        const sourceFile = path.join(projectDir, 'src', 'Component.svelte')
        await fs.mkdir(path.dirname(sourceFile), { recursive: true })
        await fs.writeFile(sourceFile, '')
        const viteConfig = path.join(projectDir, 'vite.config.js')
        await fs.writeFile(
          viteConfig,
          `
          export default defineConfig({
            resolve: { alias: { find: '$missing', replacement: './missing' } }
          })
        `,
        )
        const result = await resolveAlias('$missing/xyz', sourceFile)
        if (result !== null) throw new Error(`Expected null, got ${result}`)
        return true
      },
      expect: true,
      info: 'returns null when no matching file exists',
    },
  ],
}
