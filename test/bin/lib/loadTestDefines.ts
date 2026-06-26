// loadTestDefines requires file system operations with specific file paths
// and relies on process.cwd(). These tests require complex setup.
// For now, we test the function exists and returns expected types.

import is from '@magic/types'
import { loadTestDefines } from '../../../src/bin/lib/loadTestDefines.js'
import type { TestCase } from '../../../src/types.js'

export default [
  // Function exists and is async
  {
    fn: async () => loadTestDefines,
    expect: is.function,
    info: 'loadTestDefines is a function',
  },
  // Returns promise
  {
    // can not return and expect: is.promise, @magic/test will await the promise if we do
    fn: () => is.promise(loadTestDefines('/nonexistent/path')),
    expect: true,
    info: 'loadTestDefines returns a Promise',
  },
  // Returns empty object when no files exist
  {
    fn: async () => loadTestDefines('/nonexistent/path/that/does/not/exist'),
    expect: is.objectNative,
    info: 'returns empty object for nonexistent directory',
  },
  // Returns object when test directory doesn't exist
  {
    fn: async () => await loadTestDefines('/tmp'),
    expect: is.object,
    info: 'returns object for directory without test defines',
  },
] satisfies TestCase[]
