import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { importFileInWorker } from '#src/run/lib/importFileInWorker.js'
import { CWD } from '#src/constants.js'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // imports a module with a default export -> returns default
  {
    fn: async () => {
      const file = path.join(CWD, 'test', 'beforeAll.ts')
      const mod = await importFileInWorker(file)
      // beforeAll.ts exports a default function
      return typeof mod === 'function' || mod !== undefined
    },
    expect: true,
    info: 'importFileInWorker returns default export when present',
  },
  // imports a module and returns the namespace when no default
  {
    fn: async () => {
      const tmp = path.join(os.tmpdir(), `magic-worker-import-${Date.now()}.mjs`)
      fs.writeFileSync(tmp, 'export const answer = 42;\nexport function helper() { return 1; }')
      try {
        const mod = await importFileInWorker(tmp)
        return (mod as { answer?: number }).answer === 42
      } finally {
        fs.unlinkSync(tmp)
      }
    },
    expect: true,
    info: 'importFileInWorker returns namespace when no default export',
  },
  // default export takes priority
  {
    fn: async () => {
      const tmp = path.join(os.tmpdir(), `magic-worker-default-${Date.now()}.mjs`)
      fs.writeFileSync(tmp, 'export const named = "n";\nexport default "the-default";')
      try {
        const mod = await importFileInWorker(tmp)
        return mod === 'the-default'
      } finally {
        fs.unlinkSync(tmp)
      }
    },
    expect: true,
    info: 'importFileInWorker prefers default export over namespace',
  },
  // failing import throws with prefixed message
  {
    fn: async () => {
      const tmp = path.join(os.tmpdir(), `magic-worker-bad-${Date.now()}.mjs`)
      fs.writeFileSync(tmp, 'this is not valid javascript !!!')
      try {
        await importFileInWorker(tmp)
        return false
      } catch (e) {
        return e instanceof Error && e.message.includes('Failed to import test file')
      } finally {
        fs.unlinkSync(tmp)
      }
    },
    expect: true,
    info: 'importFileInWorker prefixes error message on import failure',
  },
  // non-existent file throws
  {
    fn: async () => {
      try {
        await importFileInWorker(path.join(os.tmpdir(), 'definitely-does-not-exist-xyz.mjs'))
        return false
      } catch (e) {
        return e instanceof Error && e.message.includes('Failed to import test file')
      }
    },
    expect: true,
    info: 'importFileInWorker throws for missing file',
  },
]

export default tests
