import {
  parseFile,
  extractExports,
  extractImports,
} from '../../../../src/lib/svelte/compile/astParse.ts'

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
  {
    fn: async () => {
      const code = `export { foo as bar, baz as qux } from './x'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return (
        exports.length === 2 &&
        exports[0]!.name === 'foo' &&
        exports[0]!.alias === 'bar' &&
        exports[1]!.name === 'baz' &&
        exports[1]!.alias === 'qux'
      )
    },
    expect: true,
    info: 'extracts export { foo as bar, baz as qux }',
  },
  {
    fn: async () => {
      const code = `export type { Foo } from './x'`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === 'Foo' && exports[0]!.isType === true
    },
    expect: true,
    info: 'extracts export type { Foo }',
  },
  {
    fn: async () => {
      const code = `export * as NS from './x'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === '*' && exports[0]!.source === './x'
    },
    expect: true,
    info: 'extracts export * as NS from "./x"',
  },
  {
    fn: async () => {
      const code = `export { default as exports } from './x.svelte'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return (
        exports.length === 1 &&
        exports[0]!.name === 'default' &&
        exports[0]!.alias === 'exports' &&
        exports[0]!.source === './x.svelte'
      )
    },
    expect: true,
    info: 'extracts export default from "./x.svelte"',
  },
  {
    fn: async () => {
      const code = `export function foo<T>() {}`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === 'foo'
    },
    expect: true,
    info: 'extracts export function with generics',
  },
  {
    fn: async () => {
      const code = `export enum Foo {}`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === 'Foo'
    },
    expect: true,
    info: 'extracts export enum',
  },
  {
    fn: async () => {
      const code = `export interface Foo {}`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === 'Foo'
    },
    expect: true,
    info: 'extracts export interface',
  },
  {
    fn: async () => {
      const code = `export type Foo = string`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === 'Foo'
    },
    expect: true,
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
      return (
        exports.length === 2 &&
        exports[0]!.name === 'foo' &&
        exports[0]!.source === null &&
        exports[1]!.name === 'bar' &&
        exports[1]!.source === './bar.svelte'
      )
    },
    expect: true,
    info: 'extracts exports from svelte file',
  },
  {
    fn: async () => {
      const code = `import { foo, bar as baz } from './x'`
      const fi = await parseFile(code, 'test.js')
      const imports = extractImports(fi)
      return (
        imports.length === 1 &&
        imports[0]!.type === 'static' &&
        imports[0]!.source === './x' &&
        imports[0]!.specifiers.includes('foo') &&
        imports[0]!.specifiers.includes('bar as baz')
      )
    },
    expect: true,
    info: 'extracts static imports',
  },
  {
    fn: async () => {
      const code = `import * as NS from './x'`
      const fi = await parseFile(code, 'test.js')
      const imports = extractImports(fi)
      return (
        imports.length === 1 &&
        imports[0]!.type === 'namespace' &&
        imports[0]!.source === './x' &&
        imports[0]!.specifiers.includes('* as NS')
      )
    },
    expect: true,
    info: 'extracts namespace imports',
  },
  {
    fn: async () => {
      const code = `import './x'`
      const fi = await parseFile(code, 'test.js')
      const imports = extractImports(fi)
      return (
        imports.length === 1 &&
        imports[0]!.type === 'sideEffect' &&
        imports[0]!.source === './x' &&
        imports[0]!.specifiers.length === 0
      )
    },
    expect: true,
    info: 'extracts side-effect imports',
  },
  {
    fn: async () => {
      const code = `const x = await import('./x')`
      const fi = await parseFile(code, 'test.js')
      const imports = extractImports(fi)
      return imports.length === 1 && imports[0]!.type === 'dynamic' && imports[0]!.source === './x'
    },
    expect: true,
    info: 'extracts dynamic imports',
  },
  {
    fn: async () => {
      const code = `export default function foo() {}`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === 'default' && exports[0]!.isDefault
    },
    expect: true,
    info: 'extracts export default function',
  },
  {
    fn: async () => {
      const code = `export default class Foo {}`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === 'default' && exports[0]!.isDefault
    },
    expect: true,
    info: 'extracts export default class',
  },
  {
    fn: async () => {
      const code = `export const a = 1, b = 2`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports.length === 2 && exports[0]!.name === 'a' && exports[1]!.name === 'b'
    },
    expect: true,
    info: 'extracts multiple const declarations',
  },
  {
    fn: async () => {
      const code = `export { foo, bar }`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports.length === 2 && exports[0]!.name === 'foo' && exports[1]!.name === 'bar'
    },
    expect: true,
    info: 'extracts named exports without source',
  },
  {
    fn: async () => {
      const code = `export { foo as bar } from './x'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === 'foo' && exports[0]!.alias === 'bar'
    },
    expect: true,
    info: 'extracts export with alias',
  },
  {
    fn: async () => {
      const code = `export * from './x'`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === '*' && exports[0]!.isBatch
    },
    expect: true,
    info: 'extracts export all',
  },
  {
    fn: async () => {
      const code = `export = foo`
      const fi = await parseFile(code, 'test.ts')
      const exports = extractExports(fi)
      return exports.length === 1 && exports[0]!.name === 'default' && exports[0]!.isDefault
    },
    expect: true,
    info: 'extracts TSExportAssignment (export =)',
  },
  {
    fn: async () => {
      const code = `export const { a, b } = obj`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports.length === 2 && exports[0]!.name === 'a' && exports[1]!.name === 'b'
    },
    expect: true,
    info: 'extracts destructuring object export',
  },
  {
    fn: async () => {
      const code = `export const [x, y] = arr`
      const fi = await parseFile(code, 'test.js')
      const exports = extractExports(fi)
      return exports.length === 2 && exports[0]!.name === 'x' && exports[1]!.name === 'y'
    },
    expect: true,
    info: 'extracts destructuring array export',
  },
]
