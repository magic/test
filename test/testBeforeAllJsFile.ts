import is from '@magic/types'
import log from '@magic/log'

export default {
  beforeAll: () => {
    const g = globalThis as any
    g.beforeAll = 'beforeAll'
    g.testing = true

    return () => {
      g.testing = 'afterAll'
    }
  },
  afterAll: () => {
    const g = globalThis as any
    if (g.testing !== 'afterAll') {
      log.error(`AfterAll globalThis.testing not matching, is "${g.testing}" expected: 'afterAll'`)
    }
  },
  tests: [
    {
      fn: () => (globalThis as any).testing,
      expect: true,
      info: 'BeforeAll handler sets global true',
    },
    {
      fn: () => (globalThis as any).logs,
      expect: undefined,
      info: 'Undefined globals are undefined and not true',
    },
    {
      fn: () => (globalThis as any).beforeAllJS,
      expect: true,
      info: 'test/beforeAll.js file gets executed before other tests.',
    },
    {
      fn: () => (globalThis as any).beforeAllTS,
      expect: true,
      info: 'test/beforeAll.ts file gets executed before other tests.',
    },
    {
      fn: () => (globalThis as any).testsBeforeAllTS,
      expect: is.object,
      info: 'test/beforeAll.mjs file gets executed before other tests.',
    },
    {
      fn: () => (globalThis as any).beforeAllMJS,
      expect: true,
      info: 'test/beforeAll.mjs file gets executed before other tests.',
    },
  ],
}
