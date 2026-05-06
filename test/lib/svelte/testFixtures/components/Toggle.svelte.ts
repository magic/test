import { mount, html } from '../../../../../src/lib/svelte/index.js'
import type { TestContext, TestCase } from '../../../../../src/types.js'

const component = './src/lib/svelte/testFixtures/components/Toggle.svelte'

export default [
  {
    component,
    props: { label: 'Enable', initial: false },
    fn: async ({ target }: TestContext) => {
      const result = html(target)
      return result.includes('Enable') && result.includes('OFF')
    },
    expect: true,
    info: 'renders toggle with label and initial state OFF',
  },
  {
    component,
    props: { label: 'Enable', initial: true },
    fn: async ({ component: instance }: TestContext) => {
      return instance['on']
    },
    expect: true,
    info: 'returns on state from component',
  },
  {
    component,
    props: { label: 'Enable', initial: true },
    fn: async ({ target }: TestContext) => {
      const input = target.querySelector('input') as HTMLInputElement | null
      return input?.checked ?? false
    },
    expect: true,
    info: 'input checked property reflects initial state',
  },
  {
    fn: async () => {
      try {
        // @ts-expect-error testing invalid props type
        await mount(component, { props: 'invalid' })
        return 'no error'
      } catch (e) {
        return (e as Error).message
      }
    },
    expect: 'Props must be an object, got string',
    info: 'throws when props is a string',
  },
] satisfies TestCase[]
