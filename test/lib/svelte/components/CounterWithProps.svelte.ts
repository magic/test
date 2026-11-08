import { html, tick } from '#lib/svelte/index.js'
import { has } from '#lib/has.js'
import type { TestContext, TestCase } from '#src/types.js'

const component = '#lib/svelte/testFixtures/components/CounterWithProps.svelte'

export default [
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ target }: TestContext) => {
      return html(target)
    },
    expect: has.string('10'),
    info: 'renders with initial value',
  },
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ component: instance }: TestContext) => {
      return instance['count']
    },
    expect: 10,
    info: 'returns count from component',
  },
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ target, component: instance }: TestContext) => {
      const incButton = target.querySelector('.inc') as HTMLButtonElement | null
      incButton?.click()
      await tick()
      return instance['count']
    },
    expect: 15,
    info: 'increment increases count by step',
  },
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ target, component: instance }: TestContext) => {
      const decButton = target.querySelector('.dec') as HTMLButtonElement | null
      decButton?.click()
      await tick()
      return instance['count']
    },
    expect: 5,
    info: 'decrement decreases count by step',
  },
  {
    component,
    props: { initial: 0, step: 10 },
    fn: async ({ target, component: instance }: TestContext) => {
      const incButton = target.querySelector('.inc') as HTMLButtonElement | null
      incButton?.click()
      await tick()
      return instance['count']
    },
    expect: 10,
    info: 'increment with step 10 adds 10',
  },
  {
    component,
    fn: async ({ target }: TestContext) => {
      return html(target)
    },
    expect: has.string('+1', '-1'),
    info: 'uses default step of 1',
  },
  {
    component,
    props: { step: 3 },
    fn: async ({ target }: TestContext) => {
      return html(target)
    },
    expect: has.string('+3', '-3'),
    info: 'uses custom step value in button labels',
  },
  {
    component,
    props: { initial: 5 },
    fn: async ({ target, component: instance }: TestContext) => {
      return { count: instance['count'], html: html(target) }
    },
    expect: has.properties({ count: 5, html: has.string('5') }),
    info: 'uses custom initial value',
  },
  {
    component,
    fn: async ({ target, component: instance }: TestContext) => {
      return { count: instance['count'], html: html(target) }
    },
    expect: has.properties({ count: 0, html: has.string('+1', '-1') }),
    info: 'uses default initial of 0 when not provided',
  },
] satisfies TestCase[]
