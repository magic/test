import * as test from '../src/index.mjs'
import is from '@magic/types'

export default [
  { fn: () => test.run, expect: is.fn },
  { fn: () => test.curry, expect: is.fn },
  { fn: () => test.is.array, expect: is.fn },
  { fn: () => test.env, expect: is.obj },
  { fn: () => test.env.isNodeProd, expect: is.fn },
  { fn: () => test.env.isProd, expect: is.fn },
  { fn: () => test.env.isVerbose, expect: is.fn },
  { fn: () => test.log, expect: is.fn },
  { fn: () => test.log.error, expect: is.fn },
  { fn: () => test.log.log, expect: is.fn },
  { fn: () => test.log.warn, expect: is.fn },
  { fn: () => test.mock, expect: is.obj },
  { fn: () => test.promise, expect: is.fn },
  { fn: () => test.store, expect: is.obj },
  { fn: () => test.vals, expect: is.obj },
  { fn: () => test.version, expect: is.obj },
]
