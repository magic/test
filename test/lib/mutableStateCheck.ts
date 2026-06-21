import {
  testUsesFixedPorts,
  testUsesSharedFiles,
  testImportsMutableModuleState,
} from '../../src/lib/mutableStateCheck.js'
import type { TestCase } from '../../src/types.js'

export default [
  // testUsesFixedPorts
  {
    fn: () => testUsesFixedPorts({}),
    expect: false,
    info: 'empty object returns false',
  },
  {
    fn: () => testUsesFixedPorts({ beforeAll: () => {} }),
    expect: false,
    info: 'empty beforeAll returns false',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        beforeAll: () => {
          const s = {} as { listen: (port: number) => void }
          s.listen(3000)
        },
      }),
    expect: true,
    info: 'detects fixed port in .listen(3000)',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        beforeAll: () => {
          const s = {} as { listen: (port: number) => void }
          s.listen(0)
        },
      }),
    expect: false,
    info: 'listen(0) is dynamic, not fixed',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        beforeAll: () => {
          fetch('http://localhost:8080/api')
        },
      }),
    expect: true,
    info: 'detects fixed port in fetch localhost:8080',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        afterAll: () => {
          const s = {} as { listen: (port: number) => void }
          s.listen(9000)
        },
      }),
    expect: true,
    info: 'detects fixed port in afterAll',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        port: 5000,
      }),
    expect: false,
    info: 'object without function hooks returns false',
  },

  // testUsesSharedFiles
  {
    fn: () => testUsesSharedFiles({}),
    expect: false,
    info: 'empty object returns false for shared files',
  },
  {
    fn: () => testUsesSharedFiles({ beforeAll: () => {} }),
    expect: false,
    info: 'empty beforeAll returns false',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          fs.readFile('unique.json')
        },
      }),
    expect: false,
    info: 'unique file accessed once returns false',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          fs.readFile('shared.json')
        },
        afterAll: () => {
          fs.readFile('shared.json')
        },
      }),
    expect: true,
    info: 'same file accessed in beforeAll and afterAll',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          fs.writeFile('shared.json', 'data')
        },
      }),
    expect: false,
    info: 'writeFile alone returns false (no prior access)',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          globalThis.tempFile = 'temp.json'
        },
      }),
    expect: false,
    info: 'globalThis file access returns false (not shared)',
  },

  // testImportsMutableModuleState
  {
    fn: () => testImportsMutableModuleState({}, '/nonexistent/file.ts'),
    expect: false,
    info: 'nonexistent file returns false',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          beforeAll: () => {},
        },
        '/nonexistent/file.ts',
      ),
    expect: false,
    info: 'non-function hook returns false',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          beforeAll: () => {
            // no mutations
          },
        },
        '/nonexistent/file.ts',
      ),
    expect: false,
    info: 'no mutations returns false',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          beforeAll: () => {
            state.count = 5
          },
        },
        '/nonexistent/file.ts',
      ),
    expect: false,
    info: 'undefined state (file not found) returns false',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          afterAll: () => {
            delete obj.prop
          },
        },
        '/nonexistent/file.ts',
      ),
    expect: false,
    info: 'delete on undefined returns false',
  },

  // Array tests
  {
    fn: () => testUsesFixedPorts([]),
    expect: false,
    info: 'empty array returns false',
  },
  {
    fn: () => testUsesSharedFiles([]),
    expect: false,
    info: 'empty array for shared files returns false',
  },
  {
    fn: () => testImportsMutableModuleState([] as any, '/file.ts'),
    expect: false,
    info: 'empty array returns false for mutable state',
  },

  // Nested objects
  {
    fn: () =>
      testUsesFixedPorts({
        tests: [
          {
            name: 'test1',
            fn: () => {},
            before: () => {
              fetch('http://localhost:3001')
            },
          },
        ],
      }),
    expect: true,
    info: 'detects fixed port in nested test before hook',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        tests: [
          {
            name: 'test1',
            fn: () => {
              fs.writeFile('a.txt')
            },
            after: () => {
              fs.writeFile('a.txt')
            },
          },
        ],
      }),
    expect: true,
    info: 'detects shared file in nested test hooks',
  },

  // Port patterns
  {
    fn: () =>
      testUsesFixedPorts({
        beforeAll: () => {
          const config = { port: 8080 }
        },
      }),
    expect: true,
    info: 'detects port in config object literal',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        beforeAll: () => {
          globalThis.apiPort = 3000
        },
      }),
    expect: true,
    info: 'detects globalThis port assignment',
  },
] satisfies TestCase[]
