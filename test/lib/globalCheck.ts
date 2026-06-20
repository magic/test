import {
  functionModifiesGlobals,
  testModifiesGlobals,
  suiteModifiesGlobals,
} from '../../src/lib/globalCheck.js'
import type { TestCase } from '../../src/types.js'

export default [
  // functionModifiesGlobals
  {
    fn: () => functionModifiesGlobals(() => {}),
    expect: false,
    info: 'returns false for plain function',
  },
  {
    fn: () => functionModifiesGlobals(() => globalThis.x),
    expect: true,
    info: 'detects globalThis access',
  },
  {
    fn: () => functionModifiesGlobals(() => window.x),
    expect: true,
    info: 'detects window access',
  },
  {
    fn: () => functionModifiesGlobals(() => global.x),
    expect: true,
    info: 'detects global access',
  },
  {
    fn: () => functionModifiesGlobals(() => self.x),
    expect: true,
    info: 'detects self access',
  },
  {
    fn: () => functionModifiesGlobals(() => process.env.X),
    expect: true,
    info: 'detects process.env access',
  },
  {
    fn: () => functionModifiesGlobals('not a function'),
    expect: false,
    info: 'returns false for non-function',
  },
  {
    fn: () => functionModifiesGlobals(42),
    expect: false,
    info: 'returns false for number',
  },
  {
    fn: () => functionModifiesGlobals(null),
    expect: false,
    info: 'returns false for null',
  },
  // testModifiesGlobals
  {
    fn: () => testModifiesGlobals({ fn: () => {} }),
    expect: false,
    info: 'testModifiesGlobals returns false for clean test',
  },
  {
    fn: () => testModifiesGlobals({ fn: () => globalThis.x }),
    expect: true,
    info: 'testModifiesGlobals detects fn modifying globals',
  },
  {
    fn: () => testModifiesGlobals({ before: () => window.x }),
    expect: true,
    info: 'testModifiesGlobals detects before modifying globals',
  },
  {
    fn: () => testModifiesGlobals({ after: () => global.x }),
    expect: true,
    info: 'testModifiesGlobals detects after modifying globals',
  },
  {
    fn: () => testModifiesGlobals({ expect: () => self.x }),
    expect: true,
    info: 'testModifiesGlobals detects expect modifying globals',
  },
  // suiteModifiesGlobals
  {
    fn: () => suiteModifiesGlobals([{ fn: () => {} }]),
    expect: false,
    info: 'suiteModifiesGlobals returns false for clean suite',
  },
  {
    fn: () => suiteModifiesGlobals([{ fn: () => globalThis.x }]),
    expect: true,
    info: 'suiteModifiesGlobals detects fn modifying globals in array',
  },
  {
    fn: () => suiteModifiesGlobals({ tests: [{ fn: () => {} }] }),
    expect: false,
    info: 'suiteModifiesGlobals returns false for clean object suite',
  },
  {
    fn: () => suiteModifiesGlobals({ beforeAll: () => window.x }),
    expect: true,
    info: 'suiteModifiesGlobals detects beforeAll modifying globals',
  },
  {
    fn: () => suiteModifiesGlobals({ afterAll: () => global.x }),
    expect: true,
    info: 'suiteModifiesGlobals detects afterAll modifying globals',
  },
  {
    fn: () => suiteModifiesGlobals({ beforeAll: () => window.x, tests: { nested: true } }),
    expect: true,
    info: 'suiteModifiesGlobals detects beforeAll modifying globals with nested tests',
  },
  // Edge cases
  {
    fn: () => functionModifiesGlobals(() => globalThis['x']),
    expect: true,
    info: 'detects bracket notation globalThis access',
  },
  {
    fn: () => functionModifiesGlobals(() => globalThis.process?.env),
    expect: true,
    info: 'detects optional chaining on globalThis',
  },
] satisfies TestCase[]
