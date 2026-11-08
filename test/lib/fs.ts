import { tryStat } from '#lib/fs.js'
import type { TestCase } from '#src/types.js'

export default [
  {
    fn: async () => {
      const result = await tryStat('./package.json')
      return result
    },
    expect: (v: unknown) => v !== null,
    info: 'tryStat returns stat for existing file',
  },
  {
    fn: async () => {
      const result = await tryStat('./nonexistent-file-xyz.json')
      return result
    },
    expect: null,
    info: 'tryStat returns null for nonexistent file',
  },
  {
    fn: async () => {
      const result = await tryStat('./test')
      return result
    },
    expect: (v: unknown) => v !== null,
    info: 'tryStat returns stat for existing directory',
  },
] satisfies TestCase[]
