import { spawn } from 'node:child_process'
import path from 'node:path'

import { cachedTranspile } from '#src/bin/lib/transpileCache.js'
import { CACHE_DIR } from '#src/constants.js'

// The persistent transpile cache is content-addressed: output is a pure
// function of the input code (+ transpiler version), so most tests need no
// fixture cleanup — each unique source string simply adds an entry.
//
// The kill-switch test runs in a CHILD PROCESS: MAGIC_TEST_COMPILE_CACHE is
// a process-wide env var and tests run concurrently in shared worker threads
// (which share process.env). Mutating it in-process would disable the
// compile cache for sibling tests mid-run (flaky cache-hit assertions).

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const runInChild = (code: string, env: Record<string, string> = {}): Promise<string> =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', code], {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
    })
    let out = ''
    child.stdout.on('data', d => (out += String(d)))
    child.stderr.on('data', d => (out += String(d)))
    child.on('error', reject)
    child.on('close', code =>
      code === 0 ? resolve(out) : reject(new Error('child exit ' + code + ': ' + out)),
    )
  })

export default [
  {
    fn: async () => {
      const out = await cachedTranspile(
        'export const n: number = 42\ninterface I { a: string }\nexport const i: I = { a: "b" }\n',
      )
      return {
        typesStripped: !out.includes(': number') && !out.includes('interface I'),
        valuesKept: out.includes('42') && out.includes('export const i'),
      }
    },
    expect: (v: { typesStripped: boolean; valuesKept: boolean }) => v.typesStripped && v.valuesKept,
    info: 'cachedTranspile strips TypeScript types and keeps the JS',
  },
  {
    fn: async () => {
      const src = 'export const v: number = ' + Math.random()
      const a = await cachedTranspile(src)
      await sleep(10)
      const b = await cachedTranspile(src)
      return a === b && a.includes('export const v =')
    },
    expect: true,
    info: 'identical content transpiles to identical output (cache-stable)',
  },
  {
    fn: async () => {
      const s1 = 'export const k1: number = ' + Math.random()
      const s2 = 'export const k2: number = ' + Math.random()
      const o1 = await cachedTranspile(s1)
      const o2 = await cachedTranspile(s2)
      return o1 !== o2
    },
    expect: true,
    info: 'different content yields different output (no cross-contamination)',
  },
  {
    fn: async () => {
      const dir = path.join(process.cwd(), CACHE_DIR, 'transpile')
      await cachedTranspile('export const probe: number = ' + Date.now())
      const { readdir } = await import('node:fs/promises')
      const files = await readdir(dir)
      return { persisted: files.some(f => f.endsWith('.js')) }
    },
    expect: (v: { persisted: boolean }) => v.persisted,
    info: 'transpiled output is persisted under the cache dir',
  },
  {
    fn: async () => {
      const cwd = process.cwd()
      const out = await runInChild(
        `
        process.chdir(${JSON.stringify(cwd)})
        await import(${JSON.stringify(path.join(cwd, 'dist/bin/lib/registerLoader.js'))})
        const { cachedTranspile } = await import(${JSON.stringify(
          path.join(cwd, 'dist/bin/lib/transpileCache.js'),
        )})
        const out = await cachedTranspile('export const ks: number = ' + Date.now() + '\\n')
        if (!out.includes('export const ks =')) { console.error(out); process.exit(1) }
        console.log('ok')
        `,
        { MAGIC_TEST_COMPILE_CACHE: '0' },
      )
      return out.includes('ok')
    },
    expect: true,
    info: 'MAGIC_TEST_COMPILE_CACHE=0 (child process) still returns correct transpiled output',
  },
]
