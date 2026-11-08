import path from 'node:path'
import {
  isSkipPattern,
  resolveFilePath,
  EXTENSION_CANDIDATES,
  FALLBACK_CANDIDATES,
} from '#lib/svelte/compile/pathUtils.js'
import { getCwd } from '#src/constants.js'
import { has } from '#lib/has.js'
import type { TestCase } from '#src/types.js'

const beforeAllBase = path.join(getCwd(), 'test', 'beforeAll')
const pkgJsonPath = path.join(getCwd(), 'package.json')
const buttonJsPath = path.join(
  getCwd(),
  'src',
  'lib',
  'svelte',
  'testFixtures',
  'components',
  'Button.js',
)

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
    fn: () => EXTENSION_CANDIDATES,
    expect: has.includes('', '.svelte'),
    info: 'EXTENSION_CANDIDATES contains empty and .svelte',
  },
  {
    fn: () => FALLBACK_CANDIDATES,
    expect: has.includes('index.js'),
    info: 'FALLBACK_CANDIDATES contains index.js',
  },

  // resolveFilePath
  {
    fn: async () => {
      // an existing .js file relative to getCwd()
      // beforeAll.ts exists
      return await resolveFilePath(beforeAllBase)
    },
    expect: beforeAllBase + '.ts',
    info: 'resolveFilePath finds .ts file',
  },
  {
    fn: async () => {
      const base = path.join(getCwd(), 'test', 'nonexistent-file-xyz')
      return await resolveFilePath(base)
    },
    expect: null,
    info: 'resolveFilePath returns null when nothing found',
  },
  {
    fn: async () => {
      // package.json exists
      return await resolveFilePath(pkgJsonPath)
    },
    expect: pkgJsonPath,
    info: 'resolveFilePath returns exact existing file',
  },
  {
    fn: async () => {
      // restrict to only .mjs extension -> found for beforeAll.mjs
      return await resolveFilePath(beforeAllBase, ['.mjs'])
    },
    expect: beforeAllBase + '.mjs',
    info: 'resolveFilePath with restricted extensions finds .mjs',
  },
  {
    fn: async () => {
      // restrict to only .svx extension -> nothing found
      return await resolveFilePath(beforeAllBase, ['.svx'])
    },
    expect: null,
    info: 'resolveFilePath with non-matching extension returns null',
  },
  {
    fn: async () => {
      // .js base with .svelte sibling: #lib/svelte/testFixtures/components/Button.svelte
      // base ends in .js: .../Button.js -> strip to Button + .svelte
      return await resolveFilePath(buttonJsPath)
    },
    expect: buttonJsPath.slice(0, -3) + '.svelte',
    info: 'resolveFilePath swaps .js for .svelte sibling',
  },
]

export default tests
