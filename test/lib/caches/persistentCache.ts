import is from '@magic/types'
import fs from '@magic/fs'
import { has } from '#lib/has.js'

export default [
  {
    fn: async () => {
      const pkgExists = await fs.exists('package.json')
      return pkgExists
    },
    expect: true,
    info: 'fs.exists works for existing file',
  },
  {
    fn: async () => {
      const missingExists = await fs.exists('/nonexistent/path/xyz')
      return missingExists
    },
    expect: false,
    info: 'fs.exists returns false for missing file',
  },
  {
    fn: async () => {
      const result = await fs.stat('package.json')
      return result
    },
    expect: [is.objectNative, has.key('mtimeMs')],
    info: 'fs.stat returns an object with mtimeMs',
  },
  {
    fn: async () => {
      const content = await fs.readFile('package.json', 'utf-8')
      const parsed = JSON.parse(content)
      return parsed.name
    },
    expect: '@magic/test',
    info: 'fs.readFile reads file content correctly',
  },
  {
    fn: async () => {
      const entries = await fs.readdir('src/lib/caches')
      return entries
    },
    expect: [is.arr, (v: unknown[]) => v.length > 0],
    info: 'fs.readdir returns array of entries',
  },
  {
    fn: async () => {
      const absPath = new URL(import.meta.url).pathname
      const exists = await fs.exists(absPath)
      return exists
    },
    expect: true,
    info: 'fs.exists works with absolute paths',
  },
]
