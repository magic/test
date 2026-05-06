import { mount, html } from '../../../../../src/lib/svelte/index.js'
import { tryCatch } from '../../../../../src/index.js'
import type { TestContext, TestCase } from '../../../../../src/types.js'

const component = './src/lib/svelte/testFixtures/components/Derived.svelte'

export default [
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target }: TestContext) => {
      const result = html(target)
      return result.includes('Count: 3') && result.includes('Double: 6')
    },
    expect: true,
    info: 'renders derived values',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ component: instance }: TestContext) => {
      return instance['isEmpty'] as boolean
    },
    expect: false,
    info: 'isEmpty is false when items exist',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ component: instance }: TestContext) => {
      return instance['isEmpty'] as boolean
    },
    expect: true,
    info: 'isEmpty is true when no items',
  },
  {
    fn: async () => {
      const tryCatchFn = tryCatch(mount as (...args: unknown[]) => unknown, component, {
        props: null,
      } as Record<string, unknown>)
      const result = await tryCatchFn()
      return result
    },
    expect: (t: unknown) => (t as Error).message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target, component: instance }: TestContext) => {
      const addButton = target.querySelector('.add') as HTMLButtonElement | null
      addButton?.click()
      await new Promise(r => setTimeout(r, 10))
      return instance['count'] as number
    },
    expect: 4,
    info: 'add button increments count',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target, component: instance }: TestContext) => {
      const removeButton = target.querySelector('.remove') as HTMLButtonElement | null
      removeButton?.click()
      await new Promise(r => setTimeout(r, 10))
      return instance['count'] as number
    },
    expect: 2,
    info: 'remove button decrements count',
  },
  {
    component,
    props: { items: [1, 2, 3, 4, 5, 6] },
    fn: async ({ component: instance }: TestContext) => {
      return instance['isLarge'] as boolean
    },
    expect: true,
    info: 'isLarge is true when count > 5',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ component: instance }: TestContext) => {
      return instance['isLarge'] as boolean
    },
    expect: false,
    info: 'isLarge is false when count <= 5',
  },
  {
    component,
    props: { items: [1, 2] },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('Double: 4')
    },
    expect: true,
    info: 'renders doubleCount value',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('Double: 0')
    },
    expect: true,
    info: 'renders doubleCount as 0 for empty items',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('Count: 0')
    },
    expect: true,
    info: 'renders count as 0 for empty items',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('empty')
    },
    expect: true,
    info: 'renders empty text when isEmpty is true',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('has items')
    },
    expect: true,
    info: 'renders has items text when isEmpty is false',
  },
  {
    component,
    props: { items: [1, 2, 3, 4, 5, 6] },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('large')
    },
    expect: true,
    info: 'renders large text when isLarge is true',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('small')
    },
    expect: true,
    info: 'renders small text when isLarge is false',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target, component: instance }: TestContext) => {
      const removeButton = target.querySelector('.remove') as HTMLButtonElement | null
      removeButton?.click()
      await new Promise(r => setTimeout(r, 10))
      return instance['count'] as number
    },
    expect: 0,
    info: 'remove button does not go below 0 when count is 0',
  },
] satisfies TestCase[]
