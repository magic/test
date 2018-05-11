import is from '@magic/types'

import { cleanError } from '../../src/lib'

const error = new Error('testerror')

export default [
  { fn: () => cleanError(error), expect: is.array },
  { fn: () => cleanError(error), expect: is.len.eq(2) },
  {
    fn: () => cleanError(error),
    expect: ([e]) => e.indexOf('testerror') !== -1,
  },
  { fn: () => cleanError(error), expect: ([_, e]) => e.indexOf('at') === 0 },
]
