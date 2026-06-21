import {
  testUsesFixedPorts,
  testUsesSharedFiles,
  testImportsMutableModuleState,
} from '../../src/lib/mutableStateCheck.js'
import fs from '@magic/fs'
import type { TestCase, TestObject, WrappedTest } from '../../src/types.js'

// Type for globalThis with index signature
type GlobalAny = Record<string, unknown> & typeof globalThis

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
          void fs.readFile('unique.json')
        },
      }),
    expect: false,
    info: 'unique file accessed once returns false',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          void fs.readFile('shared.json')
        },
        afterAll: () => {
          void fs.readFile('shared.json')
        },
      }),
    expect: true,
    info: 'same file accessed in beforeAll and afterAll',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          void fs.writeFile('shared.json', 'data')
        },
      }),
    expect: false,
    info: 'writeFile alone returns false (no prior access)',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          void (globalThis as GlobalAny).tempFile
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
        } as TestObject,
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
        } as TestObject,
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
            const state: Record<string, number> = {}
            state.count = 5
          },
        } as TestObject,
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
            const obj: Record<string, unknown> = {}
            delete obj.prop
          },
        } as TestObject,
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
    fn: () => testImportsMutableModuleState([] as WrappedTest[], '/file.ts'),
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
              void fs.writeFile('a.txt', '')
            },
            after: () => {
              void fs.writeFile('a.txt', '')
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
          const _config = { port: 8080 }
        },
      }),
    expect: true,
    info: 'detects port in config object literal',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        beforeAll: () => {
          void ((globalThis as GlobalAny).apiPort = 3000)
        },
      }),
    expect: true,
    info: 'detects globalThis port assignment',
  },

  // Additional patterns for globalThis
  {
    fn: () =>
      testUsesFixedPorts({
        beforeAll: () => {
          void ((globalThis as GlobalAny).appPort = 3000)
        },
      }),
    expect: true,
    info: 'detects globalThis.appPort pattern',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        beforeAll: () => {
          void ((globalThis as GlobalAny).somePortValue = 8080)
        },
      }),
    expect: true,
    info: 'detects globalThis.somethingPort pattern',
  },

  // Additional fs methods
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          void fs.stat('shared.json')
        },
        afterAll: () => {
          void fs.unlink('shared.json')
        },
      }),
    expect: true,
    info: 'detects shared file between stat and unlink',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          void fs.readFile('shared.json')
        },
        afterAll: () => {
          void fs.writeFile('shared.json', 'data')
        },
      }),
    expect: true,
    info: 'detects shared file between read and write',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          void fs.unlink('shared.json')
        },
      }),
    expect: false,
    info: 'fs.unlink alone returns false',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          void fs.appendFile('shared.json', 'data')
        },
      }),
    expect: false,
    info: 'fs.appendFile alone returns false',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          void fs.readFile('a.txt')
        },
        afterAll: () => {
          void fs.readFile('b.txt')
        },
      }),
    expect: false,
    info: 'different files in hooks returns false',
  },
  // GlobalThis file patterns should be ignored
  {
    fn: () =>
      testUsesSharedFiles({
        beforeAll: () => {
          void ((globalThis as GlobalAny).uploadFile = 'data.json')
        },
      }),
    expect: false,
    info: 'testUsesSharedFiles ignores globalThis.uploadFile pattern',
  },
  // testImportsMutableModuleState with .mjs file
  {
    fn: () => testImportsMutableModuleState({}, '/nonexistent/file.mjs'),
    expect: false,
    info: 'testImportsMutableModuleState with .mjs file returns false',
  },
  // Nested object without tests property
  {
    fn: () =>
      testUsesFixedPorts({
        tests: {
          name: 'group',
        },
      }),
    expect: false,
    info: 'testUsesFixedPorts handles object without tests property',
  },
] satisfies TestCase[]
