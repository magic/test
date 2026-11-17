import type { TestCase } from '#src/types.js'

import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import {
  testUsesFixedPorts,
  testUsesSharedFiles,
  testImportsMutableModuleState,
} from '#lib/analysis/isolationChecks.js'

const CWD = process.cwd()

// Write a temp test file, run the detector against it, always clean up
const withTempFile = async (
  name: string,
  content: string,
  fn: (filePath: string) => Promise<unknown>,
): Promise<unknown> => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'iso-check-'))
  const filePath = path.join(dir, name)
  await writeFile(filePath, content, 'utf8')
  try {
    return await fn(filePath)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

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
  {
    fn: async () =>
      withTempFile(
        'no-imports.ts',
        `export default [{ fn: () => 1, expect: 1, before: () => {} }]
`,
        fp => testImportsMutableModuleState([{ fn: () => {}, before: () => {} }], fp),
      ),
    expect: false,
    info: 'a real file with no imports cannot mutate module state',
  },
  {
    fn: async () =>
      withTempFile(
        'read-only-import.ts',
        `import counter from './target.js'
export default [{ fn: () => counter.value, expect: 0 }]
`,
        fp => testImportsMutableModuleState([{ fn: () => {}, before: () => {} }], fp),
      ),
    expect: false,
    info: 'importing a module without mutating it is not flagged',
  },
  {
    fn: async () =>
      withTempFile(
        'mutates-import.ts',
        `import counter from './target.js'
export default [{
  before: () => {
    counter.value = 1
  },
  fn: () => 1,
  expect: 1,
}]
`,
        fp =>
          testImportsMutableModuleState(
            [
              {
                fn: () => {},
                before: () => {
                  // @ts-expect-error test string
                  counter.value = 1
                },
              },
            ],
            fp,
          ),
      ),
    expect: true,
    info: 'a before hook assigning to imported module state is flagged',
  },
  {
    fn: async () =>
      withTempFile(
        'mutates-named-import.ts',
        `import { counter } from './target.js'
export default [{
  after: () => {
    counter.hits++
  },
  fn: () => 1,
  expect: 1,
}]
`,
        fp =>
          testImportsMutableModuleState(
            [
              {
                fn: () => {},
                after: () => {
                  // @ts-expect-error test string
                  counter.hits++
                },
              },
            ],
            fp,
          ),
      ),
    expect: true,
    info: 'an after hook updating a named import is flagged',
  },
  {
    fn: async () =>
      // missing .ts file WITH a .js sibling: the .js fallback is read
      withTempFile(
        'sibling.ts.js',
        `import counter from './target.js'
export default [{
  before: () => {
    counter.value = 2
  },
  fn: () => 1,
  expect: 1,
}]
`,
        fp =>
          testImportsMutableModuleState(
            [
              {
                fn: () => {},
                before: () => {
                  // @ts-expect-error test string
                  counter.value = 2
                },
              },
            ],
            fp.slice(0, -3), // point at the missing .ts path
          ),
      ),
    expect: true,
    info: 'missing .ts with a .js sibling reads the .js fallback',
  },
]

export default tests
