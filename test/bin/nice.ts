import {
  getEffectiveNice,
  wrapWithNice,
  shouldYieldCpu,
  discoveryTimeoutMs,
  testTimeoutMs,
  workerTimeoutMs,
} from '#src/bin/t.js'
import type { UnitCommand } from '#src/bin/t.js'
import type { TestCase } from '#src/types.js'

const base: UnitCommand = { cmd: 'node', argv: ['/proj/dist/bin/unit.js'], coverage: null }

const withEnv = async (value: string | undefined, fn: () => number | UnitCommand) => {
  const original = process.env.MAGIC_TEST_NICE
  if (value === undefined) {
    delete process.env.MAGIC_TEST_NICE
  } else {
    process.env.MAGIC_TEST_NICE = value
  }
  try {
    return await fn()
  } finally {
    if (original === undefined) {
      delete process.env.MAGIC_TEST_NICE
    } else {
      process.env.MAGIC_TEST_NICE = original
    }
  }
}

const tests: TestCase[] = [
  {
    fn: () => withEnv(undefined, () => getEffectiveNice()),
    expect: 10,
    info: 'getEffectiveNice defaults to 10',
  },
  {
    fn: () => withEnv('5', () => getEffectiveNice()),
    expect: 5,
    info: 'MAGIC_TEST_NICE=5 honored',
  },
  {
    fn: () => withEnv('0', () => getEffectiveNice()),
    expect: 0,
    info: 'MAGIC_TEST_NICE=0 disables throttling',
  },
  {
    fn: () => withEnv('99', () => getEffectiveNice()),
    expect: 19,
    info: 'MAGIC_TEST_NICE clamped to the 0-19 nice range',
  },
  {
    fn: () => withEnv('abc', () => getEffectiveNice()),
    expect: 10,
    info: 'invalid MAGIC_TEST_NICE falls back to the default',
  },
  {
    fn: () => wrapWithNice(base, 10),
    expect: (v: UnitCommand) =>
      process.platform === 'win32'
        ? v.cmd === 'node' && v.argv[0] === '/proj/dist/bin/unit.js'
        : v.cmd === 'nice' &&
          v.argv[0] === '-n' &&
          v.argv[1] === '10' &&
          v.argv[2] === 'node' &&
          v.argv[3] === '/proj/dist/bin/unit.js',
    info: 'wrapWithNice wraps the runner in nice -n 10 on POSIX (no-op on Windows)',
  },
  {
    fn: () => wrapWithNice(base, 0),
    expect: (v: UnitCommand) => v.cmd === 'node' && v.argv[0] === '/proj/dist/bin/unit.js',
    info: 'wrapWithNice is a no-op for nice 0',
  },
  {
    fn: () => {
      const coverage = {
        tempDir: '/proj/coverage/tmp',
        reportsDir: '/proj/coverage',
        include: ['src'],
        exclude: ['test'],
        extensions: ['.js'],
        all: true,
        excludeAfterRemap: true,
      }
      const wrapped = wrapWithNice({ ...base, coverage }, 10)
      return { sameCoverage: wrapped.coverage === coverage, wrapped: wrapped.cmd }
    },
    expect: (v: { sameCoverage: boolean; wrapped: string }) => v.sameCoverage,
    info: 'wrapWithNice keeps the coverage options intact',
  },
  {
    fn: () => shouldYieldCpu(10, 16),
    expect: (v: boolean) => v === true,
    info: 'shouldYieldCpu: load 10 on 16 cores (> 8) yields',
  },
  {
    fn: () => shouldYieldCpu(8, 16),
    expect: (v: boolean) => v === false,
    info: 'shouldYieldCpu: load exactly at half the cores does not yield',
  },
  {
    fn: () => shouldYieldCpu(1.5, 16),
    expect: (v: boolean) => v === false,
    info: 'shouldYieldCpu: light load runs at full speed',
  },
  {
    fn: () => shouldYieldCpu(40, 16),
    expect: (v: boolean) => v === true,
    info: 'shouldYieldCpu: heavy load yields',
  },
  {
    fn: () => discoveryTimeoutMs(10, 16, undefined),
    expect: '120000',
    info: 'discoveryTimeoutMs: busy machine at spawn bumps the budget to 120 s',
  },
  {
    fn: () => discoveryTimeoutMs(1.5, 16, undefined),
    expect: undefined,
    info: 'discoveryTimeoutMs: idle machine keeps the stock 30 s default',
  },
  {
    fn: () => discoveryTimeoutMs(8, 16, undefined),
    expect: undefined,
    info: 'discoveryTimeoutMs: load exactly at half the cores keeps the stock default',
  },
  {
    fn: () => discoveryTimeoutMs(40, 16, '45000'),
    expect: '45000',
    info: 'discoveryTimeoutMs: an explicit MAGIC_TEST_DISCOVERY_TIMEOUT wins on a busy machine',
  },
  {
    fn: () => discoveryTimeoutMs(1.5, 16, '15000'),
    expect: '15000',
    info: 'discoveryTimeoutMs: an explicit MAGIC_TEST_DISCOVERY_TIMEOUT wins on an idle machine',
  },
  {
    fn: () => discoveryTimeoutMs(40, 16, ''),
    expect: '120000',
    info: 'discoveryTimeoutMs: an empty env value is treated as unset',
  },
  {
    fn: () => testTimeoutMs(10, 16, undefined),
    expect: '300000',
    info: 'testTimeoutMs: busy machine at spawn bumps the per-test budget to 300 s',
  },
  {
    fn: () => testTimeoutMs(1.5, 16, undefined),
    expect: undefined,
    info: 'testTimeoutMs: idle machine keeps the stock 30 s default',
  },
  {
    fn: () => testTimeoutMs(8, 16, undefined),
    expect: undefined,
    info: 'testTimeoutMs: load exactly at half the cores keeps the stock default',
  },
  {
    fn: () => testTimeoutMs(40, 16, '45000'),
    expect: '45000',
    info: 'testTimeoutMs: an explicit MAGIC_TEST_TIMEOUT wins on a busy machine',
  },
  {
    fn: () => testTimeoutMs(1.5, 16, '15000'),
    expect: '15000',
    info: 'testTimeoutMs: an explicit MAGIC_TEST_TIMEOUT wins on an idle machine',
  },
  {
    fn: () => testTimeoutMs(40, 16, ''),
    expect: '300000',
    info: 'testTimeoutMs: an empty env value is treated as unset',
  },
  {
    fn: () => workerTimeoutMs(10, 16, undefined),
    expect: '600000',
    info: 'workerTimeoutMs: busy machine at spawn bumps the round-trip backstop to 600 s',
  },
  {
    fn: () => workerTimeoutMs(1.5, 16, undefined),
    expect: undefined,
    info: 'workerTimeoutMs: idle machine keeps the stock 120 s backstop',
  },
  {
    fn: () => workerTimeoutMs(40, 16, '45000'),
    expect: '45000',
    info: 'workerTimeoutMs: an explicit MAGIC_TEST_WORKER_TIMEOUT_MS wins on a busy machine',
  },
  {
    fn: () => workerTimeoutMs(1.5, 16, '15000'),
    expect: '15000',
    info: 'workerTimeoutMs: an explicit MAGIC_TEST_WORKER_TIMEOUT_MS wins on an idle machine',
  },
  {
    fn: () => workerTimeoutMs(40, 16, ''),
    expect: '600000',
    info: 'workerTimeoutMs: an empty env value is treated as unset',
  },
]

export default tests
