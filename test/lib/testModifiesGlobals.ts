import {
  testModifiesGlobals,
  suiteModifiesGlobals,
  suiteBeforeAllModifiesGlobals,
  suiteAfterAllModifiesGlobals,
} from '../../src/lib/globalCheck.js'
import {
  testImportsMutableModuleState,
  testUsesFixedPorts,
  testUsesSharedFiles,
} from '../../src/lib/mutableStateCheck.js'

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        before: () => ((globalThis as any).window = { document: {} }),
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
        before: () => true,
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
      suiteBeforeAllModifiesGlobals({
        beforeAll: () => {
          ;(globalThis as Record<string, unknown>).beforeAll = 'test'
        },
      }),
    expect: true,
    info: 'detects global modification in beforeAll',
  },
  {
    fn: () =>
      suiteBeforeAllModifiesGlobals({
        beforeAll: () => {},
      }),
    expect: false,
    info: 'ignores non-global modification in beforeAll',
  },
  {
    fn: () =>
      suiteAfterAllModifiesGlobals({
        afterAll: () => {
          ;(globalThis as Record<string, unknown>).afterAll = 'test'
        },
      }),
    expect: true,
    info: 'detects global modification in afterAll',
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
]
