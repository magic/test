import is from '@magic/types'
import log from '@magic/log'

export default {
  beforeAll: () => {
    globalThis.beforeAll = 'beforeAll'
    globalThis.testing = true

    return () => {
      globalThis.testing = 'afterAll'
    }
  },
  afterAll: () => {
    if (globalThis.testing !== 'afterAll') {
      log.error(
        `AfterAll globalThis.testing not matching, is "${globalThis.testing}" expected: 'afterAll'`,
      )
    }
  },
  tests: [
    {
      fn: () => globalThis.testing,
      expect: true,
      info: 'BeforeAll handler sets global true',
    },
    {
      fn: () => globalThis.logs,
      expect: undefined,
      info: 'Undefined globals are undefined and not true',
    },
    {
      fn: () => globalThis.beforeAllTS,
      expect: true,
      info: 'test/beforeAll.ts file gets executed before other tests.',
    },
    {
      fn: () => globalThis.testsBeforeAllTS,
      expect: is.object,
      info: 'test/beforeAll.mjs file gets executed before other tests.',
    },
    {
      fn: () => globalThis.beforeAllMJS,
      expect: true,
      info: 'test/beforeAll.mjs file gets executed before other tests.',
    },
    {
      fn: () => globalThis.beforeallJS,
      expect: true,
      info: 'test/beforeall.js file gets executed before other tests.',
    },
    {
      fn: () => globalThis.beforeAllMJS,
      expect: true,
      info: 'test/beforeAll.mjs file gets executed before other tests.',
    },
    {
      fn: () => globalThis.beforeallJS,
      expect: true,
      info: 'test/beforeall.js file gets executed before other tests.',
    },
  ],
}
