import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  resolveImportMapSpecifier,
  findNearestPackageJson,
} from '#lib/svelte/compile/resolveImportMap.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..', '..', '..', '..')
const fixturePkgDir = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'src',
  'lib',
  'svelte',
  'testFixtures',
  'importMapPkg',
)
const fixturePkgJson = path.join(fixturePkgDir, 'package.json')
const repoPkgJson = path.join(repoRoot, 'package.json')

export default [
  {
    fn: async () => {
      // "#fix/*" is only defined in the fixture package's own package.json,
      // not in the repo root - resolution must use the importing file's
      // package scope, not the repo root's.
      const resolved = await resolveImportMapSpecifier('#fix/Foo.svelte', fixturePkgJson)
      return resolved === path.join(fixturePkgDir, 'src', 'Foo.svelte')
    },
    expect: true,
    info: 'resolveImportMapSpecifier resolves wildcard import-map entries to absolute paths',
  },
  {
    fn: async () => {
      // ".js" specifier with only a ".ts" file on disk -> .js -> .ts conversion
      // (the "#fix-ts/*" map points at a dir that only contains .ts files)
      const resolved = await resolveImportMapSpecifier('#fix-ts/thing.js', fixturePkgJson)
      return resolved === path.join(fixturePkgDir, 'ts', 'thing.ts')
    },
    expect: true,
    info: 'resolveImportMapSpecifier applies .js -> .ts conversion',
  },
  {
    fn: async () => {
      // Repo maps "#src": "./dist/index.js" (exact, non-wildcard entry)
      const resolved = await resolveImportMapSpecifier('#src', repoPkgJson)
      return resolved === path.join(repoRoot, 'dist', 'index.js')
    },
    expect: true,
    info: 'resolveImportMapSpecifier resolves exact-match entries',
  },
  {
    fn: async () => {
      const resolved = await resolveImportMapSpecifier('#unknown/nope.js', repoPkgJson)
      return resolved === null
    },
    expect: true,
    info: 'resolveImportMapSpecifier returns null for unknown specifiers',
  },
  {
    fn: async () => {
      const resolved = await resolveImportMapSpecifier('./relative.js', repoPkgJson)
      return resolved === null
    },
    expect: true,
    info: 'resolveImportMapSpecifier ignores non-# specifiers',
  },
  {
    fn: async () => {
      // Walks up from the file to the nearest package.json (the fixture
      // package, NOT the repo root which also exists further up the tree).
      const pkgJson = await findNearestPackageJson(path.join(fixturePkgDir, 'src', 'Foo.svelte'))
      return pkgJson === fixturePkgJson
    },
    expect: true,
    info: 'findNearestPackageJson finds the nearest package.json for nested packages',
  },
  {
    fn: async () => {
      // No package.json between the file and the repo root -> repo root.
      const pkgJson = await findNearestPackageJson(
        path.join(
          repoRoot,
          'src',
          'lib',
          'svelte',
          'testFixtures',
          'barrelFixtures',
          'Index.svelte.js',
        ),
      )
      return pkgJson === repoPkgJson
    },
    expect: true,
    info: 'findNearestPackageJson falls back to the repo root package.json',
  },
  {
    fn: async () => {
      // "#lib/*" maps to "./src/lib/*" in repo package.json
      const resolved = await resolveImportMapSpecifier(
        '#lib/svelte/compile/resolveImportMap.ts',
        repoPkgJson,
      )
      return (
        resolved === path.join(repoRoot, 'src', 'lib', 'svelte', 'compile', 'resolveImportMap.ts')
      )
    },
    expect: true,
    info: 'resolveImportMapSpecifier resolves #lib/* to src/lib/*',
  },
  {
    fn: async () => {
      // Non-absolute input -> CWD package.json fallback
      const pkgJson = await findNearestPackageJson('relative/file.ts')
      return pkgJson === path.resolve(process.cwd(), 'package.json')
    },
    expect: true,
    info: 'findNearestPackageJson falls back to CWD for non-absolute paths',
  },
]
