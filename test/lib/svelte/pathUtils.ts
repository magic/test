import path from 'node:path'
import {
  isSkipPattern,
  resolveFilePath,
  EXTENSION_CANDIDATES,
  FALLBACK_CANDIDATES,
} from '#lib/svelte/compile/pathUtils.js'
import { CWD } from '#src/constants.js'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // isSkipPattern
  { fn: () => isSkipPattern(''), expect: true, info: 'isSkipPattern empty string' },
  { fn: () => isSkipPattern('./relative.js'), expect: true, info: 'isSkipPattern ./relative' },
  { fn: () => isSkipPattern('../up.js'), expect: true, info: 'isSkipPattern ../up' },
  { fn: () => isSkipPattern('$lib/foo'), expect: true, info: 'isSkipPattern $lib alias' },
  { fn: () => isSkipPattern('/abs/path'), expect: true, info: 'isSkipPattern absolute' },
  { fn: () => isSkipPattern('svelte'), expect: false, info: 'isSkipPattern bare package' },
  { fn: () => isSkipPattern('@magic/types'), expect: false, info: 'isSkipPattern scoped package' },

  // EXTENSION_CANDIDATES
  {
    fn: () => EXTENSION_CANDIDATES.includes('') && EXTENSION_CANDIDATES.includes('.svelte'),
    expect: true,
    info: 'EXTENSION_CANDIDATES contains empty and .svelte',
  },
  {
    fn: () => FALLBACK_CANDIDATES.includes('index.js'),
    expect: true,
    info: 'FALLBACK_CANDIDATES contains index.js',
  },

  // resolveFilePath
  {
    fn: async () => {
      // an existing .js file relative to CWD
      const base = path.join(CWD, 'test', 'beforeAll')
      // beforeAll.ts exists
      return (await resolveFilePath(base)) === base + '.ts'
    },
    expect: true,
    info: 'resolveFilePath finds .ts file',
  },
  {
    fn: async () => {
      const base = path.join(CWD, 'test', 'nonexistent-file-xyz')
      return (await resolveFilePath(base)) === null
    },
    expect: true,
    info: 'resolveFilePath returns null when nothing found',
  },
  {
    fn: async () => {
      // package.json exists
      const base = path.join(CWD, 'package.json')
      return (await resolveFilePath(base)) === base
    },
    expect: true,
    info: 'resolveFilePath returns exact existing file',
  },
  {
    fn: async () => {
      // restrict to only .mjs extension -> found for beforeAll.mjs
      const base = path.join(CWD, 'test', 'beforeAll')
      return (await resolveFilePath(base, ['.mjs'])) === base + '.mjs'
    },
    expect: true,
    info: 'resolveFilePath with restricted extensions finds .mjs',
  },
  {
    fn: async () => {
      // restrict to only .svx extension -> nothing found
      const base = path.join(CWD, 'test', 'beforeAll')
      return (await resolveFilePath(base, ['.svx'])) === null
    },
    expect: true,
    info: 'resolveFilePath with non-matching extension returns null',
  },
  {
    fn: async () => {
      // .js base with .svelte sibling: #lib/svelte/testFixtures/components/Button.svelte
      // base ends in .js: .../Button.js -> strip to Button + .svelte
      const base = path.join(CWD, 'src', 'lib', 'svelte', 'testFixtures', 'components', 'Button.js')
      return (await resolveFilePath(base)) === base.slice(0, -3) + '.svelte'
    },
    expect: true,
    info: 'resolveFilePath swaps .js for .svelte sibling',
  },
]

export default tests
