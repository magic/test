import type { SvelteComponent } from 'svelte'

const counterComponent = './src/lib/svelte/testFixtures/components/Counter.svelte'
const derivedComponent = './src/lib/svelte/testFixtures/components/Derived.svelte'

export default [
  {
    component: counterComponent,
    fn: async ({ component }: { component: SvelteComponent }) => component.count,
    expect: 0,
    info: 'auto-exports $state without manual export',
  },
  {
    component: counterComponent,
    fn: async ({ target, component }: { target: Element; component: SvelteComponent }) => {
      if (target) {
        const button = target.querySelector('button')

        if (button) {
          button.click()
        }
      }

      return component.count
    },
    expect: 1,
    info: 'auto-exported state updates correctly after click',
  },
  {
    component: derivedComponent,
    fn: async ({ component }: { component: SvelteComponent }) => component.doubleCount,
    expect: 0,
    info: 'auto-exports $derived without manual export',
  },
  {
    component: derivedComponent,
    fn: async ({ component }: { component: SvelteComponent }) => component.isEmpty,
    expect: true,
    info: 'auto-exports another $derived value',
  },
]
