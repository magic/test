import { mount, html, click } from '../../../../../src/lib/svelte/index.js'
import { flushSync } from 'svelte'
import type { TestContext, TestCase } from '../../../../../src/types.js'

const component = './src/lib/svelte/testFixtures/components/Derived.svelte'

export default [
  {
    component,
    props: { items: [] },
    fn: ({ component: instance }: TestContext) => instance['count'],
    expect: 0,
    info: 'count starts at 0 with empty items',
  },
  {
    component,
    props: { items: [] },
    fn: ({ component: instance }: TestContext) => instance['doubleCount'],
    expect: 0,
    info: 'doubleCount is 0 when count is 0',
  },
  {
    component,
    props: { items: [] },
    fn: ({ component: instance }: TestContext) => instance['isEmpty'],
    expect: true,
    info: 'isEmpty is true when items is empty',
  },
  {
    component,
    props: { items: [] },
    fn: ({ component: instance }: TestContext) => instance['isLarge'],
    expect: false,
    info: 'isLarge is false when items is empty',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: ({ component: instance }: TestContext) => instance['count'],
    expect: 3,
    info: 'count reflects items length',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: ({ component: instance }: TestContext) => instance['doubleCount'],
    expect: 6,
    info: 'doubleCount is items length * 2',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: ({ component: instance }: TestContext) => instance['isEmpty'],
    expect: false,
    info: 'isEmpty is false when items exist',
  },
  {
    component,
    props: { items: [1] },
    fn: ({ component: instance, target }: TestContext) => {
      const addBtn = target.querySelector('.add')!
      addBtn.click()
      flushSync()
      return (instance as any)['count']
    },
    expect: 2,
    info: 'clicking add increments count via component state',
  },
  {
    component,
    props: { items: [1] },
    fn: ({ target }: TestContext) => {
      const addBtn = target.querySelector('.add')!
      addBtn.click()
      flushSync()
      return target.querySelector('.double')?.textContent
    },
    expect: 'Double: 2',
    info: 'double count updates when count changes',
  },
  {
    component,
    props: { items: [] },
    fn: ({ target }: TestContext) => {
      const removeBtn = target.querySelector('.remove')!
      removeBtn.click()
      flushSync()
      return target.querySelector('.count')?.textContent
    },
    expect: 'Count: 0',
    info: 'remove button does not go below 0',
  },
  {
    component,
    props: { items: [1, 2, 3, 4, 5, 6] },
    fn: ({ component: instance }: TestContext) => instance['isLarge'],
    expect: true,
    info: 'isLarge is true when items > 5',
  },
  {
    component,
    props: { items: [1, 2, 3, 4, 5] },
    fn: ({ component: instance }: TestContext) => instance['isLarge'],
    expect: false,
    info: 'isLarge is false when items = 5',
  },
  {
    component,
    props: { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    fn: ({ target }: TestContext) => {
      const addBtn = target.querySelector('.add')!
      addBtn.click()
      flushSync()
      return target.querySelector('.large')?.textContent
    },
    expect: 'large',
    info: 'large class appears when count exceeds 5',
  },
] satisfies TestCase[]
