import is from '@magic/types'
import {
  testModifiesGlobals,
  suiteModifiesGlobals,
  suiteBeforeAllModifiesGlobals,
  suiteAfterAllModifiesGlobals,
  testImportsMutableModuleState,
  testUsesFixedPorts,
  testUsesSharedFiles,
} from '../../src/lib/testModifiesGlobals.js'

const { fn, expect } = globalThis as any

export default [
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as any).foo = 'bar'
        },
      } as any),
    expect: true,
    info: 'detects globalThis.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as any)['key'] = 'value'
        },
      } as any),
    expect: true,
    info: 'detects globalThis[key] = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        after: () => {
          ;(globalThis as any).foo = 'bar'
        },
      } as any),
    expect: true,
    info: 'detects global modification in after hook',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          delete (globalThis as any).foo
        },
      } as any),
    expect: true,
    info: 'detects delete globalThis.x',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as any).window = { document: {} }
        },
      } as any),
    expect: true,
    info: 'detects window.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          process.env.NODE_ENV = 'test'
        },
      } as any),
    expect: true,
    info: 'detects process.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as any).global = { foo: 'bar' }
        },
      } as any),
    expect: true,
    info: 'detects global.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as any).self = { worker: {} }
        },
      } as any),
    expect: true,
    info: 'detects self.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          ;(globalThis as any).newGlobal = 'test'
        },
      } as any),
    expect: true,
    info: 'detects new globalThis assignments',
  },
  {
    fn: () =>
      testModifiesGlobals({
        fn: () => true,
      } as any),
    expect: false,
    info: 'returns false when no global modification',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const local = 'test'
        },
      } as any),
    expect: false,
    info: 'ignores local variable assignments',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const obj: any = {}
          obj.prop = 'value'
        },
      } as any),
    expect: false,
    info: 'ignores object property assignment on local objects',
  },
  {
    fn: () =>
      suiteModifiesGlobals({
        before: () => {
          ;(globalThis as any).suiteGlobal = 'test'
        },
        tests: [],
      } as any),
    expect: true,
    info: 'suiteModifiesGlobals detects beforeAll',
  },
  {
    fn: () =>
      suiteModifiesGlobals({
        after: () => {
          ;(globalThis as any).suiteGlobal = 'test'
        },
        tests: [],
      } as any),
    expect: true,
    info: 'suiteModifiesGlobals detects afterAll',
  },
  {
    fn: () => suiteModifiesGlobals({ tests: [] } as any),
    expect: false,
    info: 'suiteModifiesGlobals returns false for clean suite',
  },
  {
    fn: () =>
      suiteBeforeAllModifiesGlobals({
        beforeAll: () => {
          ;(globalThis as any).beforeAll = 'test'
        },
      } as any),
    expect: true,
    info: 'detects global modification in beforeAll',
  },
  {
    fn: () =>
      suiteBeforeAllModifiesGlobals({
        beforeAll: () => {},
      } as any),
    expect: false,
    info: 'ignores non-global modification in beforeAll',
  },
  {
    fn: () =>
      suiteAfterAllModifiesGlobals({
        afterAll: () => {
          ;(globalThis as any).afterAll = 'test'
        },
      } as any),
    expect: true,
    info: 'detects global modification in afterAll',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          imports: [{ specifier: 'fs', namespace: false }],
        } as any,
        'test.js',
      ),
    expect: true,
    info: 'detects fs imports',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          imports: [{ specifier: 'node:fs', namespace: false }],
        } as any,
        'test.js',
      ),
    expect: true,
    info: 'detects node:fs imports',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          imports: [],
        } as any,
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
      } as any),
    expect: true,
    info: 'detects fixed port usage in http',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        imports: [{ specifier: 'node:fs', namespace: false }],
      } as any),
    expect: true,
    info: 'detects fs imports for shared files check',
  },
]
