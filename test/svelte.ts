import { html, click, trigger, scroll, props } from '#src/svelte.js'
import { flushSync } from 'svelte'
import type { Test } from '#src/types.js'

export default [
  {
    component: 'src/lib/svelte/testFixtures/components/Counter.svelte',
    fn: async ({ target }) => {
      const result = html(target)
      return result
    },
    expect: '<div class="count">0</div> <button>increment</button>',
    info: 'mount returns component with initial html',
  },
  {
    component: 'src/lib/svelte/testFixtures/components/Counter.svelte',
    fn: async ({ component }) => {
      const result = component.count
      return result
    },
    expect: 0,
    info: 'component returns exported state',
  },
  {
    component: 'src/lib/svelte/testFixtures/components/Counter.svelte',
    fn: async ({ component }) => {
      component.count = 5
      flushSync()
      const result = component.count
      return result
    },
    expect: 5,
    info: 'component state can be modified directly',
  },
  {
    component: 'src/lib/svelte/testFixtures/components/Counter.svelte',
    fn: async ({ target }) => {
      let called = false
      const button = target.querySelector('button')
      button?.addEventListener('click', () => {
        called = true
      })
      if (button) {
        trigger(button, 'click')
      }
      return called
    },
    expect: true,
    info: 'trigger dispatches click event',
  },
  {
    component: 'src/lib/svelte/testFixtures/components/Counter.svelte',
    fn: async ({ target }) => {
      const div = target.querySelector('.count')
      if (div) {
        scroll(div, 0, 100)
      }
      flushSync()
      const result = div?.scrollTop
      return result
    },
    expect: 100,
    info: 'scroll sets scroll position',
  },
  {
    component: 'src/lib/svelte/testFixtures/components/Counter.svelte',
    fn: async ({ target }) => {
      let clicked = false
      const button = target.querySelector('button')
      button?.addEventListener('click', () => {
        clicked = true
      })
      if (target) {
        click(target, 'button')
      }
      return clicked
    },
    expect: true,
    info: 'click triggers click on element by selector',
  },
  {
    component: 'src/lib/svelte/testFixtures/components/Counter.svelte',
    fn: async ({ target }) => {
      const button = target.querySelector('button')!
      const result = props(button)
      return result
    },
    expect: {},
    info: 'props returns element attributes',
  },
  {
    component: 'src/lib/svelte/testFixtures/components/SvelteKit.svelte',
    fn: async ({ target }) => {
      const result = html(target)
      return result
    },
    expect:
      '<!----><div class="env-info"><p>browser: true</p> <p>dev: true</p> <p>prod: false</p></div><!----> <button>Toggle</button>',
    info: 'SvelteKit wrapper provides correct $app/environment values (dev mode)',
  },
  {
    component: 'src/lib/svelte/testFixtures/components/SvelteKit.svelte',
    fn: async ({ target }) => {
      return html(target)
    },
    expect:
      '<!----><div class="env-info"><p>browser: true</p> <p>dev: true</p> <p>prod: false</p></div><!----> <button>Toggle</button>',
    info: 'SvelteKit component initial state',
  },
  {
    component: 'src/lib/svelte/testFixtures/components/SvelteKit.svelte',
    fn: async ({ target }) => {
      click(target, 'button')
      await flushSync()
      return html(target)
    },
    expect: '<!----><!----> <button>Toggle</button>',
    info: 'SvelteKit component state after toggle',
  },
] satisfies Test[]
