import { html, tick } from '#lib/svelte/index.js'
import { has } from '#lib/has.js'
import type { TestContext, TestCase } from '#src/types.js'

const component = '#lib/svelte/testFixtures/components/List.svelte'

export default [
  {
    component,
    props: {
      items: [
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
      ],
      title: 'My List',
    },
    fn: async ({ target }: TestContext) => {
      const result = html(target)
      return result
    },
    expect: has.string('My List', 'Item 1', 'Item 2'),
    info: 'renders list with items and title',
  },
  {
    component,
    props: { items: [{ id: 1, text: 'Item 1' }], title: 'My List' },
    fn: async ({ component: instance }: TestContext) => {
      return (instance['itemsList'] as unknown[]).length
    },
    expect: 1,
    info: 'returns itemsList from component',
  },
  {
    component,
    props: {
      items: [
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
      ],
    },
    fn: async ({ target, component: instance }: TestContext) => {
      const removeButtons = target.querySelectorAll('.remove-btn')
      ;(removeButtons[0] as HTMLButtonElement | null)?.click()
      await tick()
      return (instance['itemsList'] as unknown[]).length
    },
    expect: 1,
    info: 'remove button removes item from list',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target }: TestContext) => {
      return html(target)
    },
    expect: has.string('Total: 0'),
    info: 'shows Total: 0 for empty list',
  },
  {
    component,
    props: { items: [{ id: 1, text: 'Item 1' }] },
    fn: async ({ target }: TestContext) => {
      return html(target)
    },
    expect: has.string('Total: 1'),
    info: 'shows correct total for list with items',
  },
  {
    component,
    props: { items: [{ id: 1, text: 'Item 1' }] },
    fn: async ({ target }: TestContext) => {
      return html(target)
    },
    expect: has.string('List'),
    info: 'uses default title when not provided',
  },
  {
    component,
    props: {
      items: [
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
        { id: 3, text: 'Item 3' },
      ],
    },
    fn: async ({ target, component: instance }: TestContext) => {
      const removeButtons = target.querySelectorAll('.remove-btn')
      ;(removeButtons[0] as HTMLButtonElement | null)?.click()
      await tick()
      return (instance['itemsList'] as unknown[]).length
    },
    expect: 2,
    info: 'remove button correctly updates itemsList length',
  },
] satisfies TestCase[]
