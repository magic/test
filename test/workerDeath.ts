/* ---------------------------------------------------------------------------
 * Regression tests for .plans/FIX_HANG.md (B1–B3).
 *
 * A dead/stuck worker must never hang the run or let it exit 0 silently.
 * These scenarios cannot be tested in-process (a dead worker fails the
 * whole run it lives in), so each test spawns a throwaway child project
 * that runs the built dist/bin/unit.js against a test file designed to
 * kill its worker, and asserts the child completes with exit 1, a printed
 * report, and bounded wall time.
 * -------------------------------------------------------------------------- */

import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import type { TestCase } from '#src/types.js'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const unitBin = path.join(repoRoot, 'dist', 'bin', 'unit.js')

// Backstop for worker round-trips in the child runs (post-fix B1 timeout).
const CHILD_ENV: Record<string, string> = { MAGIC_TEST_WORKER_TIMEOUT_MS: '8000' }

type ChildResult = {
  code: number | null
  signal: string | null
  out: string
  ms: number
  timedOut: boolean
}

const runChild = async (
  args: string[],
  cwd: string,
  env: Record<string, string> = {},
  guardMs = 20000,
): Promise<ChildResult> => {
  const started = Date.now()
  let timedOut = false
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  child.stdout.on('data', d => {
    out += String(d)
  })
  child.stderr.on('data', d => {
    out += String(d)
  })
  const killTimer = setTimeout(() => {
    timedOut = true
    child.kill('SIGKILL')
  }, guardMs)
  const code = await new Promise<number | null>(resolve => child.on('exit', c => resolve(c)))
  clearTimeout(killTimer)
  return { code, signal: child.signalCode ?? null, out, ms: Date.now() - started, timedOut }
}

const makeChildProject = async (deathSource: string): Promise<string> => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'mt-worker-death-'))
  await mkdir(path.join(dir, 'test'), { recursive: true })
  await writeFile(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'mt-worker-death', version: '0.0.1', type: 'module' }, null, 2),
  )
  await writeFile(path.join(dir, 'test', 'death.ts'), deathSource)
  return dir
}

/**
 * Scenario 1 (B1, single mode): a test in an individual worker calls
 * process.exit(0). Pre-fix: exit code 0 without a message left the promise
 * pending forever → silent exit 0 after ~30 s. Post-fix: failure reported,
 * exit 1.
 */
const INDIVIDUAL_DEATH_SRC = `
export default [
  {
    before: () => {
      ;(globalThis as Record<string, unknown>).__mtDeath = true
      return () => undefined
    },
    fn: () => {
      process.exit(0)
      return 1
    },
    expect: 1,
    info: 'individual worker death',
  },
]
`

/**
 * Scenario 2 (B1, batch mode): unhooked tests of a beforeAll suite are
 * batched into one worker; the last test calls process.exit(1).
 * Pre-fix: batch mode ignored every exit code → silent exit 0 after ~30 s.
 * Post-fix: the dead batch is reported as failed tests, exit 1.
 * (The hooked test forces needsIsolation, which routes the unhooked tests
 * into the batch worker.)
 */
const BATCH_DEATH_SRC = `
export default {
  beforeAll: async () => {
    ;(globalThis as Record<string, unknown>).__mtBatch = true
  },
  tests: [
    { before: () => () => undefined, fn: () => 1, expect: 1, info: 'hooked (individual worker)' },
    { fn: () => 1, expect: 1, info: 'unhooked (batch worker), runs before the kill' },
    { fn: () => { process.exit(1); return 1 }, expect: 1, info: 'kills the batch worker' },
  ],
}
`

/**
 * Scenario 3 (B1 + live handle): like scenario 2, but beforeAll also opens
 * an http server on the MAIN thread (cleanup returned from beforeAll). The
 * server keeps the main-thread event loop alive, so pre-fix this is the
 * infinite-hang case. Post-fix: the run completes, beforeAll cleanup closes
 * the server, failures are reported, exit 1.
 */
const LIVE_HANDLE_DEATH_SRC = `
import http from 'node:http'

export default {
  beforeAll: async () => {
    ;(globalThis as Record<string, unknown>).__mtLive = true
    const srv = http.createServer((req, res) => res.end('ok'))
    await new Promise<void>(r => srv.listen(0, () => r()))
    return () => new Promise<void>(r => srv.close(() => r()))
  },
  tests: [
    { before: () => () => undefined, fn: () => 1, expect: 1, info: 'hooked (individual worker)' },
    { fn: () => 1, expect: 2, info: 'failing assertion (batch worker), runs before the kill' },
    { fn: () => { process.exit(1); return 1 }, expect: 1, info: 'kills the batch worker' },
  ],
}
`

