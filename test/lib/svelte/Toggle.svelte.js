import { mount, html } from '../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/components/Toggle.svelte'

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
      return instance.on
    },
    expect: true,
    info: 'returns on state from component',
  },
  {
    component,
    props: { label: 'Enable', initial: true },
    fn: async ({ target }) => {
      const input = target.querySelector('input')
      return input.checked
    },
    expect: true,
    info: 'input checked property reflects initial state',
  },
  {
    fn: async () => {
      try {
        await mount(component, { props: 'invalid' })
        return 'no error'
      } catch (e) {
        return e.message
      }
    },
    expect: 'Props must be an object, got string',
    info: 'throws when props is a string',
  },
]
