import { mount, html, component, click, trigger, scroll, props } from '../src/index.js'
import { flushSync } from 'svelte'

export default [
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/Counter.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect: '<div class="count">0</div> <button>increment</button>',
    info: 'mount returns component with initial html',
  },
  {
    fn: async () => {
      const { component: instance, unmount } = await mount(
        './src/lib/svelte/testFixtures/components/Counter.svelte',
      )
      const result = (component(instance) as { count: number }).count
      await unmount()
      return result
    },
    expect: 0,
    info: 'component returns exported state',
  },
  {
    fn: async () => {
      const {
        target,
        component: instance,
        unmount,
      } = await mount('./src/lib/svelte/testFixtures/components/Counter.svelte')
      ;(instance as { count: number }).count = 5
      flushSync()
      const result = (component(instance) as { count: number }).count
      await unmount()
      return result
    },
    expect: 5,
    info: 'component state can be modified directly',
  },
  {
    fn: async () => {
      let called = false
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/Counter.svelte',
      )) as any
      const button = target.querySelector('button') as HTMLElement
      button.addEventListener('click', () => {
        called = true
      })
      trigger(button, 'click')
      await unmount()
      return called
    },
    expect: true,
    info: 'trigger dispatches click event',
  },
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/Counter.svelte',
      )) as any
      const div = target.querySelector('.count') as HTMLElement
      scroll(div, 0, 100)
      flushSync()
      const result = div.scrollTop as number
      await unmount()
      return result
    },
    expect: 100,
    info: 'scroll sets scroll position',
  },
  {
    fn: async () => {
      let clicked = false
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/Counter.svelte',
      )) as any
      const button = target.querySelector('button') as HTMLElement
      button.addEventListener('click', () => {
        clicked = true
      })
      click(target as any, 'button')
      await unmount()
      return clicked
    },
    expect: true,
    info: 'click triggers click on element by selector',
  },
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/Counter.svelte',
      )) as any
      const button = target.querySelector('button') as HTMLElement
      const result = props(button) as Record<string, any>
      await unmount()
      return result
    },
    expect: {},
    info: 'props returns element attributes',
  },
  // SvelteKit wrapper provides correct $app/environment values (dev mode)
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/SvelteKit.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<!----><div class="env-info"><p>browser: true</p> <p>dev: true</p> <p>prod: false</p></div><!----> <button>Toggle</button>',
    info: 'SvelteKit wrapper provides correct $app/environment values (dev mode)',
  },
  // SvelteKit component state updates correctly with toggle
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/SvelteKit.svelte',
      )) as any
      // Initial state: showEnv = true
      const initial = html(target as any) as string
      // Click button to toggle
      click(target as any, 'button')
      await flushSync()
      const afterToggle = html(target as any) as string
      await unmount()
      return { initial, afterToggle }
    },
    expect: {
      initial:
        '<!----><div class="env-info"><p>browser: true</p> <p>dev: true</p> <p>prod: false</p></div><!----> <button>Toggle</button>',
      afterToggle: '<!----><!----> <button>Toggle</button>',
    },
    info: 'SvelteKit component state updates correctly with toggle',
  },
]
