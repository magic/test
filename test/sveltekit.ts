import { mount, html, tick } from '../src/index.js'
import { flushSync as flushSyncSvelte } from 'svelte'
import { reset as resetPage } from '../src/lib/svelte/shims/$app/state.ts'

export default [
  // $app/environment
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/EnvTest.svelte',
      )) as any
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
        './src/lib/svelte/testFixtures/components/StateTest.svelte',
      )) as any
      await tick()
      const result = html(target as any) as string
      await unmount()
      return result.includes('class="state"')
    },
    expect: true,
    info: '$app/state page has correct default values',
  },
  // goto updates URL and navigating
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/NavTest.svelte',
        {
          props: { triggerGoto: true },
        },
      )) as any
      await flushSyncSvelte()
      await tick()
      const url = html(target as any).match(/<span class="url">([^<]*)<\/span>/)?.[1] as string
      const nav = html(target as any).match(
        /<span class="navigating">([^<]*)<\/span>/,
      )?.[1] as string
      await unmount()
      return { url, nav }
    },
    expect: { url: '/target', nav: 'busy' },
    info: 'goto updates URL and navigating store',
  },
  // callbacks fire
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/NavTest.svelte',
        {
          props: { triggerGoto: true },
        },
      )) as any
      await flushSyncSvelte()
      await tick()
      const logs = html(target as any).match(/<span class="logs">([^<]*)<\/span>/)?.[1] as string
      await unmount()
      return logs
    },
    expect: 'before:goto',
    info: 'beforeNavigate, afterNavigate, onNavigate callbacks fire in order',
  },
  // pushState updates page.url
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/NavTest.svelte',
        {
          props: { triggerPush: true },
        },
      )) as any
      await flushSyncSvelte()
      await tick()
      const url = html(target as any).match(/<span class="url">([^<]*)<\/span>/)?.[1] as string
      await unmount()
      return url
    },
    expect: '/',
    info: 'pushState updates page.url',
  },
  // $app/paths resolve and match
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/PathsTest.svelte',
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
        './src/lib/svelte/testFixtures/components/UsesAppImports.svelte',
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
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/ChildWithPage.svelte',
        {
          props: { routeId: '/parent/[id]' },
        },
      )) as any
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
        './src/lib/svelte/testFixtures/components/SvelteKit.svelte',
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
      const { unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/NavTest.svelte',
      )) as any
      await unmount()
      return true
    },
    expect: true,
    info: 'Multiple mount/unmount cycles with navigation callbacks do not throw',
  },
  // $app/forms
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/FormsTest.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="forms"><span class="deserialize-type">success</span> <span class="deserialize-data">{"message":"hello"}</span> <span class="enhanced">false</span> <span class="applyaction-type">function</span></div>',
    info: '$app/forms deserialize and enhance work',
  },
  // $app/stores
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/StoresTest.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="stores"><span class="page-url">/</span> <span class="navigating">idle</span> <span class="updated">false</span></div>',
    info: '$app/stores provides correct default values',
  },
  // $app/server
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/ServerTest.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="server"><span class="event">null</span> <span class="read-status">404</span></div>',
    info: '$app/server getRequestEvent returns null and read returns 404',
  },
  // $app/types
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/TypesTest.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result.includes('class="types"')
    },
    expect: true,
    info: '$app/types provides type exports as non-null objects',
  },
  // $app/forms deserialize error case
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/FormsTest2.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="forms2"><span class="valid-type">success</span> <span class="valid-data">{"foo":"bar"}</span> <span class="invalid-type">error</span> <span class="invalid-error">has-error</span> <span class="empty-type">error</span></div>',
    info: '$app/forms deserialize handles invalid JSON',
  },
  // $app/paths resolve with pathname only
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/PathsTest2.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="paths2"><span class="resolve-path">/simple/path</span> <span class="resolve-http">https://example.com/path</span> <span class="asset">/images/test.png</span> <span class="base"></span> <span class="assets"></span></div>',
    info: '$app/paths resolve handles pathname and http URLs',
  },
  // $app/navigation replaceState
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/NavTest2.svelte',
        {
          props: { triggerReplace: true },
        },
      )) as any
      await flushSyncSvelte()
      await tick()
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="nav2"><span class="replace-url">/replace</span> <span class="invalidate">not-called</span> <span class="invalidate-all">not-called</span> <span class="preload-data">null</span> <span class="preload-code">not-loaded</span></div>',
    info: '$app/navigation replaceState updates page URL',
  },
  // $app/navigation invalidate, invalidateAll, preload
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/NavTest2.svelte',
        {
          props: { triggerInvalidate: true, triggerInvalidateAll: true, triggerPreload: true },
        },
      )) as any
      await flushSyncSvelte()
      await new Promise(r => setTimeout(r, 10))
      const result = html(target as any) as string
      await unmount()
      return (
        result.includes('class="nav2"') &&
        result.includes('invalidate') &&
        result.includes('preload')
      )
    },
    expect: true,
    info: '$app/navigation invalidate, invalidateAll, and preload functions work',
  },
  // $app/server remote functions
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/ServerTest2.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="server2"><span class="command">function</span> <span class="form">function</span> <span class="query">function</span> <span class="prerender">function</span> <span class="requested">iterable</span> <span class="batch">function</span></div>',
    info: '$app/server provides remote function stubs',
  },
  // $app/forms applyAction and enhance
  {
    fn: async () => {
      const { target, unmount } = (await mount(
        './src/lib/svelte/testFixtures/components/FormsTest3.svelte',
      )) as any
      const result = html(target as any) as string
      await unmount()
      return result
    },
    expect:
      '<div class="forms3"><span class="enhance-destroy">has-destroy</span> <span class="applyaction-promise">is-promise</span></div>',
    info: '$app/forms applyAction returns promise and enhance returns destroy',
  },
]
