import path from 'node:path'
import { fs } from '@magic/fs'
import { mount } from '../src/lib/index.js'
import { resolveAlias } from '../src/lib/svelte/vite-config.js'

const VITE_CONFIG = `import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '$test': './test-alias-dir',
    }
  }
})
`

const TEST_COMPONENT_CONTENT = `<script>
import Button from '$test/ViteAlias.svelte'
</script>

<Button />
`

const TEST_ALIAS_DIR = 'test-alias-dir'
const TEST_BUTTON_CONTENT = `<script>
export let count = 0
</script>

<button>{count}</button>
`

export default {
  beforeAll: async () => {
    await fs.mkdir(TEST_ALIAS_DIR, { recursive: true })
    await fs.writeFile(path.join(TEST_ALIAS_DIR, 'ViteAlias.svelte'), TEST_BUTTON_CONTENT)
    await fs.writeFile('test-alias-component.svelte', TEST_COMPONENT_CONTENT)
    await fs.writeFile('vite.config.js', VITE_CONFIG)

    const { configCache, aliasCache } = await import('../src/lib/svelte/vite-config.js')
    configCache.clear()
    aliasCache.clear()

    return async () => {
      await fs.rm(TEST_ALIAS_DIR, { recursive: true, force: true })
      await fs.unlink('vite.config.js')
      try {
        await fs.unlink('test-alias-component.svelte')
      } catch {}

      configCache.clear()
      aliasCache.clear()
    }
  },
  tests: [
    {
      fn: () => resolveAlias('$test/ViteAlias.svelte', 'test/test-file.svelte'),
      expect: path.resolve('test-alias-dir/ViteAlias.svelte'),
      info: 'resolves $test alias to test-alias-dir',
    },
    {
      fn: async () => {
        const { target, unmount } = await mount('./test-alias-component.svelte')

        const button = target.querySelector('button')
        const result = button?.textContent
        await unmount()
        return result
      },
      expect: '0',
      info: 'mounts component with $test alias import',
    },
  ],
}
