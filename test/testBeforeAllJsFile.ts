import log from '@magic/log'

export default {
  beforeAll: () => {
    const g = globalThis as Record<string, unknown>
    g.beforeAll = 'beforeAll'
    g.testing = true

    return () => {
      g.testing = 'afterAll'
    }
  },
  afterAll: () => {
    const g = globalThis as Record<string, unknown>
    if (g.testing !== 'afterAll') {
      log.error(`AfterAll globalThis.testing not matching, is "${g.testing}" expected: 'afterAll'`)
    }
  },
  tests: [
    {
      fn: () => (globalThis as Record<string, unknown>).testing,
      expect: true,
      info: 'BeforeAll handler sets global true',
    },
    {
      fn: () => (globalThis as Record<string, unknown>).logs,
      expect: undefined,
      info: 'Undefined globals are undefined and not true',
    },
    {
      fn: () => (globalThis as Record<string, unknown>).beforeAllTS,
      expect: true,
      info: 'test/beforeAll.ts file gets executed before other tests.',
    },
    {
      fn: () => (globalThis as Record<string, unknown>).beforeAllMJS,
      expect: true,
      info: 'test/beforeAll.mjs file gets executed before other tests.',
    },
    {
      fn: () => (globalThis as Record<string, unknown>).beforeAllMJS,
      expect: true,
      info: 'test/beforeAll.mjs file gets executed before other tests.',
    },
    {
      fn: () => (globalThis as Record<string, unknown>).beforeallJS,
      expect: true,
      info: 'test/beforeall.js file gets executed before other tests.',
    },
    {
      fn: () => (globalThis as Record<string, unknown>).beforeAllMJS,
      expect: true,
      info: 'test/beforeAll.mjs file gets executed before other tests.',
    },
    {
      fn: () => (globalThis as Record<string, unknown>).beforeallJS,
      expect: true,
      info: 'test/beforeall.js file gets executed before other tests.',
    },
  ],
}
