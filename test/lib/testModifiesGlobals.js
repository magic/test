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

const { fn, expect } = globalThis

export default [
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          globalThis.foo = 'bar'
        },
        fn: () => true,
      }),
    expect: true,
    info: 'detects globalThis.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          globalThis['key'] = 'value'
        },
        fn: () => true,
      }),
    expect: true,
    info: 'detects globalThis[key] = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        after: () => {
          globalThis.foo = 'bar'
        },
        fn: () => true,
      }),
    expect: true,
    info: 'detects global modification in after hook',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          delete globalThis.foo
        },
        fn: () => true,
      }),
    expect: true,
    info: 'detects delete globalThis.x',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          window.document = {}
        },
        fn: () => true,
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
        fn: () => true,
      }),
    expect: true,
    info: 'detects process.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          global.foo = 'bar'
        },
        fn: () => true,
      }),
    expect: true,
    info: 'detects global.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          self.worker = {}
        },
        fn: () => true,
      }),
    expect: true,
    info: 'detects self.x = value',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const local = {}
          local.foo = 'bar'
        },
        fn: () => true,
      }),
    expect: false,
    info: 'ignores local variable modification',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const g = getGlobal()
          g.foo = 'bar'
        },
        fn: () => true,
      }),
    expect: false,
    info: 'ignores indirect global access',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          const x = globalThis.foo
        },
        fn: () => true,
      }),
    expect: false,
    info: 'ignores reading from globalThis (no modification)',
  },
  {
    fn: () =>
      suiteModifiesGlobals([
        { fn: () => true },
        {
          before: () => {
            globalThis.x = 1
          },
          fn: () => true,
        },
      ]),
    expect: true,
    info: 'suiteModifiesGlobals returns true if any test modifies globals',
  },
  {
    fn: () =>
      suiteModifiesGlobals([
        { fn: () => true },
        {
          before: () => {
            const x = 1
          },
          fn: () => true,
        },
      ]),
    expect: false,
    info: 'suiteModifiesGlobals returns false if no test modifies globals',
  },
  {
    fn: () =>
      suiteBeforeAllModifiesGlobals({
        beforeAll: () => {
          globalThis.test = true
        },
        tests: [{ fn: () => true }],
      }),
    expect: true,
    info: 'detects global modification in beforeAll',
  },
  {
    fn: () =>
      suiteBeforeAllModifiesGlobals({
        beforeAll: () => {
          const x = 1
        },
        tests: [{ fn: () => true }],
      }),
    expect: false,
    info: 'ignores non-global modification in beforeAll',
  },
  {
    fn: () =>
      suiteAfterAllModifiesGlobals({
        afterAll: () => {
          globalThis.test = true
        },
        tests: [{ fn: () => true }],
      }),
    expect: true,
    info: 'detects global modification in afterAll',
  },
  {
    fn: () =>
      suiteAfterAllModifiesGlobals({
        afterAll: () => {
          const x = 1
        },
        tests: [{ fn: () => true }],
      }),
    expect: false,
    info: 'ignores non-global modification in afterAll',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          before: () => {
            utils.formatDate(new Date())
          },
          fn: () => true,
        },
        'test/lib/tryCatch.js',
      ),
    expect: false,
    info: 'ignores import method call (no mutation)',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          before: () => {
            const x = is.fn(() => {})
          },
          fn: () => true,
        },
        'test/lib/cleanError.js',
      ),
    expect: false,
    info: 'ignores import function usage (no mutation)',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          beforeAll: () => {
            db.connect()
          },
          tests: [{ fn: () => true }],
        },
        'test/lib/errors.js',
      ),
    expect: false,
    info: 'ignores method call in beforeAll (no mutation)',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          fn: () => true,
        },
        'nonexistent/file.js',
      ),
    expect: false,
    info: 'returns false when file cannot be read',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          before: () => {
            utils.formatDate(new Date())
          },
          fn: () => true,
        },
        'test/lib/tryCatch.js',
      ),
    expect: false,
    info: 'ignores import method call (no mutation)',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          before: () => {
            const x = is.fn(() => {})
          },
          fn: () => true,
        },
        'test/lib/cleanError.js',
      ),
    expect: false,
    info: 'ignores import function usage (no mutation)',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          beforeAll: () => {
            db.connect()
          },
          tests: [{ fn: () => true }],
        },
        'test/lib/errors.js',
      ),
    expect: false,
    info: 'ignores method call in beforeAll (no mutation)',
  },
  {
    fn: () =>
      testImportsMutableModuleState(
        {
          fn: () => true,
        },
        'nonexistent/file.js',
      ),
    expect: false,
    info: 'returns false when file cannot be read',
  },
  // testUsesFixedPorts
  {
    fn: () =>
      testUsesFixedPorts({
        before: () => {
          server.listen(3000)
        },
        fn: () => true,
      }),
    expect: true,
    info: 'detects fixed port in before (.listen(3000))',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        before: () => {
          server.listen(0)
        },
        fn: () => true,
      }),
    expect: false,
    info: 'ignores dynamic port 0',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        before: () => {
          fetch('http://localhost:8080/api')
        },
        fn: () => true,
      }),
    expect: true,
    info: 'detects fixed port in fetch URL',
  },
  {
    fn: () =>
      testUsesFixedPorts({
        before: () => {
          const x = doSomething()
        },
        fn: () => true,
      }),
    expect: false,
    info: 'returns false when no port usage',
  },
  // testUsesSharedFiles
  {
    fn: () =>
      testUsesSharedFiles({
        before: () => {
          fs.readFileSync('config.json')
        },
        fn: () => true,
      }),
    expect: false,
    info: 'detects single file access (no conflict)',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        before: () => {
          fs.readFileSync('config.json')
        },
        fn: () => {
          fs.readFileSync('config.json')
        },
      }),
    expect: true,
    info: 'detects file conflict (same file accessed twice)',
  },
  {
    fn: () =>
      testUsesSharedFiles({
        fn: () => true,
      }),
    expect: false,
    info: 'returns false when no file usage',
  },
]
