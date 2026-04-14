import path from 'node:path'
import { fs } from '@magic/fs'
import { mount } from '../src/index.js'
import { resolveAlias } from '../src/lib/svelte/viteConfig/index.js'
import { configCache, aliasCache } from '../src/lib/svelte/viteConfig/cache.js'
import { findProjectRoot } from '../src/lib/svelte/viteConfig/findProjectRoot.js'

const VITE_CONFIG = `import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: [
      { find: '$test', replacement: './test/.tmp/test-alias-dir' },
      { find: /^@org\\/(.*)/, replacement: './test/.tmp/replacement-dir/$1' },
    ]
  }
})
`

const TEST_COMPONENT_CONTENT = `<script>
import Button from '$test/ViteAlias.svelte'
</script>

<Button />
`

const TEST_ALIAS_DIR = 'test/.tmp/test-alias-dir'
const TEST_BUTTON_CONTENT = `<script>
export let count = 0
</script>

<button>{count}</button>
`

const REGEX_ALIAS_DIR = 'test/.tmp/replacement-dir'
const REGEX_FILE_CONTENT = `export const test = 1`

const REGEX_PACKAGE_FILE = 'test/.tmp/replacement-dir/package'
const REGEX_PACKAGE_CONTENT = 'export const pkg = 1'

export default {
  beforeAll: async () => {
    await fs.mkdir(TEST_ALIAS_DIR, { recursive: true })
    await fs.writeFile(path.join(TEST_ALIAS_DIR, 'ViteAlias.svelte'), TEST_BUTTON_CONTENT)
    await fs.mkdir(REGEX_ALIAS_DIR, { recursive: true })
    await fs.writeFile(path.join(REGEX_ALIAS_DIR, 'TestRegex.svelte'), REGEX_FILE_CONTENT)
    await fs.writeFile(REGEX_PACKAGE_FILE, REGEX_PACKAGE_CONTENT)
    await fs.writeFile('test/.tmp/test-alias-component.svelte', TEST_COMPONENT_CONTENT)
    await fs.writeFile('vite.config.js', VITE_CONFIG)

    configCache.clear()
    aliasCache.clear()

    return async () => {
      await fs.rm(TEST_ALIAS_DIR, { recursive: true, force: true })
      await fs.rm(REGEX_ALIAS_DIR, { recursive: true, force: true })
      await fs.unlink('vite.config.js')
      try {
        await fs.unlink('test/.tmp/test-alias-component.svelte')
      } catch {
        // intentionally left blank
      }

      configCache.clear()
      aliasCache.clear()
    }
  },
  tests: [
    {
      fn: () => resolveAlias('$test/ViteAlias.svelte', 'test/test-file.svelte'),
      expect: path.resolve('test/.tmp/test-alias-dir/ViteAlias.svelte'),
      info: 'resolves $test alias to test-alias-dir',
    },
    {
      fn: () => resolveAlias('$test', 'test/test-file.svelte'),
      expect: null,
      info: 'resolves exact $test alias match returns null (directory without index)',
    },
    {
      fn: async () => resolveAlias('@org/package', 'test/test-file.svelte'),
      expect: path.resolve(REGEX_PACKAGE_FILE),
      info: 'resolves regex alias pattern',
    },
    {
      fn: () => resolveAlias('nonexistent/path', 'test/test-file.svelte'),
      expect: null,
      info: 'returns null for non-matching path',
    },
    {
      fn: async () => {
        const result = await findProjectRoot('test/test-file.svelte')
        return result
      },
      expect: process.cwd(),
      info: 'findProjectRoot returns current working directory',
    },
    {
      fn: async () => {
        const result = await mount('./test/.tmp/test-alias-component.svelte')
        const button = (
          result.target as { querySelector: (s: string) => { textContent: string } }
        ).querySelector('button')
        const text = button?.textContent
        await result.unmount()
        return text
      },
      expect: '0',
      info: 'mounts component with $test alias import',
    },
  ],
}
