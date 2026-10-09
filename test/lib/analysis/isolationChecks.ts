import path from 'node:path'
import {
  testUsesFixedPorts,
  testUsesSharedFiles,
  testImportsMutableModuleState,
} from '#lib/analysis/isolationChecks.js'
import type { TestCase } from '#src/types.js'

const CWD = process.cwd()

const tests: TestCase[] = [
  // --- testUsesFixedPorts ---
  {
    fn: () => testUsesFixedPorts([{ fn: () => {} }]),
    expect: false,
    info: 'no hooks means no fixed ports',
  },
  {
    fn: () => {
      const before = () => {
        // @ts-expect-error test string
        return server.listen(3000)
      }
      return testUsesFixedPorts([{ fn: () => {}, before }])
    },
    expect: true,
    info: 'before hook with .listen(3000) is a fixed port',
  },
  {
    fn: () => {
      const before = () => {
        // @ts-expect-error test string
        return server.listen(0)
      }
      return testUsesFixedPorts([{ fn: () => {}, before }])
    },
    expect: false,
    info: 'before hook with .listen(0) is NOT a fixed port',
  },
  {
    fn: () => {
      const beforeAll = () => {
        // @ts-expect-error test string
        return server.listen(8080)
      }
      return testUsesFixedPorts({ beforeAll, fn: () => {} })
    },
    expect: true,
    info: 'beforeAll hook with .listen(8080) is a fixed port',
  },
  {
    fn: () => {
      const afterAll = () => {
        return close()
      }
      return testUsesFixedPorts({ afterAll, fn: () => {} })
    },
    expect: false,
    info: 'afterAll hook without ports is not a fixed port',
  },
  {
    fn: () => {
      const before = () => {
        // @ts-expect-error test string
        return createServer({ port: 4000 })
      }
      return testUsesFixedPorts([{ fn: () => {}, before }])
    },
    expect: true,
    info: 'before hook with { port: 4000 } is a fixed port',
  },

  // --- testUsesSharedFiles ---
  {
    fn: () => testUsesSharedFiles([{ fn: () => {} }]),
    expect: false,
    info: 'no file usage means no shared files',
  },
  {
    fn: () => {
      const before1 = () => {
        // @ts-expect-error test string
        return fs.readFile('/tmp/shared.txt')
      }
      const before2 = () => {
        // @ts-expect-error test string
        return fs.writeFile('/tmp/shared.txt', 'x')
      }
      return testUsesSharedFiles([
        { fn: () => {}, before: before1 },
        { fn: () => {}, before: before2 },
      ])
    },
    expect: true,
    info: 'two tests touching same file is shared',
  },
  {
    fn: () => {
      const before = () => {
        // @ts-expect-error test string
        return fs.readFile('/tmp/unique.txt')
      }
      return testUsesSharedFiles([{ fn: () => {}, before }])
    },
    expect: false,
    info: 'single test touching a file is not shared',
  },
  {
    fn: () => {
      const fn1 = () => {
        // @ts-expect-error test string
        return fs.readFile('/tmp/a.txt')
      }
      const fn2 = () => {
        // @ts-expect-error test string
        return fs.readFile('/tmp/b.txt')
      }
      return testUsesSharedFiles([{ fn: fn1 }, { fn: fn2 }])
    },
    expect: false,
    info: 'tests touching different files are not shared',
  },

  // --- testImportsMutableModuleState ---
  {
    fn: async () => {
      // nonexistent file returns false
      return await testImportsMutableModuleState(
        [{ fn: () => {}, before: () => {} }],
        path.join(CWD, 'does-not-exist-12345.ts'),
      )
    },
    expect: false,
    info: 'testImportsMutableModuleState with missing file returns false',
  },
  {
    fn: async () => {
      // a test file with no imports and hooks -> no mutation
      const specPath = path.join(CWD, 'test', 'tstest.ts')
      return await testImportsMutableModuleState([{ fn: () => {}, before: () => {} }], specPath)
    },
    expect: false,
    info: 'testImportsMutableModuleState with no import mutation returns false',
  },
]

export default tests
