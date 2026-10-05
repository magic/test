import { resolvePackageExport } from '#src/lib/svelte/compile/resolvePackageExport.js'
import { packageExportCache } from '#src/lib/caches/cache.js'
import { CWD } from '#src/constants.js'
import type { TestCase } from '#src/types.js'

const SRC = CWD

const tests: TestCase[] = [
  // skip patterns -> null, not svelte-only
  {
    fn: async () => {
      const r = await resolvePackageExport('./relative.js', SRC)
      return r.resolvedPath === null && r.isSvelteOnly === false
    },
    expect: true,
    info: 'relative ./ specifier is skipped',
  },
  {
    fn: async () => {
      const r = await resolvePackageExport('../up.js', SRC)
      return r.resolvedPath === null && r.isSvelteOnly === false
    },
    expect: true,
    info: 'relative ../ specifier is skipped',
  },
  {
    fn: async () => {
      const r = await resolvePackageExport('$lib/foo', SRC)
      return r.resolvedPath === null && r.isSvelteOnly === false
    },
    expect: true,
    info: '$ alias specifier is skipped',
  },
  {
    fn: async () => {
      const r = await resolvePackageExport('/abs/path', SRC)
      return r.resolvedPath === null && r.isSvelteOnly === false
    },
    expect: true,
    info: 'absolute specifier is skipped',
  },

  // result shape
  {
    fn: async () => {
      const r = await resolvePackageExport('svelte', SRC)
      return (
        r !== null &&
        typeof r === 'object' &&
        'resolvedPath' in r &&
        typeof r.isSvelteOnly === 'boolean'
      )
    },
    expect: true,
    info: 'returns object with resolvedPath and boolean isSvelteOnly',
  },
  {
    fn: async () => {
      const r = await resolvePackageExport('svelte', SRC)
      // resolvedPath is either null or a string
      return r.resolvedPath === null || typeof r.resolvedPath === 'string'
    },
    expect: true,
    info: 'resolvedPath is null or a string',
  },

  // caching: repeated calls are consistent
  {
    fn: async () => {
      const r1 = await resolvePackageExport('svelte', SRC)
      const r2 = await resolvePackageExport('svelte', SRC)
      return r1.resolvedPath === r2.resolvedPath && r1.isSvelteOnly === r2.isSvelteOnly
    },
    expect: true,
    info: 'repeated resolution is consistent (cached)',
  },
  // result is cached in packageExportCache
  {
    fn: async () => {
      const spec = 'svelte'
      const cacheKey = `pkg:${spec}:${SRC}`
      await resolvePackageExport(spec, SRC)
      const cached = packageExportCache.get(cacheKey)
      return cached !== undefined && cached.resolvedPath !== undefined
    },
    expect: true,
    info: 'successful resolution is stored in packageExportCache',
  },
  // subpath resolution
  {
    fn: async () => {
      const r = await resolvePackageExport('svelte/internal', SRC)
      return r !== null && typeof r.isSvelteOnly === 'boolean'
    },
    expect: true,
    info: 'subpath specifier resolves to valid shape',
  },
  // scoped package shape
  {
    fn: async () => {
      const r = await resolvePackageExport('@magic/types', SRC)
      return r !== null && 'resolvedPath' in r
    },
    expect: true,
    info: 'scoped package @magic/types returns valid shape',
  },
]

export default tests
