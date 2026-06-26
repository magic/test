import path from 'node:path'
import { fs } from '@magic/fs'
import { CACHE_DIR } from '../src/constants.js'
import { mount } from '../src/svelte.js'
import { resolveAlias } from '../src/lib/svelte/viteConfig/index.js'
import { configCache, aliasCache } from '../src/lib/svelte/viteConfig/cache.js'
import { findProjectRoot } from '../src/lib/svelte/viteConfig/findProjectRoot.js'
import type { CustomError } from '@magic/error'

const TEST_BASE = path.join(CACHE_DIR, 'vite-alias')

const VITE_CONFIG = `export default {
  resolve: {
    alias: [
      { find: '$test', replacement: '${TEST_BASE}/test-alias-dir' },
      { find: /^@org\\/(.*)/, replacement: '${TEST_BASE}/replacement-dir/$1' },
    ]
  }
}
`

const TEST_COMPONENT_CONTENT = `<script>
import Button from '$test/ViteAlias.svelte'
</script>

<Button />
`

const TEST_ALIAS_DIR = path.join(TEST_BASE, 'test-alias-dir')
const TEST_BUTTON_CONTENT = `<script>
export let count = 0
</script>

<button>{count}</button>
`

const REGEX_ALIAS_DIR = path.join(TEST_BASE, 'replacement-dir')
const REGEX_FILE_CONTENT = `export const test = 1`

const REGEX_PACKAGE_FILE = path.join(REGEX_ALIAS_DIR, 'package')
const REGEX_PACKAGE_CONTENT = 'export const pkg = 1'

const TEST_COMPONENT_FILE = path.join(TEST_BASE, 'test-alias-component.svelte')

const tryCatchRm = async (file: string) => {
  try {
    await fs.rmrf(file)
  } catch (e) {
    const err = e as CustomError
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
}

export default {
  beforeAll: async () => {
    await fs.mkdirp(TEST_ALIAS_DIR)
    await fs.writeFile(path.join(TEST_ALIAS_DIR, 'ViteAlias.svelte'), TEST_BUTTON_CONTENT)
    await fs.mkdirp(REGEX_ALIAS_DIR)
    await fs.writeFile(path.join(REGEX_ALIAS_DIR, 'TestRegex.svelte'), REGEX_FILE_CONTENT)
    await fs.writeFile(REGEX_PACKAGE_FILE, REGEX_PACKAGE_CONTENT)
    await fs.writeFile(TEST_COMPONENT_FILE, TEST_COMPONENT_CONTENT)
    await fs.writeFile('vite.config.js', VITE_CONFIG)

    configCache.clear()
    aliasCache.clear()

    return async () => {
      await Promise.all([
        tryCatchRm(TEST_ALIAS_DIR),
        tryCatchRm(REGEX_ALIAS_DIR),
        tryCatchRm('vite.config.js'),
        tryCatchRm(TEST_COMPONENT_FILE),
      ])

      configCache.clear()
      aliasCache.clear()
    }
  },
  tests: [
    {
      fn: () => resolveAlias('$test/ViteAlias.svelte', 'test/test-file.svelte'),
      expect: path.resolve(path.join(TEST_ALIAS_DIR, 'ViteAlias.svelte')),
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
        const result = await mount(TEST_COMPONENT_FILE)
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
