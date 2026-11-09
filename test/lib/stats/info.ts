import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { info } from '#lib/stats/info.js'
import { has } from '#lib/has.js'
import { createStore } from '#lib/store.js'
import { RESULTS_FILE_ENV, readRunSummary } from '#lib/stats/resultsFile.js'

import type { Test, TestResults } from '#src/types.js'
import type { RunSummary } from '#lib/stats/resultsFile.js'

export default [
  // info with no results should return true
  {
    fn: () => {
      const store = createStore()
      return info([], store)
    },
    expect: true,
    info: 'info with no results returns true',
  },
  // info with no suites should return true
  {
    fn: () => {
      const store = createStore()
      store.set({ results: {} })
      return info([], store)
    },
    expect: true,
    info: 'info with empty suites array returns true',
  },
  // info with empty test results should not crash
  {
    fn: () => {
      const store = createStore()
      store.set({ results: { test1: { all: 1, pass: 1 } } })
      return info(
        [{ name: 'test1', parent: '', pkg: '', pass: 0, fail: 0, all: 0, tests: [] }],
        store,
      )
    },
    expect: true,
    info: 'info with test results returns true',
  },
  // info sets default values when results missing
  {
    before: () => {
      const oldLog = console.log
      console.log = () => {}
      return () => {
        console.log = oldLog
      }
    },
    fn: () => {
      const store = createStore()
      store.set({ results: { test1: { all: 10, pass: 8 } } })
      info([{ name: 'test1', parent: '', pkg: '', pass: 0, fail: 0, all: 0, tests: [] }], store)
      const results = store.get<TestResults>('results')
      return { all: results?.test1?.all, pass: results?.test1?.pass }
    },
    expect: has.properties({ all: 10, pass: 8 }),
    info: 'info can read results from store',
  },
  // info writes the run summary file (and suppresses the printed summary)
  // when MAGIC_TEST_RESULTS_FILE is set — the parent (t.ts) prints the
  // summary after the coverage report
  {
    fn: () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'magic-test-info-'))
      const file = path.join(dir, 'results.json')
      const oldEnv = process.env[RESULTS_FILE_ENV]
      process.env[RESULTS_FILE_ENV] = file
      const oldLog = console.log
      const lines: string[] = []
      console.log = ((...args: unknown[]) => {
        lines.push(args.map(String).join(' '))
      }) as typeof console.log
      try {
        const store = createStore()
        store.set({
          results: { __PACKAGE_ROOT__: { all: 10, pass: 8 } },
          startTime: [1, 0],
        })
        info([], store)
      } finally {
        console.log = oldLog
        if (oldEnv === undefined) {
          delete process.env[RESULTS_FILE_ENV]
        } else {
          process.env[RESULTS_FILE_ENV] = oldEnv
        }
      }
      const written = readRunSummary(file)
      fs.rmSync(dir, { recursive: true, force: true })
      return {
        written,
        printedSummary: lines.some(l => l.includes('Ran ')),
      }
    },
    expect: (v: { written: RunSummary | null; printedSummary: boolean }) =>
      v.written !== null &&
      v.written.all === 10 &&
      v.written.pass === 8 &&
      v.written.duration !== '' &&
      v.printedSummary === false,
    info: 'info writes the results file and suppresses the printed summary when MAGIC_TEST_RESULTS_FILE is set',
  },
  // info prints the Ran summary as before when MAGIC_TEST_RESULTS_FILE is unset
  {
    fn: () => {
      const oldEnv = process.env[RESULTS_FILE_ENV]
      delete process.env[RESULTS_FILE_ENV]
      const oldLog = console.log
      const lines: string[] = []
      console.log = ((...args: unknown[]) => {
        lines.push(args.map(String).join(' '))
      }) as typeof console.log
      try {
        const store = createStore()
        store.set({
          results: { __PACKAGE_ROOT__: { all: 10, pass: 8 } },
          startTime: [1, 0],
        })
        info([], store)
      } finally {
        console.log = oldLog
        if (oldEnv !== undefined) {
          process.env[RESULTS_FILE_ENV] = oldEnv
        }
      }
      return lines.some(l => l.includes('Ran 10 tests in'))
    },
    expect: true,
    info: 'info prints the Ran summary when MAGIC_TEST_RESULTS_FILE is not set',
  },
] satisfies Test[]