const assertDeathRun = (r: ChildResult, expectedCode: number): boolean =>
  !r.timedOut &&
  r.code === expectedCode &&
  r.out.includes('without posting a result') &&
  r.ms < 18000

const deathScenario = async (
  label: 'individual' | 'batch' | 'live-handle',
  source: string,
): Promise<ChildResult & { label: string }> => {
  const dir = await makeChildProject(source)
  try {
    const r = await runChild([unitBin], dir, CHILD_ENV)
    return { ...r, label }
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

export default [
  {
    fn: async () => deathScenario('individual', INDIVIDUAL_DEATH_SRC),
    expect: (result: unknown) => assertDeathRun(result as ChildResult, 1),
    info: 'individual worker death: run completes, test reported failed, exit 1 (was: silent exit 0 / hang)',
  },
  {
    fn: async () => deathScenario('batch', BATCH_DEATH_SRC),
    expect: (result: unknown) => assertDeathRun(result as ChildResult, 1),
    info: 'batch worker death: dead batch reported failed, exit 1 (was: silent exit 0 after ~30 s)',
  },
  {
    fn: async () => deathScenario('live-handle', LIVE_HANDLE_DEATH_SRC),
    expect: (result: unknown) => assertDeathRun(result as ChildResult, 1),
    info: 'worker death with live server handle: run completes (infinite-hang case), cleanup ran, exit 1',
  },
  {
    fn: async () => {
      // B2: limitedPromiseAllSettled must clear its per-item discovery
      // timers. Pre-fix the leftover 30 s timer kept a settled process
      // alive for ~30 s more; post-fix the child exits right after the
      // call resolves.
      const script = `
import { pathToFileURL } from 'node:url'
const t0 = Date.now()
const { limitedPromiseAllSettled } = await import(${JSON.stringify(
        pathToFileURL(path.join(repoRoot, 'dist', 'bin', 'lib', 'limitedPromiseAllSettled.js'))
          .href,
      )})
const res = await limitedPromiseAllSettled([1, 2, 3], 2, async x => {
  await new Promise(r => setTimeout(r, 20))
  return x
})
if (res.length !== 3 || !res.every(r => r.status === 'fulfilled')) {
  console.log('BAD results', JSON.stringify(res))
  process.exit(1)
}
console.log('OK', Date.now() - t0)
`
      const r = await runChild(['--input-type=module', '-e', script], repoRoot, {}, 15000)
      return {
        ...r,
        label: 'discovery-timers',
        ok: r.code === 0 && r.out.includes('OK') && r.ms < 5000,
      }
    },
    expect: (result: unknown) => (result as { ok: boolean }).ok,
    info: 'discovery timers cleared: settled limitedPromiseAllSettled process exits fast (was: ~30 s pinned)',
  },
  {
    fn: async () => {
      // B3: a remote module fetch that never responds must time out
      // (MAGIC_TEST_REMOTE_TIMEOUT_MS) instead of hanging the loader —
      // in a worker that hangs the whole run via B1.
      const loaderUrl = pathToFileURL(path.join(repoRoot, 'dist', 'bin', 'lib', 'tsLoader.js')).href
      const script = `
import http from 'node:http'
process.env.MAGIC_TEST_REMOTE_TIMEOUT_MS = '800'
const srv = http.createServer()
await new Promise(r => srv.listen(0, () => r()))
const port = srv.address().port
const { resolve } = await import(${JSON.stringify(loaderUrl)})
const t0 = Date.now()
try {
  await resolve(\`http://127.0.0.1:\${port}/mod.mjs\`, {}, () => {
    throw new Error('nextResolve should not be called')
  })
  console.log('BAD: resolve did not throw')
  process.exit(1)
} catch (e) {
  const ms = Date.now() - t0
  const msg = String((e && e.message) || e)
  if (ms < 10000 && msg.includes('Timed out fetching remote module')) {
    console.log('OK', ms, msg)
  } else {
    console.log('BAD', ms, msg)
    process.exit(1)
  }
}
srv.close()
process.exit(0)
`
      const r = await runChild(['--input-type=module', '-e', script], repoRoot, {}, 15000)
      return { ...r, label: 'remote-fetch' }
    },
    expect: (result: { code: number; out: string }) =>
      result.code === 0 && result.out.includes('OK'),
    info: 'remote fetch bounded: non-responding http module times out with a clear error (was: hang)',
  },
] satisfies TestCase[]
