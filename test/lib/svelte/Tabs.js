import { mount, html } from '../../../src/lib/index.js'

const component = './src/lib/svelte/components/Tabs.svelte'
const tabs = [
  { id: 'a', label: 'Tab A', content: 'Content A' },
  { id: 'b', label: 'Tab B', content: 'Content B' },
]

export default [
  {
    component,
    props: { tabs },
    fn: ({ target }) => html(target).includes('class="tab active"'),
    expect: true,
    info: 'renders tabs with first tab active',
  },
  {
    component,
    props: { tabs },
    fn: ({ target }) => html(target).includes('Tab B'),
    expect: true,
    info: 'renders tabs with Tab B',
  },
  {
    component,
    props: { tabs },
    fn: async ({ component }) => component.activeTab,
    expect: 'a',
    info: 'returns activeTab from component',
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
  {
    fn: async () => {
      try {
        await mount(component, { props: null })
        return 'no error'
      } catch (e) {
        return e.message
      }
    },
    expect: 'Props must be an object, got object',
    info: 'throws when props is null',
  },
  {
    fn: async () => {
      try {
        await mount(component, { props: [1, 2, 3] })
        return 'no error'
      } catch (e) {
        return e.message
      }
    },
    expect: 'Props must be an object, got object',
    info: 'throws when props is an array',
  },
]
