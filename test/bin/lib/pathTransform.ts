import {
  toImportPath,
  normalizeImportPath,
  usesWindowsSeparators,
  ensureForwardSlashes,
} from '../../../src/bin/lib/pathTransform.js'

export default [
  {
    fn: () => {
      return toImportPath('foo/bar/baz') === 'foo/bar/baz'
    },
    expect: true,
    info: 'toImportPath passes through forward slashes unchanged',
  },
  {
    fn: () => {
      const result = toImportPath('foo\\bar\\baz')
      return result === 'foo/bar/baz'
    },
    expect: true,
    info: 'toImportPath converts Windows backslashes to forward slashes',
  },
  {
    fn: () => {
      const result = toImportPath('/absolute/path/to/file')
      return result === '/absolute/path/to/file'
    },
    expect: true,
    info: 'toImportPath handles absolute POSIX paths unchanged',
  },
  {
    fn: () => {
      const result = toImportPath('C:\\Users\\test\\file.js')
      return result === 'C:/Users/test/file.js'
    },
    expect: true,
    info: 'toImportPath converts Windows absolute paths',
  },
  {
    fn: () => {
      const result = toImportPath('')
      return result === ''
    },
    expect: true,
    info: 'toImportPath handles empty string',
  },
  {
    fn: () => {
      return normalizeImportPath('a\\b\\c') === 'a/b/c'
    },
    expect: true,
    info: 'normalizeImportPath is alias for toImportPath',
  },
  {
    fn: () => {
      return normalizeImportPath('a/b/c') === 'a/b/c'
    },
    expect: true,
    info: 'normalizeImportPath passes POSIX paths through',
  },
  {
    fn: () => {
      return usesWindowsSeparators('foo\\bar') === true
    },
    expect: true,
    info: 'usesWindowsSeparators detects backslashes',
  },
  {
    fn: () => {
      return usesWindowsSeparators('foo/bar') === false
    },
    expect: true,
    info: 'usesWindowsSeparators returns false for forward slashes',
  },
  {
    fn: () => {
      return usesWindowsSeparators('posix/path') === false
    },
    expect: true,
    info: 'usesWindowsSeparators returns false for POSIX paths',
  },
  {
    fn: () => {
      return usesWindowsSeparators('') === false
    },
    expect: true,
    info: 'usesWindowsSeparators returns false for empty string',
  },
  {
    fn: () => {
      const result = ensureForwardSlashes('mixed\\path/with\\both')
      return result === 'mixed/path/with/both'
    },
    expect: true,
    info: 'ensureForwardSlashes normalizes mixed separators',
  },
  {
    fn: () => {
      const result = ensureForwardSlashes('already/posix')
      return result === 'already/posix'
    },
    expect: true,
    info: 'ensureForwardSlashes passes POSIX paths through',
  },
]
