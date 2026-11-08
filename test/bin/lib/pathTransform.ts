import {
  toImportPath,
  normalizeImportPath,
  usesWindowsSeparators,
  ensureForwardSlashes,
} from '#src/bin/lib/pathTransform.js'

export default [
  {
    fn: () => {
      return toImportPath('foo/bar/baz')
    },
    expect: 'foo/bar/baz',
    info: 'toImportPath passes through forward slashes unchanged',
  },
  {
    fn: () => {
      const result = toImportPath('foo\\bar\\baz')
      return result
    },
    expect: 'foo/bar/baz',
    info: 'toImportPath converts Windows backslashes to forward slashes',
  },
  {
    fn: () => {
      const result = toImportPath('/absolute/path/to/file')
      return result
    },
    expect: '/absolute/path/to/file',
    info: 'toImportPath handles absolute POSIX paths unchanged',
  },
  {
    fn: () => {
      const result = toImportPath('C:\\Users\\test\\file.js')
      return result
    },
    expect: 'C:/Users/test/file.js',
    info: 'toImportPath converts Windows absolute paths',
  },
  {
    fn: () => {
      const result = toImportPath('')
      return result
    },
    expect: '',
    info: 'toImportPath handles empty string',
  },
  {
    fn: () => {
      return normalizeImportPath('a\\b\\c')
    },
    expect: 'a/b/c',
    info: 'normalizeImportPath is alias for toImportPath',
  },
  {
    fn: () => {
      return normalizeImportPath('a/b/c')
    },
    expect: 'a/b/c',
    info: 'normalizeImportPath passes POSIX paths through',
  },
  {
    fn: () => {
      return usesWindowsSeparators('foo\\bar')
    },
    expect: true,
    info: 'usesWindowsSeparators detects backslashes',
  },
  {
    fn: () => {
      return usesWindowsSeparators('foo/bar')
    },
    expect: false,
    info: 'usesWindowsSeparators returns false for forward slashes',
  },
  {
    fn: () => {
      return usesWindowsSeparators('posix/path')
    },
    expect: false,
    info: 'usesWindowsSeparators returns false for POSIX paths',
  },
  {
    fn: () => {
      return usesWindowsSeparators('')
    },
    expect: false,
    info: 'usesWindowsSeparators returns false for empty string',
  },
  {
    fn: () => {
      const result = ensureForwardSlashes('mixed\\path/with\\both')
      return result
    },
    expect: 'mixed/path/with/both',
    info: 'ensureForwardSlashes normalizes mixed separators',
  },
  {
    fn: () => {
      const result = ensureForwardSlashes('already/posix')
      return result
    },
    expect: 'already/posix',
    info: 'ensureForwardSlashes passes POSIX paths through',
  },
]
