import { is } from '../../../../src/index.js'

export default [
  {
    fn: () => {
      const code = `import { Foo } from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result.includes('Foo')
    },
    expect: true,
    info: 'extracts simple named import',
  },
  {
    fn: () => {
      const code = `import { Foo, Bar } from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result.includes('Foo') && result.includes('Bar')
    },
    expect: true,
    info: 'extracts multiple named imports',
  },
  {
    fn: () => {
      const code = `import { Foo as F } from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result.includes('F') && !result.includes('Foo')
    },
    expect: true,
    info: 'extracts aliased import (Foo as F → F)',
  },
  {
    fn: () => {
      const code = `import { Foo, Bar as B } from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result.includes('Foo') && result.includes('B') && !result.includes('Bar')
    },
    expect: true,
    info: 'extracts mixed aliased and non-aliased imports',
  },
  {
    fn: () => {
      const code = `import Default from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result.length === 0
    },
    expect: true,
    info: 'ignores default imports (no braces)',
  },
  {
    fn: () => {
      const code = `import * as all from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result.length === 0
    },
    expect: true,
    info: 'ignores namespace imports',
  },
  {
    fn: () => {
      const code = `import { Foo } from 'other-pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result.length === 0
    },
    expect: true,
    info: 'only matches specified package',
  },
  {
    fn: () => {
      return isSkipPattern('./foo')
    },
    expect: true,
    info: 'isSkipPattern returns true for ./ prefix',
  },
  {
    fn: () => {
      return isSkipPattern('../foo')
    },
    expect: true,
    info: 'isSkipPattern returns true for ../ prefix',
  },
  {
    fn: () => {
      return isSkipPattern('$lib/foo')
    },
    expect: true,
    info: 'isSkipPattern returns true for $ prefix',
  },
  {
    fn: () => {
      return isSkipPattern('/absolute')
    },
    expect: true,
    info: 'isSkipPattern returns true for / prefix',
  },
  {
    fn: () => {
      return !isSkipPattern('pkg')
    },
    expect: true,
    info: 'isSkipPattern returns false for bare package',
  },
  {
    fn: () => {
      return !isSkipPattern('@scoped/pkg')
    },
    expect: true,
    info: 'isSkipPattern returns false for scoped package',
  },
]

const extractNamedImportsFromCode = (code: string, spec: string): string[] => {
  const namedImports: string[] = []
  const importRe = new RegExp(
    `import\\s+\\{([^}]+)\\}\\s+from\\s+['"\`]${spec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`,
    'g',
  )
  for (const match of code.matchAll(importRe)) {
    if (match[1]) {
      const names = match[1].split(',').map(n => {
        const trimmed = n.trim()
        const asParts = trimmed.split(' as ')
        return asParts.length > 1 && asParts[1] ? asParts[1] : trimmed
      })
      namedImports.push(...names.filter(Boolean))
    }
  }
  return namedImports
}

const isSkipPattern = (spec: string): boolean => {
  return (
    spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('$') || spec.startsWith('/')
  )
}
