import is from '@magic/types'

import deepMerge from '../../src/lib/deepMerge'

const deep1 = {
  t: {
    d: 'test',
    d3: ['1'],
  },
}

const deep2 = {
  t: {
    d2: 'test',
    d3: ['2'],
  },
}

export default [
  { fn: () => deepMerge({ t: 't' }, { t2: 't' }), expect: is.obj },
  { fn: () => deepMerge({ t: 't' }, { t2: 't' }), expect: is.len.eq(2) },
  { fn: () => deepMerge({ t: 't' }, { t: 't' }), expect: is.len.eq(1) },
  { fn: () => deepMerge({ t: 't' }, /reg/), expect: is.len.eq(1) },
  { fn: () => deepMerge({ t: 't' }, /reg/), expect: is.len.eq(1) },
  { fn: () => deepMerge(/reg/, { t: 't' }), expect: is.len.eq(1) },
  { fn: () => deepMerge('string', { t: 't' }), expect: is.len.eq(2) },
  { fn: () => deepMerge(['test'], ['test']), expect: is.array },
  { fn: () => deepMerge(['test'], ['test']), expect: is.len.eq(2) },
  { fn: () => deepMerge(['test'], ['tes2']), expect: is.array },
  { fn: () => deepMerge(['test'], ['test2']), expect: is.len.eq(2) },
  { fn: () => deepMerge(['test'], 'test2'), expect: is.len.eq(2) },
  { fn: () => deepMerge(['test'], 'test2'), expect: ([t]) => t === 'test' },
  { fn: () => deepMerge(['test'], 'test2'), expect: ([_, t]) => t === 'test2' },
  { fn: () => deepMerge(['test'], { t: 't' }), expect: ([_, t]) => is.obj(t) },
  { fn: () => deepMerge({ t: 't' }, ['test']), expect: ([t]) => is.obj(t) },
  { fn: () => deepMerge(/reg/, ['test']), expect: is.array },
  { fn: () => deepMerge(/reg/, ['test']), expect: ([t]) => is.regex(t) },
  { fn: () => deepMerge(/reg/, ['test']), expect: ([_, t]) => is.string(t) },
  { fn: () => deepMerge(deep1, deep2), expect: is.len.eq(1) },
  { fn: () => deepMerge(deep1, deep2), expect: ({ t }) => is.len.eq(3)(t) },
  { fn: () => deepMerge(deep1, deep2), expect: ({ t }) => is.string(t.d) },
  { fn: () => deepMerge(deep1, deep2), expect: ({ t }) => is.string(t.d2) },
  { fn: () => deepMerge(deep1, deep2), expect: ({ t }) => is.array(t.d3) },
  { fn: () => deepMerge(deep1, deep2), expect: ({ t }) => is.len.eq(2)(t.d3) },
  { fn: () => deepMerge(deep1, deep2), expect: ({ t }) => t.d3[0] === '1' },
  { fn: () => deepMerge(deep1, deep2), expect: ({ t }) => t.d3[1] === '2' },
]
