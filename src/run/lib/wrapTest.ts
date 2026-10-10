/* ---------------------------------------------------------------------------
 * Wrap a test with suite metadata
 * -------------------------------------------------------------------------- */

import type { Test, WrappedTest } from '../../types.ts'

export const wrapTest = (t: Test, name: string, parent: string, pkg: string): WrappedTest => ({
  ...t,
  name,
  parent,
  pkg,
})
