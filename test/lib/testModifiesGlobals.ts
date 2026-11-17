import type { TestCase } from '#src/types.js'

import { testModifiesGlobals, suiteModifiesGlobals } from '#lib/globalCheck.js'
import {
  testImportsMutableModuleState,
  testUsesFixedPorts,
  testUsesSharedFiles,
} from '#lib/mutableStateCheck.js'

export default [
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as Record<string, unknown>).foo = 'bar'
        },
      }),
    expect: true,
    info: 'detects globalThis.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as Record<string, unknown>)['key'] = 'value'
        },
      }),
    expect: true,
    info: 'detects globalThis[key] = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        after: () => {
          ;(globalThis as Record<string, unknown>).foo = 'bar'
        },
      }),
    expect: true,
    info: 'detects global modification in after hook',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          delete (globalThis as Record<string, unknown>).foo
        },
      }),
    expect: true,
    info: 'detects delete globalThis.x',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const g = globalThis as Record<string, unknown>
          g.window = { document: {} }
        },
      }),
    expect: true,
    info: 'detects window.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          process.env.NODE_ENV = 'test'
        },
      }),
    expect: true,
    info: 'detects process.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const g = globalThis as unknown as { global: Record<string, unknown> }
          g.global = { foo: 'bar' }
        },
      }),
    expect: true,
    info: 'detects global.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const s = globalThis as unknown as { self: Record<string, unknown> }
          s.self = { worker: {} }
        },
      }),
    expect: true,
    info: 'detects self.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as Record<string, unknown>).newGlobal = 'test'
        },
      }),
    expect: true,
    info: 'detects new globalThis assignments',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => undefined,
      }),
    expect: false,
    info: 'returns false when no global modification',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const _local = 'test'
        },
      }),
    expect: false,
    info: 'ignores local variable assignments',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const _obj = { prop: 'value' }

          return () => {}
        },
      }),
    expect: false,
    info: 'ignores object property assignment on local objects',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as Record<string, unknown>).suiteGlobal = 'test'
        },
      }),
    expect: true,
    info: 'detects globalThis assignment (duplicate coverage via testModifiesGlobals)',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          localStorage.setItem('k', 'v')
        },
      }),
    expect: true,
    info: 'detects localStorage modification',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const msg = 'the globalThis object and process.env are shared state'
          void msg
        },
      }),
    expect: false,
    info: 'ignores globals mentioned inside string literals',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const msg = `globalThis.window and process.env in a template`
          void msg
        },
      }),
    expect: false,
    info: 'ignores globals mentioned inside template literals',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          // globalThis.foo = 'bar' (only in a comment)
          const _local = 'test'
        },
      }),
    expect: false,
    info: 'ignores globals mentioned only in comments',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const globalStartTime = Date.now()
          const windowWidth = 800
          const selfContained = true
          void globalStartTime
          void windowWidth
          void selfContained
        },
      }),
    expect: false,
    info: 'ignores identifiers that merely contain global names (globalStartTime, windowWidth, selfContained)',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const subprocess = { run: () => 1 }
          subprocess.run()
        },
      }),
    expect: false,
    info: 'ignores subprocess. (word boundary before process.)',
  },
  {
    fn: () =>
      suiteModifiesGlobals({
        beforeAll: () => {
          ;(globalThis as Record<string, unknown>).suiteGlobal = 'test'
        },
        tests: [],
      }),
    expect: true,
    info: 'suiteModifiesGlobals detects beforeAll',
  },
  {
    fn: () =>
      suiteModifiesGlobals({
        afterAll: () => {
          ;(globalThis as Record<string, unknown>).suiteGlobal = 'test'
        },
        tests: [],
      }),
    expect: true,
    info: 'suiteModifiesGlobals detects afterAll',
  },
  {
    fn: () => suiteModifiesGlobals({ tests: [] }),
    expect: false,
    info: 'suiteModifiesGlobals returns false for clean suite',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          imports: [{ specifier: 'fs', namespace: false }],
        },
        'test.js',
      ),
    expect: false,
    info: 'detects fs imports',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          imports: [{ specifier: 'node:fs', namespace: false }],
        },
        'test.js',
      ),
    expect: false,
    info: 'detects node:fs imports',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          imports: [],
        },
        'test.js',
      ),
    expect: false,
    info: 'returns false for no imports',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        specifier: 'node:http',
        imports: [{ specifier: 'node:http', namespace: false }],
      }),
    expect: false,
    info: 'detects fixed port usage in http',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        imports: [{ specifier: 'node:fs', namespace: false }],
      }),
    expect: false,
    info: 'detects fs imports for shared files check',
  },
] satisfies TestCase[]
