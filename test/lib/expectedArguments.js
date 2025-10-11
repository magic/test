import { is } from '../../src/index.js'

import { expectedArguments } from '../../src/lib/expectedArguments.js'

export default [
  { fn: () => expectedArguments(() => {}), expect: is.array },
  { fn: () => expectedArguments(() => {}), expect: is.empty },
  { fn: () => expectedArguments(_a => {}), expect: is.array },
  { fn: () => expectedArguments(_a => {}), expect: is.length.eq(1) },
  { fn: () => expectedArguments((_a, _b) => {}), expect: is.len.eq(2) },
  { fn: () => expectedArguments((_a, _b, _c) => {}), expect: is.len.eq(3) },
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
