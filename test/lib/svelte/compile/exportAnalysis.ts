import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import {
  extractNamedExportsRecursive,
  extractNamedImportsFromCode,
  findExportSourceFile,
  findSvelteFileForExport,
  isSvelteBarrel,
  traverseExports,
} from '#lib/svelte/compile/exportAnalysis.js'
import is from '@magic/types'
import type { TestCase } from '#src/types.js'

const SUV = '<script></script>\n'

const makeGraph = async (files: Record<string, string>) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'magic-exports-'))
  for (const [name, content] of Object.entries(files)) {
    const full = path.join(dir, name)
    await writeFile(full, content)
  }
  return dir
}

const withGraph = async (files: Record<string, string>, fn: (dir: string) => Promise<unknown>) => {
  const dir = await makeGraph(files)
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

export default [
  // --- traverseExports ---
  {
    fn: () =>
      withGraph(
        {
          'barrel.js': `export { default as Alpha } from './Alpha.svelte'
export { default as Beta } from './Beta.svelte'`,
          'Alpha.svelte': SUV,
          'Beta.svelte': SUV,
        },
        async dir => {
          const seen: string[] = []
          await traverseExports(path.join(dir, 'barrel.js'), {
            onSvelteExport: name => {
              seen.push(name)
              return true
            },
            onSvelteDefault: () => true,
            onJsExport: () => true,
          })
          return seen
        },
      ),
    expect: ['Alpha', 'Beta'],
    info: 'traverseExports visits every svelte re-export in a barrel',
  },
  {
    fn: () =>
      withGraph(
        {
          'barrel.js': `export { default as One } from './One.svelte'
export { default as Two } from './Two.svelte'`,
          'One.svelte': SUV,
          'Two.svelte': SUV,
        },
        async dir => {
          const seen: string[] = []
          await traverseExports(path.join(dir, 'barrel.js'), {
            onSvelteExport: name => {
              seen.push(name)
              return false
            },
            onSvelteDefault: () => true,
            onJsExport: () => true,
          })
          return seen
        },
      ),
    expect: ['One'],
    info: 'traverseExports stops when a visitor returns false',
  },
  {
    fn: () =>
      withGraph(
        {
          'top.js': `export * from './sub.js'`,
          'sub.js': `export { default as Gamma } from './Gamma.svelte'`,
          'Gamma.svelte': SUV,
        },
        async dir => {
          const seen: string[] = []
          await traverseExports(path.join(dir, 'top.js'), {
            onSvelteExport: name => {
              seen.push(name)
              return true
            },
            onSvelteDefault: () => true,
            onJsExport: () => true,
          })
          return seen
        },
      ),
    expect: ['Gamma'],
    info: 'traverseExports recurses through export * sub-barrels',
  },
  {
    fn: () =>
      withGraph(
        {
          'a.js': `export * from './b.js'`,
          'b.js': `export * from './a.js'
export { default as Delta } from './Delta.svelte'`,
          'Delta.svelte': SUV,
        },
        async dir => {
          const seen: string[] = []
          await traverseExports(path.join(dir, 'a.js'), {
            onSvelteExport: name => {
              seen.push(name)
              return true
            },
            onSvelteDefault: () => true,
            onJsExport: () => true,
          })
          return seen
        },
      ),
    expect: ['Delta'],
    info: 'traverseExports tolerates cyclic re-export chains',
  },
  {
    fn: () =>
      withGraph(
        {
          'batch.js': `export * from './Eps.svelte'`,
          'Eps.svelte': SUV,
        },
        async dir => {
          const seen: Array<[string, string]> = []
          await traverseExports(path.join(dir, 'batch.js'), {
            onSvelteExport: () => true,
            onSvelteDefault: (name, resolved) => {
              seen.push([name, resolved])
              return true
            },
            onJsExport: () => true,
          })
          return seen
        },
      ),
    expect: (v: Array<[string, string]>) =>
      v.length === 1 && v[0]![0] === 'Eps' && v[0]![1].endsWith(path.join('Eps.svelte')),
    info: 'traverseExports reports export * from .svelte as a default export',
  },

  // --- extractNamedExportsRecursive ---
  {
    fn: () =>
      withGraph(
        {
          'mixed.js': `export function utilFn() {}
export { thing } from './util.js'
export { default as Alpha } from './Alpha.svelte'`,
          'util.js': `export const thing = 1`,
          'Alpha.svelte': SUV,
        },
        async dir => {
          const exports = await extractNamedExportsRecursive(path.join(dir, 'mixed.js'))
          // a re-exported name appears both at the barrel and in the recursed
          // source, so dedupe before asserting
          return [...new Set(exports.map(e => e.name))].sort()
        },
      ),
    expect: ['Alpha', 'thing', 'utilFn'],
    info: 'extractNamedExportsRecursive collects svelte and js exports recursively',
  },

  // --- findSvelteFileForExport ---
  {
    fn: () =>
      withGraph(
        {
          'barrel.js': `export { default as Alpha } from './Alpha.svelte'
export { default as Beta } from './Beta.svelte'`,
          'Alpha.svelte': SUV,
          'Beta.svelte': SUV,
        },
        async dir =>
          (await findSvelteFileForExport(path.join(dir, 'barrel.js'), 'Alpha')) ===
          path.join(dir, 'Alpha.svelte'),
      ),
    expect: true,
    info: 'findSvelteFileForExport resolves a named svelte export',
  },
  {
    fn: () =>
      withGraph(
        {
          'top.js': `export * from './sub.js'`,
          'sub.js': `export { default as Gamma } from './Gamma.svelte'`,
          'Gamma.svelte': SUV,
        },
        async dir => findSvelteFileForExport(path.join(dir, 'top.js'), 'Gamma'),
      ),
    expect: (v: string | null) => v?.endsWith(path.join('Gamma.svelte')) ?? false,
    info: 'findSvelteFileForExport resolves through sub-barrels',
  },
  {
    fn: () =>
      withGraph({ 'empty.js': `// nothing` }, async dir =>
        findSvelteFileForExport(path.join(dir, 'empty.js'), 'Nope'),
      ),
    expect: null,
    info: 'findSvelteFileForExport returns null when the export does not exist',
  },

  // --- findExportSourceFile ---
  {
    fn: () =>
      withGraph(
        {
          'barrel.js': `export { default as Alpha } from './Alpha.svelte'`,
          'Alpha.svelte': SUV,
        },
        async dir => findExportSourceFile(path.join(dir, 'barrel.js'), 'Alpha'),
      ),
    expect: (v: { svelte: string | null; js: string | null; jsExportName: string | null }) =>
      v.svelte?.endsWith(path.join('Alpha.svelte')) && v.js === null && v.jsExportName === null,
    info: 'findExportSourceFile resolves a svelte component export',
  },
  {
    fn: () =>
      withGraph(
        {
          'reexport.js': `export { thing } from './util.js'`,
          'util.js': `export const thing = 1`,
        },
        async dir => findExportSourceFile(path.join(dir, 'reexport.js'), 'thing'),
      ),
    expect: (v: { svelte: string | null; js: string | null; jsExportName: string | null }) =>
      v.svelte === null && v.js?.endsWith(path.join('util.js')) && v.jsExportName === 'thing',
    info: 'findExportSourceFile resolves a re-exported js name to its source file',
  },
  {
    fn: () =>
      withGraph(
        {
          'cn.js': `export const cn = () => ''`,
          'barrel.js': `export { cn as classnames } from './cn.js'`,
        },
        async dir => findExportSourceFile(path.join(dir, 'barrel.js'), 'classnames'),
      ),
    expect: (v: { js: string | null; jsExportName: string | null }) =>
      v.js?.endsWith(path.join('cn.js')) && v.jsExportName === 'cn',
    info: 'findExportSourceFile maps aliased barrel names back to the source export name',
  },
  {
    fn: () =>
      withGraph(
        {
          'util.js': `export function thing() {}`,
        },
        async dir => findExportSourceFile(path.join(dir, 'util.js'), 'thing'),
      ),
    expect: (v: { js: string | null; jsExportName: string | null }) =>
      v.js !== null && v.jsExportName === 'thing',
    info: 'findExportSourceFile resolves locally defined exports to the file that declares them',
  },
  {
    fn: () =>
      withGraph(
        {
          'top.js': `export * from './sub.js'`,
          'sub.js': `export { default as Gamma } from './Gamma.svelte'`,
          'Gamma.svelte': SUV,
        },
        async dir => findExportSourceFile(path.join(dir, 'top.js'), 'Gamma'),
      ),
    expect: (v: { svelte: string | null }) =>
      v.svelte?.endsWith(path.join('Gamma.svelte')) ?? false,
    info: 'findExportSourceFile recurses into export * sub-barrels',
  },
  {
    fn: () =>
      withGraph(
        {
          'a.js': `export * from './b.js'`,
          'b.js': `export * from './a.js'
export { default as Delta } from './Delta.svelte'`,
          'Delta.svelte': SUV,
        },
        async dir => findExportSourceFile(path.join(dir, 'a.js'), 'Delta'),
      ),
    expect: (v: { svelte: string | null }) =>
      v.svelte?.endsWith(path.join('Delta.svelte')) ?? false,
    info: 'findExportSourceFile survives cycles while searching sub-barrels',
  },
  {
    fn: () =>
      withGraph(
        {
          'batch.js': `export * from './Eps.svelte'`,
          'Eps.svelte': SUV,
        },
        async dir => findExportSourceFile(path.join(dir, 'batch.js'), 'Eps'),
      ),
    expect: (v: { svelte: string | null }) => v.svelte?.endsWith(path.join('Eps.svelte')) ?? false,
    info: 'findExportSourceFile resolves export * from .svelte by file basename',
  },
  {
    fn: () =>
      withGraph({ 'empty.js': `// nothing` }, async dir =>
        findExportSourceFile(path.join(dir, 'empty.js'), 'Missing'),
      ),
    expect: { svelte: null, js: null, jsExportName: null },
    info: 'findExportSourceFile returns all-null when nothing matches',
  },
  {
    fn: () => findExportSourceFile('/nonexistent/magic-exports-entry.js', 'x'),
    expect: { svelte: null, js: null, jsExportName: null },
    info: 'findExportSourceFile returns all-null when the entry file is missing',
  },

  // --- isSvelteBarrel ---
  {
    fn: () =>
      withGraph(
        {
          'barrel.js': `export { default as Alpha } from './Alpha.svelte'`,
          'Alpha.svelte': SUV,
        },
        async dir => isSvelteBarrel(path.join(dir, 'barrel.js')),
      ),
    expect: true,
    info: 'isSvelteBarrel is true for a barrel re-exporting svelte files',
  },
  {
    fn: () =>
      withGraph(
        {
          'plain.js': `export const a = 1`,
        },
        async dir => isSvelteBarrel(path.join(dir, 'plain.js')),
      ),
    expect: false,
    info: 'isSvelteBarrel is false for a plain js module',
  },
  {
    fn: () =>
      withGraph(
        {
          'top.js': `export * from './sub.js'`,
          'sub.js': `export { default as Gamma } from './Gamma.svelte'`,
          'Gamma.svelte': SUV,
        },
        async dir => isSvelteBarrel(path.join(dir, 'top.js')),
      ),
    expect: true,
    info: 'isSvelteBarrel is true when a sub-barrel re-exports svelte files',
  },
  {
    fn: () =>
      withGraph(
        {
          'a.js': `export * from './b.js'`,
          'b.js': `export * from './a.js'
export { default as Delta } from './Delta.svelte'`,
          'Delta.svelte': SUV,
        },
        async dir => isSvelteBarrel(path.join(dir, 'a.js')),
      ),
    expect: true,
    info: 'isSvelteBarrel terminates on cycles and still finds svelte exports',
  },

  // --- extractNamedImportsFromCode ---
  {
    fn: () => extractNamedImportsFromCode(`import { Foo } from 'pkg'`, 'pkg'),
    expect: ['Foo'],
    info: 'extractNamedImportsFromCode extracts simple named imports',
  },
  {
    fn: () => extractNamedImportsFromCode(`import { Foo as F } from 'pkg'`, 'pkg'),
    expect: ['Foo'],
    info: 'extractNamedImportsFromCode returns the imported name, not the alias',
  },
  {
    fn: () => extractNamedImportsFromCode(`import Def from 'pkg'`, 'pkg'),
    expect: ['default'],
    info: 'extractNamedImportsFromCode reports default imports as default',
  },
  {
    fn: () => extractNamedImportsFromCode(`import * as ns from 'pkg'`, 'pkg'),
    expect: ['*'],
    info: 'extractNamedImportsFromCode reports namespace imports as *',
  },
  {
    fn: () => extractNamedImportsFromCode(`import Def, { a, b as c } from 'pkg'`, 'pkg'),
    expect: ['default', 'a', 'b'],
    info: 'extractNamedImportsFromCode handles mixed specifiers',
  },
  {
    fn: () => extractNamedImportsFromCode(`import { X } from 'other'`, 'pkg'),
    expect: [],
    info: 'extractNamedImportsFromCode ignores other specifiers',
  },
  {
    fn: () => extractNamedImportsFromCode(`export const x = 1`, 'pkg'),
    expect: [],
    info: 'extractNamedImportsFromCode returns [] when no import matches',
  },
  {
    fn: () => extractNamedImportsFromCode(`import { X } from 'pkg' oops not js`, 'pkg'),
    expect: is.arr,
    info: 'extractNamedImportsFromCode tolerates unparseable code',
  },
] satisfies TestCase[]
