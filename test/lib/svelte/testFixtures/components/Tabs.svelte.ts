import { mount, html } from '../../../../../src/lib/svelte/index.js'
import type { TestCase } from '../../../../../src/types.js'
import type { TabsComponent } from '../../../../../src/lib/svelte/testFixtures/components/types.js'

const component = './src/lib/svelte/testFixtures/components/Tabs.svelte'
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
    fn: ({ component: instance }) => instance!.activeTab,
    expect: 'a',
    info: 'returns activeTab from component',
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
  {
    fn: async () => {
      try {
        await mount(component, { props: null } as unknown as { props?: Record<string, unknown> })
        return 'no error'
      } catch (e) {
        return (e as Error).message
      }
    },
    expect: 'Props must be an object, got object',
    info: 'throws when props is null',
  },
  {
    fn: async () => {
      try {
        await mount(component, { props: [1, 2, 3] } as unknown as {
          props?: Record<string, unknown>
        })
        return 'no error'
      } catch (e) {
        return (e as Error).message
      }
    },
    expect: 'Props must be an object, got object',
    info: 'throws when props is an array',
  },
  {
    component,
    props: { tabs: [] },
    fn: ({ target }) => html(target).includes('class="tabs"'),
    expect: true,
    info: 'renders tabs container with empty tabs',
  },
  {
    fn: async () => {
      try {
        const sym = Symbol('test')
        await mount(component, { props: { [sym]: 'value' } } as { props?: Record<string, unknown> })
        return 'no error'
      } catch (e) {
        return (e as Error).message
      }
    },
    expect: 'Prop keys must be strings, got symbol',
    info: 'throws when prop key is a symbol',
  },
] satisfies TestCase<TabsComponent>[]