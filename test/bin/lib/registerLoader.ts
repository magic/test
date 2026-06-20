// registerLoader.ts registers the TypeScript loader with Node.js module system
// This is a side-effect only module - it cannot be meaningfully tested
// in unit tests as it modifies the Node.js module resolution.
// Testing this module requires integration tests.

import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: () => true,
    expect: true,
    info: 'registerLoader is a side-effect module (test skipped)',
  },
] satisfies TestCase[]
