import type { Test } from '@magic/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { formatRunSummary, summary } from '#lib/stats/summary.js'
import { readRunSummary, writeRunSummary } from '#lib/stats/resultsFile.js'
import { printPercent } from '#lib/stats/printPercent.js'

import type { RunSummary } from '#lib/stats/resultsFile.js'

/** Patches console.log synchronously around fn and returns the logged lines. */
const captureLog = (fn: () => void): string[] => {
  const old = console.log
  const lines: string[] = []
  console.log = ((...args: unknown[]) => {
    lines.push(args.map(String).join(' '))
  }) as typeof console.log
  try {
    fn()
  } finally {
    console.log = old
  }
  return lines
}

const tmpDir = (): string => fs.mkdtempSync(path.join(os.tmpdir(), 'magic-test-summary-'))

export default [
  {
    fn: () => formatRunSummary({ all: 100, pass: 99, duration: '22.9s', totalDuration: '' }),
    expect: [`Ran 100 tests in 22.9s. Passed 99/100 ${printPercent(99)}%`],
    info: 'summary without discovery overhead is a single Ran line',
  },
  {
    fn: () => formatRunSummary({ all: 100, pass: 99, duration: '22.9s', totalDuration: '24.1s' }),
    expect: [
      `Total time (including discovery): 24.1s`,
      `Ran 100 tests in 22.9s. Passed 99/100 ${printPercent(99)}%`,
    ],
    info: 'total time line precedes the Ran line (Ran stays last)',
  },
  {
    fn: () => formatRunSummary({ all: 2, pass: 2, duration: '1.00s', totalDuration: '1.00s' }),
    expect: [`Ran 2 tests in 1.00s. Passed 2/2 ${printPercent(100)}%`],
    info: 'identical durations omit the total time line',
  },
  {
    fn: () => readRunSummary(path.join(os.tmpdir(), 'magic-test-summary-missing.json')),
    expect: null,
    info: 'readRunSummary returns null for a missing file',
  },
  {
    fn: () => {
      const dir = tmpDir()
      const good = path.join(dir, 'good.json')
      const bad = path.join(dir, 'bad.json')
      writeRunSummary(good, { all: 3, pass: 2, duration: '500ms', totalDuration: '' })
      fs.writeFileSync(bad, '{nope')
      const r = { good: readRunSummary(good), bad: readRunSummary(bad) }
      fs.rmSync(dir, { recursive: true, force: true })
      return r
    },
    expect: (v: { good: RunSummary | null; bad: RunSummary | null }) =>
      v.good !== null &&
      v.good.all === 3 &&
      v.good.pass === 2 &&
      v.good.duration === '500ms' &&
      v.bad === null,
    info: 'readRunSummary round-trips written summaries and tolerates corrupt files',
  },
  {
    fn: () => {
      const dir = tmpDir()
      const file = path.join(dir, 'results.json')
      writeRunSummary(file, { all: 10, pass: 8, duration: '1.00s', totalDuration: '1.50s' })
      const lines = captureLog(() => summary(file))
      fs.rmSync(dir, { recursive: true, force: true })
      return lines.join('\n')
    },
    expect: (v: string) =>
      v.includes(`Total time (including discovery): 1.50s`) &&
      v.includes(`Ran 10 tests in 1.00s. Passed 8/10 ${printPercent(80)}%`) &&
      v.indexOf('Total time') < v.indexOf('Ran 10 tests'),
    info: 'summary() prints total time then the Ran line from the results file',
  },
  {
    fn: () => {
      const lines = captureLog(() =>
        summary(path.join(os.tmpdir(), 'magic-test-summary-missing.json')),
      )
      return lines.length
    },
    expect: 0,
    info: 'summary() no-ops when the results file is missing',
  },
] satisfies Test[]
