import { cleanTempFiles, cleanupDone } from '../../../../src/lib/svelte/compile/cleanTempFiles.js'

export default [
  {
    fn: async () => {
      return typeof cleanTempFiles === 'function'
    },
    expect: true,
    info: 'cleanTempFiles is a function',
  },
  {
    fn: async () => {
      return typeof cleanupDone === 'boolean'
    },
    expect: true,
    info: 'cleanupDone is a boolean export',
  },
]
