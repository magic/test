import { parseFile, extractExports, extractImports } from '#lib/svelte/compile/astParse.js'
import { has } from '#lib/has.js'
import is from '@magic/types'

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

export default [
  {
    fn: () => {
      const code = `import { Foo } from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result
    },
    expect: has.includes('Foo'),
    info: 'extracts simple named import',
  },
  {
    fn: () => {
      const code = `import { Foo, Bar } from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result
    },
    expect: has.includes('Foo', 'Bar'),
    info: 'extracts multiple named imports',
  },
  {
    fn: () => {
      const code = `import { Foo as F } from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result
    },
    expect: [has.includes('F'), has.not.includes('Foo')],
    info: 'extracts aliased import (Foo as F → F)',
  },
  {
    fn: () => {
      const code = `import { Foo, Bar as B } from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result
    },
    expect: [has.includes('Foo', 'B'), has.not.includes('Bar')],
    info: 'extracts mixed aliased and non-aliased imports',
  },
  {
    fn: () => {
      const code = `import Default from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result
    },
    expect: [],
    info: 'ignores default imports (no braces)',
  },
  {
    fn: () => {
      const code = `import * as all from 'pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result
    },
    expect: [],
    info: 'ignores namespace imports',
  },
  {
    fn: () => {
      const code = `import { Foo } from 'other-pkg'`
      const spec = 'pkg'
      const result = extractNamedImportsFromCode(code, spec)
      return result
    },
    expect: [],
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
      return isSkipPattern('pkg')
    },
    expect: false,
    info: 'isSkipPattern returns false for bare package',
  },
  {
    fn: () => {
      return isSkipPattern('@scoped/pkg')
    },
    expect: false,
    info: 'isSkipPattern returns false for scoped package',
  },
  {
    fn: async () => {
      const code = `export { foo as bar, baz as qux } from './x'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [
      is.len.eq(2),
      has.at(0, has.properties({ name: 'foo', alias: 'bar' })),
      has.at(1, has.properties({ name: 'baz', alias: 'qux' })),
    ],
    info: 'extracts export { foo as bar, baz as qux }',
  },
  {
    fn: async () => {
      const code = `export type { Foo } from './x'`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: 'Foo', isType: true }))],
    info: 'extracts export type { Foo }',
  },
  {
    fn: async () => {
      const code = `export * as NS from './x'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: '*', source: './x' }))],
    info: 'extracts export * as NS from "./x"',
  },
  {
    fn: async () => {
      const code = `export { default as exports } from './x.svelte'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [
      is.len.eq(1),
      has.at(0, has.properties({ name: 'default', alias: 'exports', source: './x.svelte' })),
    ],
    info: 'extracts export default from "./x.svelte"',
  },
  {
    fn: async () => {
      const code = `export function foo<T>() {}`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: 'foo' }))],
    info: 'extracts export function with generics',
  },
  {
    fn: async () => {
      const code = `export enum Foo {}`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: 'Foo' }))],
    info: 'extracts export enum',
  },
  {
    fn: async () => {
      const code = `export interface Foo {}`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: 'Foo' }))],
    info: 'extracts export interface',
  },
  {
    fn: async () => {
      const code = `export type Foo = string`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: 'Foo' }))],
    info: 'extracts export type alias',
  },
  {
    fn: async () => {
      const code = `<script>
export const foo = 1;
export { bar } from './bar.svelte';
</script>`
      const fi = await parseFile(code, 'test.svelte')
      const exports = extractExports(fi)
      return exports
    },
    expect: [
      is.len.eq(2),
      has.at(0, has.properties({ name: 'foo', source: null })),
      has.at(1, has.properties({ name: 'bar', source: './bar.svelte' })),
    ],
    info: 'extracts exports from svelte file',
  },
  {
    fn: async () => {
      const code = `import { foo, bar as baz } from './x'`
      const fi = await parseFile(code, 'test.js')
      const imports = extractImports(fi)
      return imports
    },
    expect: [
      is.len.eq(1),
      has.at(
        0,
        has.properties({
          type: 'static',
          source: './x',
          specifiers: has.includes('foo', 'bar as baz'),
        }),
      ),
    ],
    info: 'extracts static imports',
  },
  {
    fn: async () => {
      const code = `import * as NS from './x'`
      const fi = await parseFile(code, 'test.js')
      const imports = extractImports(fi)
      return imports
    },
    expect: [
      is.len.eq(1),
      has.at(
        0,
        has.properties({
          type: 'namespace',
          source: './x',
          specifiers: has.includes('* as NS'),
        }),
      ),
    ],
    info: 'extracts namespace imports',
  },
  {
    fn: async () => {
      const code = `import './x'`
      const fi = await parseFile(code, 'test.js')
      const imports = extractImports(fi)
      return imports
    },
    expect: [
      is.len.eq(1),
      has.at(0, has.properties({ type: 'sideEffect', source: './x', specifiers: [] })),
    ],
    info: 'extracts side-effect imports',
  },
  {
    fn: async () => {
      const code = `const x = await import('./x')`
      const fi = await parseFile(code, 'test.js')
      const imports = extractImports(fi)
      return imports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ type: 'dynamic', source: './x' }))],
    info: 'extracts dynamic imports',
  },
  {
    fn: async () => {
      const code = `export default function foo() {}`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: 'default', isDefault: true }))],
    info: 'extracts export default function',
  },
  {
    fn: async () => {
      const code = `export default class Foo {}`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: 'default', isDefault: true }))],
    info: 'extracts export default class',
  },
  {
    fn: async () => {
      const code = `export const a = 1, b = 2`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [
      is.len.eq(2),
      has.at(0, has.properties({ name: 'a' })),
      has.at(1, has.properties({ name: 'b' })),
    ],
    info: 'extracts multiple const declarations',
  },
  {
    fn: async () => {
      const code = `export { foo, bar }`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [
      is.len.eq(2),
      has.at(0, has.properties({ name: 'foo' })),
      has.at(1, has.properties({ name: 'bar' })),
    ],
    info: 'extracts named exports without source',
  },
  {
    fn: async () => {
      const code = `export { foo as bar } from './x'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: 'foo', alias: 'bar' }))],
    info: 'extracts export with alias',
  },
  {
    fn: async () => {
      const code = `export * from './x'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: '*', isBatch: true }))],
    info: 'extracts export all',
  },
  {
    fn: async () => {
      const code = `export = foo`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports
    },
    expect: [is.len.eq(1), has.at(0, has.properties({ name: 'default', isDefault: true }))],
    info: 'extracts TSExportAssignment (export =)',
  },
  {
    fn: async () => {
      const code = `export const { a, b } = obj`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [
      is.len.eq(2),
      has.at(0, has.properties({ name: 'a' })),
      has.at(1, has.properties({ name: 'b' })),
    ],
    info: 'extracts destructuring object export',
  },
  {
    fn: async () => {
      const code = `export const [x, y] = arr`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports
    },
    expect: [
      is.len.eq(2),
      has.at(0, has.properties({ name: 'x' })),
      has.at(1, has.properties({ name: 'y' })),
    ],
    info: 'extracts destructuring array export',
  },
]
