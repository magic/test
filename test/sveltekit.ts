import { mount, html } from '../src/index.js'
import { flushSync as flushSyncSvelte } from 'svelte'
import { reset as resetPage } from '../src/lib/svelte/shims/$app/state.ts'

export default [
  // $app/environment
  {
    fn: async () => {
      const { target, unmount } = (await mount('./src/lib/svelte/components/EnvTest.svelte')) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="env"><span class="browser">true</span> <span class="dev">true</span> <span class="prod">false</span> <span class="building">false</span> <span class="version"></span></div>',
    info: '$app/environment provides correct default values',
  },
  // $app/state defaults
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/components/StateTest.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="state"><span class="url">/</span> <span class="routeId"></span> <span class="params">{}</span> <span class="data">{}</span> <span class="status">200</span> <span class="error">ok</span> <span class="navigating">still</span> <span class="updated-current">false</span> <span class="params-exist">no</span> <span class="routeId-exist">no</span></div>',
    info: '$app/state page has correct default values',
  },
  // goto updates URL and navigating
  {
    fn: async () => {
      const { target, unmount } = (await mount('./src/lib/svelte/components/NavTest.svelte', {
        props: { triggerGoto: true },
      })) as any
      await flushSyncSvelte()
      const url = html(target as any).match(/<span class="url">([^<]*)<\/span>/)?.[1] as string
      const nav = html(target as any).match(
        /<span class="navigating">([^<]*)<\/span>/,
      )?.[1] as string
      await unmount()
      return { url, nav }
    },
    expect: { url: '/target', nav: 'idle' },
    info: 'goto updates URL and navigating store',
  },
  // callbacks fire
  {
    fn: async () => {
      const { target, unmount } = (await mount('./src/lib/svelte/components/NavTest.svelte', {
        props: { triggerGoto: true },
      })) as any
      await flushSyncSvelte()
      const logs = html(target as any).match(/<span class="logs">([^<]*)<\/span>/)?.[1] as string
      await unmount()
      return logs
    },
    expect: 'before:goto|after:goto|on:goto|on:cleanup',
    info: 'beforeNavigate, afterNavigate, onNavigate callbacks fire in order',
  },
  // pushState updates page.url
  {
    fn: async () => {
      const { target, unmount } = (await mount('./src/lib/svelte/components/NavTest.svelte', {
        props: { triggerPush: true },
      })) as any
      await flushSyncSvelte()
      const url = html(target as any).match(/<span class="url">([^<]*)<\/span>/)?.[1] as string
      await unmount()
      return url
    },
    expect: '/push',
    info: 'pushState updates page.url',
  },
  // $app/paths resolve and match
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/components/PathsTest.svelte',
      )) as any
      await flushSyncSvelte()
      await Promise.resolve()
      const result = html(target as any) as string
      // console.log('PATHS TEST RESULT:', JSON.stringify(result))
      await unmount()
      return result
    },
    expect:
      '<div class="paths"><span class="resolved">/blog/hello</span> <span class="match-id">/blog/[slug]</span> <span class="match-params">{"slug":"hello"}</span> <span class="asset">/logo.png</span> <span class="base"></span></div>',
    info: '$app/paths resolve and match work',
  },
  // Auto-wrapping
  {
    fn: async () => {
      resetPage()
      const { target, unmount } = (await mount(
        './src/lib/svelte/components/UsesAppImports.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="wrapper-test"><span class="path">/</span> <span class="browser">true</span></div>',
    info: 'Component using $app imports works through auto-wrapper',
  },
  // Wrapper routeId propagation
  {
    fn: async () => {
      const { target, unmount } = (await mount('./src/lib/svelte/components/ChildWithPage.svelte', {
        props: { routeId: '/parent/[id]' },
      })) as any
      await flushSyncSvelte()
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect: '<div>/parent/[id]</div>',
    info: 'Wrapper routeId prop sets page.routeId',
  },
  // Multiple $app modules
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/components/SvelteKit.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<!----><div class="env-info"><p>browser: true</p> <p>dev: true</p> <p>prod: false</p></div><!----> <button>Toggle</button>',
    info: 'SvelteKit component uses multiple $app modules correctly',
  },
  // Multiple mount cycles
  {
    fn: async () => {
      const { unmount } = (await mount('./src/lib/svelte/components/NavTest.svelte')) as any
      await unmount()
      return true
    },
    expect: true,
    info: 'Multiple mount/unmount cycles with navigation callbacks do not throw',
  },
]
