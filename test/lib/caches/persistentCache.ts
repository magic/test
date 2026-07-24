import is from '@magic/types'
import fs from '@magic/fs'

export default [
  {
    fn: async () => {
      const pkgExists = await fs.exists('package.json')
      return pkgExists === true
    },
    expect: true,
    info: 'fs.exists works for existing file',
  },
  {
    fn: async () => {
      const missingExists = await fs.exists('/nonexistent/path/xyz')
      return missingExists === false
    },
    expect: true,
    info: 'fs.exists returns false for missing file',
  },
  {
    fn: async () => {
      const result = await fs.stat('package.json')
      return is.objectNative(result) && 'mtimeMs' in result
    },
    expect: true,
    info: 'fs.stat returns an object with mtimeMs',
  },
  {
    fn: async () => {
      const content = await fs.readFile('package.json', 'utf-8')
      const parsed = JSON.parse(content)
      return parsed.name === '@magic/test'
    },
    expect: true,
    info: 'fs.readFile reads file content correctly',
  },
  {
    fn: async () => {
      const entries = await fs.readdir('src/lib/caches')
      return is.array(entries) && entries.length > 0
    },
    expect: true,
    info: 'fs.readdir returns array of entries',
  },
  {
    fn: async () => {
      const absPath = new URL(import.meta.url).pathname
      const exists = await fs.exists(absPath)
      return exists === true
    },
    expect: true,
    info: 'fs.exists works with absolute paths',
  },
]
