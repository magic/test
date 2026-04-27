import is from '@magic/types'
import { cleanTempFiles, cleanupDone } from '../../../../src/lib/svelte/compile/cleanTempFiles.js'

export default [
  {
    fn: async () => cleanTempFiles,
    expect: is.function,
    info: 'cleanTempFiles is a function',
  },
  {
    fn: async () => cleanupDone,
    expect: is.boolean,
    info: 'cleanupDone is a boolean export',
  },
]
