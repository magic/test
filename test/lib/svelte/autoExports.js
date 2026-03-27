import { mount } from '../../../src/lib/index.js'

const counterComponent = './src/lib/svelte/components/Counter.svelte'
const derivedComponent = './src/lib/svelte/components/Derived.svelte'

export default [
  {
    component: counterComponent,
    fn: async ({ component }) => component.count,
    expect: 0,
    info: 'auto-exports $state without manual export',
  },
  {
    component: counterComponent,
    fn: async ({ target, component }) => {
      target.querySelector('button').click()
      return component.count
    },
    expect: 1,
    info: 'auto-exported state updates correctly after click',
  },
  {
    component: derivedComponent,
    fn: async ({ component }) => component.doubleCount,
    expect: 0,
    info: 'auto-exports $derived without manual export',
  },
  {
    component: derivedComponent,
    fn: async ({ component }) => component.isEmpty,
    expect: true,
    info: 'auto-exports another $derived value',
  },
]
