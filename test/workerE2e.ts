/* ---------------------------------------------------------------------------
 * Worker-execution e2e scenarios.
 *
 * The worker entry (src/run/worker.ts) and the worker branches of
 * arrayStrategies only execute inside spawned workers/child runs, so they
 * are exercised through throwaway child projects (same pattern as
 * test/workerDeath.ts) and asserted on via exit code + printed report.
 * -------------------------------------------------------------------------- */

import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { TestCase } from '#src/types.js'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const unitBin = path.join(repoRoot, 'dist', 'bin', 'unit.js')

// Generous per-worker timeout for the children: under coverage collection
// (npm run coverage re-execs with NODE_V8_COVERAGE) the children's workers
// run several times slower and the default 8s budget was not enough.
const CHILD_ENV: Record<string, string> = { MAGIC_TEST_WORKER_TIMEOUT_MS: '20000' }

type ChildResult = {
  code: number | null
  signal: string | null
  out: string
  ms: number
  timedOut: boolean
  label: string
}

const runChild = async (
  args: string[],
  cwd: string,
  env: Record<string, string> = {},
  guardMs = 30000,
): Promise<ChildResult> => {
  const started = Date.now()
  let timedOut = false
  // A nested run must not inherit the parent's results-file handoff: the
  // child would withhold its summary from stdout and overwrite the parent's
  // file. Children always report to stdout.
  const childEnv: NodeJS.ProcessEnv = { ...process.env, ...env }
  delete childEnv.MAGIC_TEST_RESULTS_FILE
  // The children are a vehicle, not a target: their own V8 coverage data
  // would land in the parent's temp dir and skew the merged report.
  delete childEnv.NODE_V8_COVERAGE
  const child = spawn(process.execPath, args, {
    cwd,
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  // Children print ANSI colors even when piped — strip them so callers can
  // assert on plain substrings like '2/2 100%' (colors would split it).
  const strip = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '')
  child.stdout.on('data', d => {
    out += strip(String(d))
  })
  child.stderr.on('data', d => {
    out += strip(String(d))
  })
  const killTimer = setTimeout(() => {
    timedOut = true
    child.kill('SIGKILL')
  }, guardMs)
  // 'close' fires after BOTH process exit and stdio EOF — awaiting 'exit'
  // alone can read the report before the pipe has drained (output-loss
  // flake under load).
  const code = await new Promise<number | null>(resolve => child.on('close', c => resolve(c)))
  clearTimeout(killTimer)
  return {
    code,
    signal: child.signalCode ?? null,
    out,
    ms: Date.now() - started,
    timedOut,
    label: '',
  }
}

const withChildProject = async (
  label: string,
  source: string,
  env: Record<string, string> = {},
): Promise<ChildResult> => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'mt-worker-e2e-'))
  await mkdir(path.join(dir, 'test'), { recursive: true })
  await writeFile(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'mt-worker-e2e', version: '0.0.1', type: 'module' }, null, 2),
  )
  await writeFile(path.join(dir, 'test', 'main.ts'), source)
  try {
    return { ...(await runChild([unitBin], dir, env)), label }
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

export default [
  {
    fn: () =>
      withChildProject(
        'hooks-batch',
        `
export default {
  beforeAll: () => {
    ;(globalThis as Record<string, unknown>).__mtHooks = 'setup'
    return () => {
      delete (globalThis as Record<string, unknown>).__mtHooks
    }
  },
  beforeEach: () => {
    ;(globalThis as Record<string, unknown>).__mtBeforeEach = true
  },
  afterEach: () => {
    delete (globalThis as Record<string, unknown>).__mtBeforeEach
  },
  tests: [
    { fn: () => 1, expect: 1, info: 'runs with beforeEach/afterEach' },
    { fn: () => 2, expect: 2, info: 'second hooked test' },
    { fn: () => { throw new Error('hooks boom') }, expect: 1, info: 'throws inside the worker' },
  ],
}
`,
      ),
    expect: (r: ChildResult) =>
      !r.timedOut &&
      r.code === 1 &&
      r.out.includes('hooks boom') &&
      r.out.includes('Pass: 2/3') &&
      r.ms < 25000,
    info: 'beforeAll/beforeEach/afterEach run in the batch worker; a throwing test is reported and does not hang the run',
  },
  {
    fn: () =>
      withChildProject(
        'single-mode',
        `
export default [
  {
    before: () => {
      ;(globalThis as Record<string, unknown>).__mtSingle = true
      return () => {
        delete (globalThis as Record<string, unknown>).__mtSingle
      }
    },
    fn: () => 1,
    expect: 1,
    info: 'individual worker 1',
  },
  {
    before: () => {
      ;(globalThis as Record<string, unknown>).__mtSingle = true
      return () => {
        delete (globalThis as Record<string, unknown>).__mtSingle
      }
    },
    fn: () => 2,
    expect: 2,
    info: 'individual worker 2',
  },
]
`,
        { MAGIC_TEST_WORKER_REUSE: '0' },
      ),
    expect: (r: ChildResult) =>
      !r.timedOut && r.code === 0 && r.out.includes('Ran 2 tests') && r.out.includes('100%'),
    info: 'MAGIC_TEST_WORKER_REUSE=0 runs each hooked test in its own single-mode worker',
  },
  {
    fn: () =>
      withChildProject(
        'setup-failure',
        `
import { isMainThread } from 'node:worker_threads'
if (!isMainThread) {
  throw new Error('setup boom')
}
export default {
  tests: [
    {
      before: () => {
        ;(globalThis as Record<string, unknown>).__mtSetup = 1
        return () => {}
      },
      fn: () => 1,
      expect: 1,
      info: 'never runs',
    },
  ],
}
`,
      ),
    expect: (r: ChildResult) =>
      !r.timedOut && r.code === 1 && r.out.includes('Pass: 0/1') && !r.out.includes('100%'),
    info: 'a test-file import failure inside the worker fails the whole batch (suite 0/1, exit 1)',
  },
  {
    fn: () =>
      withChildProject(
        'parallel-unhooked',
        `
export default [
  {
    before: () => {
      ;(globalThis as Record<string, unknown>).__mtPar = 1
      return () => {
        delete (globalThis as Record<string, unknown>).__mtPar
      }
    },
    fn: () => 1,
    expect: 1,
    info: 'hooked test (worker)',
  },
  {
    fn: () => {
      ;(globalThis as Record<string, unknown>).__mtPar2 = 1
      delete (globalThis as Record<string, unknown>).__mtPar2
      return 1
    },
    expect: 1,
    info: 'unhooked global-mutating test (parallel main thread)',
  },
]
`,
      ),
    expect: (r: ChildResult) =>
      !r.timedOut && r.code === 0 && r.out.includes('Ran 2 tests') && r.out.includes('100%'),
    info: 'isolated array suite without beforeAll: hooked test in worker, unhooked test in parallel on the main thread',
  },
] satisfies TestCase[]
