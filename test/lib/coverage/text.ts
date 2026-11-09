import type { Test } from '@magic/test'
import { printTextReport } from '#lib/coverage/text.js'

import type { FileCoverage, Location } from '#lib/coverage/types.js'

const loc = (line: number): Location => ({
  start: { line, column: 0 },
  end: { line, column: 0 },
})

const fileA: FileCoverage = {
  path: '/proj/src/a.ts',
  statementMap: { '0': loc(1), '1': loc(2) },
  s: { '0': 1, '1': 0 },
  fnMap: { '0': { name: 'a', decl: loc(1), loc: loc(1), line: 1 } },
  f: { '0': 1 },
  branchMap: {},
  b: {},
}

const fileB: FileCoverage = {
  path: '/proj/src/lib/b.ts',
  statementMap: { '0': loc(1) },
  s: { '0': 1 },
  fnMap: { '0': { name: 'b', decl: loc(1), loc: loc(1), line: 1 } },
  f: { '0': 1 },
  branchMap: {},
  b: {},
}

const files = new Map<string, FileCoverage>([
  ['/proj/src/a.ts', fileA],
  ['/proj/src/lib/b.ts', fileB],
])

/**
 * Renders the report and captures its stdout output. The patch/capture/
 * restore is fully synchronous, so it is atomic with respect to the
 * test runner's parallel test execution.
 */
const render = (f: Map<string, FileCoverage>): string[] => {
  const realWrite = process.stdout.write
  let captured = ''
  process.stdout.write = ((chunk: string | Uint8Array) => {
    captured += String(chunk)
    return true
  }) as unknown as typeof process.stdout.write
  try {
    printTextReport(f, { color: false, maxCols: 100 })
  } finally {
    process.stdout.write = realWrite
  }
  return captured.split('\n')
}

export default [
  {
    fn: () => {
      const lines = render(files)
      // layout: [rule, header, rule, <data rows...>, rule, '']
      const data = lines.slice(3, -2)
      const allFilesRows = data.filter(l => l.startsWith('All files'))
      return {
        firstIsAllFiles: data[0]!.startsWith('All files'),
        lastIsAllFiles: data[data.length - 1]!.startsWith('All files'),
        allFilesRowCount: allFilesRows.length,
        rowCount: data.length,
      }
    },
    expect: { firstIsAllFiles: true, lastIsAllFiles: true, allFilesRowCount: 2, rowCount: 6 },
    info: 'coverage table shows the All files summary at the start and the end',
  },
  {
    fn: () => {
      const lines = render(files)
      const data = lines.slice(3, -2)
      return {
        headerOk: lines[1]!.includes('% Stmts') && lines[1]!.includes('Uncovered Line #s'),
        fileRows: data
          .filter(l => !l.startsWith('All files'))
          .map(l => l.trim())
          .sort(),
      }
    },
    expect: (v: { headerOk: boolean; fileRows: string[] }) =>
      v.headerOk &&
      v.fileRows.length === 4 &&
      v.fileRows.some(r => r.startsWith('a.ts')) &&
      v.fileRows.some(r => r.startsWith('b.ts')),
    info: 'coverage table header and per-file rows are intact',
  },
  {
    fn: () => {
      const lines = render(files)
      const data = lines.slice(3, -2)
      const first = data[0]!
      const last = data[data.length - 1]!
      return {
        // compare everything after the name column (first ' | ')
        metricsEqual:
          first.split(' | ').slice(1).join(' | ') === last.split(' | ').slice(1).join(' | '),
      }
    },
    expect: { metricsEqual: true },
    info: 'the repeated All files row has identical metrics',
  },
] satisfies Test[]
