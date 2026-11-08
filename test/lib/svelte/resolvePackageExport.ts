import { resolvePackageExport } from '#src/lib/svelte/compile/resolvePackageExport.js'
import { packageExportCache } from '#src/lib/caches/cache.js'
import { getCwd } from '#src/constants.js'
import { has } from '#lib/has.js'
import is from '@magic/types'
import type { TestCase } from '#src/types.js'

const SRC = getCwd()

const tests: TestCase[] = [
  // skip patterns -> null, not svelte-only
  {
    fn: async () => {
      const r = await resolvePackageExport('./relative.js', SRC)
      return r
    },
    expect: has.properties({ resolvedPath: null, isSvelteOnly: false }),
    info: 'relative ./ specifier is skipped',
  },
  {
    fn: async () => {
      const r = await resolvePackageExport('../up.js', SRC)
      return r
    },
    expect: has.properties({ resolvedPath: null, isSvelteOnly: false }),
    info: 'relative ../ specifier is skipped',
  },
  {
    fn: async () => {
      const r = await resolvePackageExport('$lib/foo', SRC)
      return r
    },
    expect: has.properties({ resolvedPath: null, isSvelteOnly: false }),
    info: '$ alias specifier is skipped',
  },
  {
    fn: async () => {
      const r = await resolvePackageExport('/abs/path', SRC)
      return r
    },
    expect: has.properties({ resolvedPath: null, isSvelteOnly: false }),
    info: 'absolute specifier is skipped',
  },

  // result shape
  {
    fn: async () => {
      const r = await resolvePackageExport('svelte', SRC)
      return r
    },
    expect: (v: unknown) =>
      is.object(v) &&
      is.not.null(v) &&
      has.property('resolvedPath', v) &&
      'isSvelteOnly' in v &&
      is.boolean(v.isSvelteOnly),
    info: 'returns object with resolvedPath and boolean isSvelteOnly',
  },
  {
    fn: async () => {
      const r = await resolvePackageExport('svelte', SRC)
      // resolvedPath is either null or a string
      return r.resolvedPath
    },
    expect: (v: unknown) => v === null || is.string(v),
    info: 'resolvedPath is null or a string',
  },

  // caching: repeated calls are consistent
  {
    fn: async () => {
      const r1 = await resolvePackageExport('svelte', SRC)
      const r2 = await resolvePackageExport('svelte', SRC)
      return { r1, r2 }
    },
    expect: (v: {
      r1: { resolvedPath: unknown; isSvelteOnly: boolean }
      r2: { resolvedPath: unknown; isSvelteOnly: boolean }
    }) => v.r1.resolvedPath === v.r2.resolvedPath && v.r1.isSvelteOnly === v.r2.isSvelteOnly,
    info: 'repeated resolution is consistent (cached)',
  },
  // result is cached in packageExportCache
  {
    fn: async () => {
      const spec = 'svelte'
      const cacheKey = `pkg:${spec}:${SRC}`
      await resolvePackageExport(spec, SRC)
      const cached = packageExportCache.get(cacheKey)
      return cached?.resolvedPath
    },
    expect: (v: unknown) => v !== undefined,
    info: 'successful resolution is stored in packageExportCache',
  },
  // subpath resolution
  {
    fn: async () => {
      const r = await resolvePackageExport('svelte/internal', SRC)
      return r?.isSvelteOnly
    },
    expect: is.bool,
    info: 'subpath specifier resolves to valid shape',
  },
  // scoped package shape
  {
    fn: async () => {
      const r = await resolvePackageExport('@magic/types', SRC)
      return r
    },
    expect: has.key('resolvedPath'),
    info: 'scoped package @magic/types returns valid shape',
  },
]

export default tests
