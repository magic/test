import is from '@magic/types'

import expectedArguments from '../../src/lib/expectedArguments.mjs'

export default [
  { fn: () => expectedArguments(() => {}), expect: is.array },
  { fn: () => expectedArguments(() => {}), expect: is.empty },
  { fn: () => expectedArguments(a => {}), expect: is.array },
  { fn: () => expectedArguments(a => {}), expect: is.len.eq(1) },
  { fn: () => expectedArguments((a, b) => {}), expect: is.len.eq(2) },
  { fn: () => expectedArguments((a, b, c) => {}), expect: is.len.eq(3) },
  { fn: () => expectedArguments(), expect: is.array },
  { fn: () => expectedArguments(), expect: is.empty },
  { fn: () => expectedArguments(''), expect: is.array },
  { fn: () => expectedArguments(''), expect: is.empty },
  {
    fn: () => expectedArguments((a, b, c = 0) => {}),
    expect: is.len.eq(3),
    info: 'Also works with argument default values',
  },
  {
    fn: () => expectedArguments((a, b, ...c) => {}),
    expect: is.len.eq(3),
    info: 'Also works with spread arguments',
  },
  {
    fn: () => expectedArguments(function (a, b, c) {}),
    expect: is.len.eq(3),
  },
  {
    fn: () => expectedArguments(function () {}),
    expect: is.empty,
  },
]
