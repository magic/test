import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { checkDtsFile } from '#lib/dts/typeCheckDts.js'
import type { DtsCheckResult } from '#lib/dts/typeCheckDts.js'
import type { TestCase } from '#src/types.js'

/**
 * Fixture for the tsconfig `types` behavior:
 *
 *   app.d.ts                          - uses the `fakelibGlobal` ambient global
 *   node_modules/@types/fakelib/index.d.ts - declares `fakelibGlobal`
 *   tsconfig.json                     - optional, varies per test
 *
 * The global only resolves when the check program's `types` option includes
 * `fakelib`, i.e. when the generator picks it up from the project's tsconfig
 * compilerOptions.types.
 */
const APP_DTS = `export interface AppInfo {
  libName: string
}

export const libName: typeof fakelibGlobal.name
`

const FAKELIB_TYPES = `declare global {
  const fakelibGlobal: { name: string }
}
export {}
`

const mkRoot = async (files: Record<string, string>): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'magic-dts-types-'))
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(root, rel)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, content)
  }
  return root
}

const baseFiles: Record<string, string> = {
  'app.d.ts': APP_DTS,
  'node_modules/@types/fakelib/index.d.ts': FAKELIB_TYPES,
}

// Runs the d.ts check on the fixture and returns the outcome. Each call uses
// a fresh temp root so the per-file check cache (keyed by path + mtime) can
// never shadow a previous case.
const check = async (extraFiles: Record<string, string> = {}): Promise<DtsCheckResult> => {
  const root = await mkRoot({ ...baseFiles, ...extraFiles })
  try {
    return await checkDtsFile(path.join(root, 'app.d.ts'), root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

// The unresolved-global diagnostic on the checked file itself
const hasGlobalError = (r: DtsCheckResult): boolean => r.fileErrors.some(e => e.code === 2304)

export default [
  {
    fn: () => check({ 'tsconfig.json': '{ "compilerOptions": { "types": ["fakelib"] } }' }),
    expect: (r: DtsCheckResult) => r.filePass && !hasGlobalError(r),
    info: 'tsconfig types: matching @types package is included in the check',
  },
  {
    fn: () => check({ 'tsconfig.json': '{ "compilerOptions": { "strict": true } }' }),
    expect: (r: DtsCheckResult) => !r.filePass && hasGlobalError(r),
    info: 'tsconfig without a types field: no @types auto-inclusion (unchanged behavior)',
  },
  {
    fn: () => check(),
    expect: (r: DtsCheckResult) => !r.filePass && hasGlobalError(r),
    info: 'no tsconfig.json: no @types auto-inclusion (unchanged behavior)',
  },
  {
    fn: () =>
      check({
        'tsconfig.json': '{ "extends": "./base.json" }',
        'base.json': '{ "compilerOptions": { "types": ["fakelib"] } }',
      }),
    expect: (r: DtsCheckResult) => r.filePass && !hasGlobalError(r),
    info: 'tsconfig extends: types from the base config are honored',
  },
  {
    fn: () =>
      check({
        'tsconfig.json': '{ "compilerOptions": { "types": ["fakelib", "does-not-exist"] } }',
      }),
    expect: (r: DtsCheckResult) => r.filePass && !hasGlobalError(r),
    info: 'tsconfig types: a missing @types package does not break the valid ones',
  },
] satisfies TestCase[]
