import type { TestCase } from '#src/types.js'

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { collectDtsFiles } from '#lib/dts/collectDtsFiles.js'

/**
 * Fixture tree (content irrelevant to collection):
 *
 *   a.d.ts
 *   keep/b.d.ts
 *   skipdir/c.d.ts
 *   deep/nested/d.d.ts
 */
const mkTree = async (): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'magic-dts-collect-'))
  await mkdir(path.join(root, 'keep'), { recursive: true })
  await mkdir(path.join(root, 'skipdir'), { recursive: true })
  await mkdir(path.join(root, 'deep', 'nested'), { recursive: true })
  await writeFile(path.join(root, 'a.d.ts'), 'export const a: string')
  await writeFile(path.join(root, 'keep', 'b.d.ts'), 'export const b: number')
  await writeFile(path.join(root, 'skipdir', 'c.d.ts'), 'export const c: boolean')
  await writeFile(path.join(root, 'deep', 'nested', 'd.d.ts'), 'export const d: symbol')
  return root
}

// Runs collectDtsFiles on a fresh fixture tree, returns slash-separated
// relative paths, sorted (stable across platforms).
const collect = async (excludes: string[]): Promise<string[]> => {
  const root = await mkTree()
  try {
    return (await collectDtsFiles(root, excludes))
      .map(f => path.relative(root, f).split(path.sep).join('/'))
      .sort()
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

const ALL = ['a.d.ts', 'deep/nested/d.d.ts', 'keep/b.d.ts', 'skipdir/c.d.ts']

export default [
  {
    fn: () => collect([]),
    expect: ALL,
    info: 'no excludes: all .d.ts files are collected',
  },
  {
    fn: () => collect(['skipdir']),
    expect: ['a.d.ts', 'deep/nested/d.d.ts', 'keep/b.d.ts'],
    info: 'directory exclude also skips everything below it',
  },
  {
    fn: () => collect(['deep']),
    expect: ['a.d.ts', 'keep/b.d.ts', 'skipdir/c.d.ts'],
    info: 'exclude pattern matches nested directory contents',
  },
  {
    fn: () => collect(['**/b.d.ts']),
    expect: ['a.d.ts', 'deep/nested/d.d.ts', 'skipdir/c.d.ts'],
    info: 'glob exclude skips a matching file at any depth',
  },
  {
    fn: () => collect(['skipdir', '!skipdir/c.d.ts']),
    expect: ALL,
    info: 'negated exclude re-includes a specific file',
  },
  {
    fn: () => collect(['does-not-exist']),
    expect: ALL,
    info: 'exclude matching nothing leaves the collection untouched',
  },
  {
    fn: () => collect(['a.d.ts', 'keep', 'skipdir/c.d.ts']),
    expect: ['deep/nested/d.d.ts'],
    info: 'multiple excludes compose',
  },
] satisfies TestCase[]
