import os from 'node:os'
import path from 'node:path'

import is from '@magic/types'
import { has } from '#lib/has.js'
import { processImports } from '#lib/svelte/compile/processImports.js'

const tmpFile = (name: string): string => path.join(os.tmpdir(), `pi-test-${Date.now()}-${name}`)

export default [
  {
    fn: async () => {
      const code = `import './app.css'\nexport const x = 1\n`
      const out = await processImports(code, tmpFile('css-drop.ts'))
      return out
    },
    expect: has.not.string('app.css'),
    info: 'drops side-effect CSS imports (no Node.js equivalent)',
  },
  {
    fn: async () => {
      const code = `import './app.css'\nexport const x = 1\n`
      const out = await processImports(code, tmpFile('css-drop2.ts'))
      return out
    },
    expect: has.string('export const x = 1'),
    info: 'keeps the rest of the module when dropping a CSS import',
  },
  {
    fn: async () => {
      const code = `import './styles.css?inline'\nexport const y = 2\n`
      const out = await processImports(code, tmpFile('css-query.ts'))
      return out
    },
    expect: has.not.string('styles.css'),
    info: 'drops side-effect CSS imports with query strings',
  },
  {
    fn: async () => {
      const code = `import './polyfill.js'\nexport const z = 3\n`
      const out = await processImports(code, tmpFile('js-keep.ts'))
      return out
    },
    expect: has.string("import './polyfill.js'"),
    info: 'keeps side-effect JS imports (they resolve natively in Node)',
  },
  {
    fn: async () => {
      const code = `import './missing.css'\nconst a = 1\n`
      const out = await processImports(code, tmpFile('css-missing.ts'))
      return out
    },
    expect: [is.str, has.not.string('missing.css')],
    info: 'drops CSS imports even when the file does not exist',
  },
  {
    fn: async () => {
      const code = `import * as c from '../../caches/LRUCache.js'\nexport const w = 4\n`
      const source = path.join(
        process.cwd(),
        'src',
        'lib',
        'svelte',
        'compile',
        'processImports.ts',
      )
      const out = await processImports(code, source)
      return out
    },
    expect: [has.not.string("'../../caches/LRUCache.js'"), has.matches(/import \* as c from '/)],
    info: 'rewrites resolvable imports to their compiled path',
  },
]
