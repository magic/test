import { prepareTest } from '../../../src/run/lib/prepareTest.js'
import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: () => prepareTest({ name: 'test', pkg: 'pkg', parent: 'parent' }),
    expect: {},
    info: 'returns empty when no component or expect',
  },
  {
    fn: () => prepareTest({ name: 'test', pkg: 'pkg', parent: 'parent', expect: true }),
    expect: {},
    info: 'sets expect to true when not defined',
  },
  {
    fn: () => {
      const test = { name: 'test', pkg: 'pkg', parent: 'parent', is: 42 }
      prepareTest(test)
      // @ts-expect-error - prepareTest mutates test to add expect
      return test.expect
    },
    expect: 42,
    info: 'copies is to expect when is defined',
  },
  {
    fn: () =>
      prepareTest({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        component: './Component.svelte',
      }),
    expect: { componentFile: './Component.svelte', componentProps: {} },
    info: 'extracts string component',
  },
  {
    fn: () =>
      prepareTest({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        component: ['./Component.svelte', { prop1: 'value' }],
      }),
    expect: { componentFile: './Component.svelte', componentProps: { prop1: 'value' } },
    info: 'extracts tuple component with props',
  },
  {
    fn: () => {
      const result = prepareTest({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        component: './Comp.svelte',
        props: { extra: 'prop' },
      })
      return result
    },
    expect: { componentFile: './Comp.svelte', componentProps: { extra: 'prop' } },
    info: 'uses explicit props when component is string',
  },
  {
    fn: () => {
      let error
      try {
        prepareTest({
          name: 'test',
          pkg: 'pkg',
          parent: 'parent',
          component: { invalid: 'object' } as unknown as string,
        })
      } catch (e) {
        error = (e as Error).message
      }
      return error
    },
    expect: 'component must be a string or [string, props]',
    info: 'throws for invalid component type',
  },
] satisfies TestCase[]
