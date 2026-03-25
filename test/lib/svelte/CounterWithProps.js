import { html } from '../../../src/lib/index.js'

const component = './src/lib/svelte/components/CounterWithProps.svelte'

export default [
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ target }) => {
      return html(target).includes('10')
    },
    info: 'renders with initial value',
  },
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ component: instance }) => {
      return instance.count
    },
    expect: 10,
    info: 'returns count from component',
  },
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ target, component: instance }) => {
      const incButton = target.querySelector('.inc')
      incButton.click()
      await new Promise(r => setTimeout(r, 10))
      return instance.count
    },
    expect: 15,
    info: 'increment increases count by step',
  },
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ target, component: instance }) => {
      const decButton = target.querySelector('.dec')
      decButton.click()
      await new Promise(r => setTimeout(r, 10))
      return instance.count
    },
    expect: 5,
    info: 'decrement decreases count by step',
  },
]
