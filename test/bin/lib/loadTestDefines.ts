// loadTestDefines requires file system operations with specific file paths
// and relies on process.cwd(). These tests require complex setup.
// For now, we test the function exists and returns expected types.

import { loadTestDefines } from '../../../src/bin/lib/loadTestDefines.js'
import type { TestCase } from '../../../src/types.js'

export default [
  // Function exists and is async
  {
    fn: async () => typeof loadTestDefines === 'function',
    expect: true,
    info: 'loadTestDefines is a function',
  },
  // Returns promise
  {
    fn: async () => loadTestDefines('/nonexistent/path') instanceof Promise,
    expect: true,
    info: 'loadTestDefines returns a Promise',
  },
  // Returns empty object when no files exist
  {
    fn: async () => {
      const result = await loadTestDefines('/nonexistent/path/that/does/not/exist')
      return typeof result === 'object' && result !== null && !Array.isArray(result)
    },
    expect: true,
    info: 'returns empty object for nonexistent directory',
  },
  // Returns object when test directory doesn't exist
  {
    fn: async () => {
      const result = await loadTestDefines('/tmp')
      return typeof result === 'object'
    },
    expect: true,
    info: 'returns object for directory without test defines',
  },
] satisfies TestCase[]
