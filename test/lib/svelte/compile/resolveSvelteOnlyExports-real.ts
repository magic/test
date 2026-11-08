import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import {
  resolveSvelteOnlyExports,
  compileSvelteOnlyExport,
  buildOnDemandSvelteBarrel,
} from '#lib/svelte/compile/resolveSvelteOnlyExports.js'
import type { TestCase } from '#src/types.js'

const SUV = '<script>\nexport let name = "hi"\n</script>\n<div>{name}</div>\n'

const pkgOf = () => 'magic-fake-svelte-' + Math.random().toString(36).slice(2, 10)

// files are relative to the tmp project root; the package name is injected via <PKG>
const RICH_FILES = (pkg: string): Record<string, string> => ({
  [`node_modules/${pkg}/package.json`]: JSON.stringify({
    name: pkg,
    version: '1.0.0',
    main: 'index.js',
    exports: { '.': { svelte: './index.js', default: './index.js' } },
  }),
  [`node_modules/${pkg}/index.js`]: `export * from './src/Alpha.svelte'
export { default as Beta } from './src/Beta.svelte'
export * as Ns from './src/Ns.svelte'
export * from './src/sub.js'
export { utilFn } from './src/dep.js'
export { runesThing } from './src/runes.js'
import { helper } from './src/helper.js'
export const localConst = helper
`,
  [`node_modules/${pkg}/src/Alpha.svelte`]: SUV,
  [`node_modules/${pkg}/src/Beta.svelte`]: SUV,
  [`node_modules/${pkg}/src/Ns.svelte`]: SUV,
  [`node_modules/${pkg}/src/Sub.svelte`]: SUV,
  [`node_modules/${pkg}/src/sub.js`]: `export { default as Sub } from './Sub.svelte'`,
  [`node_modules/${pkg}/src/dep.js`]: `export const utilFn = () => 42`,
  [`node_modules/${pkg}/src/runes.js`]: `export const count = $state(0)\nexport const double = $derived(count * 2)\n`,
  [`node_modules/${pkg}/src/helper.js`]: `export const helper = 'h'`,
})

