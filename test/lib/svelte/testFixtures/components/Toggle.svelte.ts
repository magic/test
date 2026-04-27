import { mount, html } from '../../../../../src/lib/svelte/index.js'
import type { TestCase } from '../../../../../src/types.js'
import type { ToggleComponent } from '../../../../../src/lib/svelte/testFixtures/components/types.js'

const component = './src/lib/svelte/testFixtures/components/Toggle.svelte'

export default [
  {
    component,
    props: { label: 'Enable', initial: false },
    fn: async ({ target }) => {
      const result = html(target)
      return result.includes('Enable') && result.includes('OFF')
    },
    expect: true,
    info: 'renders toggle with label and initial state OFF',
  },
  {
    component,
    props: { label: 'Enable', initial: true },
    fn: async ({ component: instance }) => {
      return instance!.on
    },
    expect: true,
    info: 'returns on state from component',
  },
  {
    component,
    props: { label: 'Enable', initial: true },
    fn: async ({ target }) => {
      const input = target.querySelector<HTMLInputElement>('input')!
      return input.checked
    },
    expect: true,
    info: 'input checked property reflects initial state',
  },
  {
    fn: async () => {
      try {
        await mount(component, { props: 'invalid' } as unknown as {
          props?: Record<string, unknown>
        })
        return 'no error'
      } catch (e) {
        return (e as Error).message
      }
    },
    expect: 'Props must be an object, got string',
    info: 'throws when props is a string',
  },
] satisfies TestCase<ToggleComponent>[]
