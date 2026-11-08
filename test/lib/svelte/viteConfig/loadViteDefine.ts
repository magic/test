import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { loadViteDefine } from '#src/lib/svelte/viteConfig/loadViteDefine.js'
import type { TestCase } from '#src/types.js'

const withDir = async (files: Record<string, string>, fn: (dir: string) => Promise<unknown>) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'magic-vite-'))
  for (const [name, content] of Object.entries(files)) {
    await writeFile(path.join(dir, name), content)
  }
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

export default [
  {
    fn: () => withDir({}, dir => loadViteDefine(dir)),
    expect: {},
    info: 'loadViteDefine returns {} when no vite config exists',
  },
  {
    fn: () =>
      withDir(
        {
          'vite.config.js': `export default { define: { API_URL: '"http://api"', NUM: '2' } }`,
        },
        dir => loadViteDefine(dir),
      ),
    expect: { API_URL: '"http://api"', NUM: '2' },
    info: 'loadViteDefine reads define from vite.config.js',
  },
  {
    fn: () =>
      withDir(
        {
          'vite.config.ts': `export default { define: { TS_KEY: 'from-ts' } } as const`,
        },
        dir => loadViteDefine(dir),
      ),
    expect: { TS_KEY: 'from-ts' },
    info: 'loadViteDefine reads define from vite.config.ts',
  },
  {
    fn: () =>
      withDir(
        {
          'vite.config.js': `export default { resolve: { alias: {} } }`,
        },
        dir => loadViteDefine(dir),
      ),
    expect: {},
    info: 'loadViteDefine returns {} when the config has no define block',
  },
  {
    fn: () =>
      withDir(
        {
          'vite.config.js': `export default { define: {`,
        },
        dir => loadViteDefine(dir),
      ),
    expect: {},
    info: 'loadViteDefine returns {} when the config file is broken',
  },
  {
    fn: () =>
      withDir(
        {
          'vite.config.mjs': `export default { define: { MJS_KEY: 1 } }`,
        },
        dir => loadViteDefine(dir),
      ),
    expect: { MJS_KEY: 1 },
    info: 'loadViteDefine reads define from vite.config.mjs',
  },
  {
    fn: () =>
      withDir({ 'vite.config.js': `export default { define: { CACHED: 'yes' } }` }, async dir => {
        const first = await loadViteDefine(dir)
        const second = await loadViteDefine(dir)
        return { sameReference: first === second, second }
      }),
    expect: { sameReference: true, second: { CACHED: 'yes' } },
    info: 'loadViteDefine memoizes the define object per root directory',
  },
] satisfies TestCase[]
