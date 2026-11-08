import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { importFileInWorker } from '#src/run/lib/importFileInWorker.js'
import { getCwd } from '#src/constants.js'
import { has } from '#lib/has.js'
import is from '@magic/types'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // imports a module with a default export -> returns default
  {
    fn: async () => {
      const file = path.join(getCwd(), 'test', 'beforeAll.ts')
      const mod = await importFileInWorker(file)
      // beforeAll.ts exports a default function
      return mod
    },
    expect: is.function,
    info: 'importFileInWorker returns default export when present',
  },
  // imports a module and returns the namespace when no default
  {
    fn: async () => {
      const tmp = path.join(os.tmpdir(), `magic-worker-import-${Date.now()}.mjs`)
      fs.writeFileSync(tmp, 'export const answer = 42;\nexport function helper() { return 1; }')
      try {
        const mod = await importFileInWorker(tmp)
        return (mod as { answer?: number }).answer
      } finally {
        fs.unlinkSync(tmp)
      }
    },
    expect: 42,
    info: 'importFileInWorker returns namespace when no default export',
  },
  // default export takes priority
  {
    fn: async () => {
      const tmp = path.join(os.tmpdir(), `magic-worker-default-${Date.now()}.mjs`)
      fs.writeFileSync(tmp, 'export const named = "n";\nexport default "the-default";')
      try {
        const mod = await importFileInWorker(tmp)
        return mod
      } finally {
        fs.unlinkSync(tmp)
      }
    },
    expect: 'the-default',
    info: 'importFileInWorker prefers default export over namespace',
  },
  // failing import throws with prefixed message
  {
    fn: async () => {
      const tmp = path.join(os.tmpdir(), `magic-worker-bad-${Date.now()}.mjs`)
      fs.writeFileSync(tmp, 'this is not valid javascript !!!')
      try {
        await importFileInWorker(tmp)
        return ''
      } catch (e) {
        return (e as Error).message
      } finally {
        fs.unlinkSync(tmp)
      }
    },
    expect: has.string('Failed to import test file'),
    info: 'importFileInWorker prefixes error message on import failure',
  },
  // non-existent file throws
  {
    fn: async () => {
      try {
        await importFileInWorker(path.join(os.tmpdir(), 'definitely-does-not-exist-xyz.mjs'))
        return ''
      } catch (e) {
        return (e as Error).message
      }
    },
    expect: has.string('Failed to import test file'),
    info: 'importFileInWorker throws for missing file',
  },
]

export default tests