const withFixture = async (
  filesForPkg: (pkg: string) => Record<string, string>,
  fn: (dir: string, pkg: string) => Promise<unknown>,
) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'magic-svlexp-'))
  const pkg = pkgOf()
  for (const [rel, content] of Object.entries(filesForPkg(pkg))) {
    const full = path.join(dir, rel)
    await mkdir(path.dirname(full), { recursive: true })
    await writeFile(full, content)
  }
  try {
    return await fn(dir, pkg)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

const urlFrom = (code: string): string => {
  const m = code.match(/from '([^']+)'|import\('([^']+)'\)/)
  return (m?.[1] ?? m?.[2] ?? '').replace(/^file:\/\//, '')
}

export default [
  {
    fn: () =>
      withFixture(RICH_FILES, async (dir, pkg) => {
        const code = `import { Alpha } from '${pkg}'`
        const result = await resolveSvelteOnlyExports(code, dir)
        const target = urlFrom(result)
        const exists = target ? !!(await readFile(target, 'utf-8').catch(() => null)) : false
        return {
          pkgGone: !result.includes(`'${pkg}'`),
          rewrittenToFileUrl: result.includes(`import { Alpha } from 'file://`),
          barrelWritten: exists,
        }
      }),
    expect: (v: { pkgGone: boolean; rewrittenToFileUrl: boolean; barrelWritten: boolean }) =>
      v.pkgGone && v.rewrittenToFileUrl && v.barrelWritten,
    info: 'resolveSvelteOnlyExports rewrites a named svelte import to a compiled temp barrel',
  },
  {
    fn: () =>
      withFixture(RICH_FILES, async (dir, pkg) => {
        // namespace imports are intentionally left untouched: the importer may
        // touch any export, so per-name rewriting does not apply
        const code = `import * as P from '${pkg}'`
        const result = await resolveSvelteOnlyExports(code, dir)
        return { untouched: result === code }
      }),
    expect: (v: { untouched: boolean }) => v.untouched,
    info: 'resolveSvelteOnlyExports leaves namespace svelte imports untouched',
  },
  {
    fn: () =>
      withFixture(RICH_FILES, async (dir, pkg) => {
        const code = `export * from '${pkg}'`
        const result = await resolveSvelteOnlyExports(code, dir)
        return {
          pkgGone: !result.includes(`'${pkg}'`),
          starReplaced: /\} from 'file:\/\//.test(result),
        }
      }),
    expect: (v: { pkgGone: boolean; starReplaced: boolean }) => v.pkgGone && v.starReplaced,
    info: 'resolveSvelteOnlyExports replaces export * from a svelte package with explicit names',
  },
  {
    fn: () =>
      withFixture(RICH_FILES, async (dir, pkg) => {
        const code = `const m = await import('${pkg}')`
        const result = await resolveSvelteOnlyExports(code, dir)
        return {
          pkgGone: !result.includes(`'${pkg}'`),
          dynamicRewritten: result.includes(`import('file://`),
        }
      }),
    expect: (v: { pkgGone: boolean; dynamicRewritten: boolean }) => v.pkgGone && v.dynamicRewritten,
    info: 'resolveSvelteOnlyExports rewrites a dynamic import of a svelte package',
  },
  {
    fn: () =>
      withFixture(RICH_FILES, async (dir, pkg) => {
        const code = `import '${pkg}'\n`
        const result = await resolveSvelteOnlyExports(code, dir)
        return { pkgGone: !result.includes(`'${pkg}'`), stripped: result.trim() === '' }
      }),
    expect: (v: { pkgGone: boolean; stripped: boolean }) => v.pkgGone && v.stripped,
    info: 'resolveSvelteOnlyExports strips a side-effect import of a svelte package',
  },
  {
    fn: () =>
      withFixture(RICH_FILES, async (dir, pkg) => {
        // Compile the JS barrel directly: exercises the full
        // handleJsWithSvelteReexports rewrite set.
        const barrel = path.join(dir, 'node_modules', pkg, 'index.js')
        const out = await compileSvelteOnlyExport(barrel, dir)
        const content = await readFile(out, 'utf-8')
        return {
          batchSvelte: /export \{ Alpha \} from 'file:\/\//.test(content),
          defaultAlias: /export \{ default as Beta \} from 'file:\/\//.test(content),
          namespace: /export \* as Ns from 'file:\/\//.test(content),
          jsBatch: /export \* from 'file:\/\//.test(content),
          jsNamed: /export \{ utilFn \} from 'file:\/\//.test(content),
          importRewritten: !/from '\.\/helper\.js'/.test(content),
          // string-built regex: the type stripper mis-tokenizes a bare '/' inside a char class
          noRawSvelteLeft: !new RegExp("from '[^']*\\.svelte'").test(content),
        }
      }),
    expect: (v: {
      batchSvelte: boolean
      defaultAlias: boolean
      namespace: boolean
      jsBatch: boolean
      jsNamed: boolean
      importRewritten: boolean
      noRawSvelteLeft: boolean
    }) =>
      v.batchSvelte &&
      v.defaultAlias &&
      v.namespace &&
      v.jsBatch &&
      v.jsNamed &&
      v.importRewritten &&
      v.noRawSvelteLeft,
    info: 'compileSvelteOnlyExport on a JS barrel rewrites every svelte/js re-export to temp URLs',
  },
  {
    fn: () =>
      withFixture(RICH_FILES, async (dir, pkg) => {
        const component = path.join(dir, 'node_modules', pkg, 'src', 'Alpha.svelte')
        const out = await compileSvelteOnlyExport(component, dir)
        const abs = path.isAbsolute(out) ? out : path.resolve(process.cwd(), out)
        const content = await readFile(abs, 'utf-8')
        return {
          exists: content.length > 0,
          isJs: !content.includes('<script>') && content.includes('svelte/internal'),
        }
      }),
    expect: (v: { exists: boolean; isJs: boolean }) => v.exists && v.isJs,
    info: 'compileSvelteOnlyExport compiles a .svelte file to a temp JS module',
  },
  {
    fn: async () => {
      const dir = await mkdtemp(path.join(os.tmpdir(), 'magic-svlexp-'))
      try {
        const code = `import { page } from '$app/state'`
        const result = await resolveSvelteOnlyExports(code, dir)
        return {
          shimmed: result.includes('shims/$app/state'),
          fileUrl: result.includes("from 'file://"),
        }
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
    },
    expect: (v: { shimmed: boolean; fileUrl: boolean }) => v.shimmed && v.fileUrl,
    info: 'resolveSvelteOnlyExports rewrites $app imports to the shim file URLs',
  },
  {
    fn: async () => {
      const dir = await mkdtemp(path.join(os.tmpdir(), 'magic-svlexp-'))
      try {
        const code = `import { x } from './x.js'\nimport is from '@magic/types'`
        const result = await resolveSvelteOnlyExports(code, dir)
        return result === code
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'resolveSvelteOnlyExports leaves relative and non-svelte package imports untouched',
  },
  {
    fn: () =>
      withFixture(
        (pkg: string) => ({
          [`node_modules/${pkg}/package.json`]: JSON.stringify({
            name: pkg,
            version: '1.0.0',
            main: 'index.js',
            exports: { '.': { svelte: './index.js', default: './index.js' } },
          }),
          [`node_modules/${pkg}/index.js`]: `export { default as Alpha } from './src/Alpha.svelte'
export { utilFn as utilAlias } from './src/dep.js'
`,
          [`node_modules/${pkg}/src/Alpha.svelte`]: SUV,
          [`node_modules/${pkg}/src/dep.js`]: `export const utilFn = () => 1`,
        }),
        async (dir, pkg) => {
          const entry = path.join(dir, 'node_modules', pkg, 'index.js')
          const barrel = await buildOnDemandSvelteBarrel(entry, dir, ['Alpha', 'utilAlias'])
          const content = barrel ? await readFile(barrel, 'utf-8') : ''
          const noneDefault = await buildOnDemandSvelteBarrel(entry, dir, ['default'])
          const noneMissing = await buildOnDemandSvelteBarrel(entry, dir, ['Nope'])
          const noneEmpty = await buildOnDemandSvelteBarrel(entry, dir, [])
          return {
            svelteLine: /export \{ default as Alpha \} from 'file:\/\//.test(content),
            aliasedJsLine: /export \{ utilFn as utilAlias \} from 'file:\/\//.test(content),
            noneDefault,
            noneMissing,
            noneEmpty,
          }
        },
      ),
    expect: (v: {
      svelteLine: boolean
      aliasedJsLine: boolean
      noneDefault: string | null
      noneMissing: string | null
      noneEmpty: string | null
    }) =>
      v.svelteLine &&
      v.aliasedJsLine &&
      v.noneDefault === null &&
      v.noneMissing === null &&
      v.noneEmpty === null,
    info: 'buildOnDemandSvelteBarrel emits per-name re-exports and returns null for unresolvable names',
  },
] satisfies TestCase[]
