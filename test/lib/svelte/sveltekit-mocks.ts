import {
  createStaticPage,
  browser,
  dev,
  prod,
  platform,
} from '../../../src/lib/svelte/sveltekit-mocks.js'

export default [
  {
    fn: () => {
      const page = createStaticPage()
      return page.url.hostname === 'localhost'
    },
    expect: true,
    info: 'createStaticPage has default localhost URL',
  },
  {
    fn: () => {
      const page = createStaticPage({ url: 'http://example.com' })
      return page.url.hostname === 'example.com'
    },
    expect: true,
    info: 'createStaticPage accepts custom URL',
  },
  {
    fn: () => {
      const page = createStaticPage({ params: { id: '123' } })
      return page.params.id === '123'
    },
    expect: true,
    info: 'createStaticPage accepts params',
  },
  {
    fn: () => {
      const page = createStaticPage({ state: { count: 1 } })
      return page.state.count === 1
    },
    expect: true,
    info: 'createStaticPage accepts state',
  },
  {
    fn: () => typeof browser === 'boolean',
    expect: true,
    info: 'browser is a boolean',
  },
  {
    fn: () => typeof dev === 'boolean',
    expect: true,
    info: 'dev is a boolean',
  },
  {
    fn: () => typeof prod === 'boolean',
    expect: true,
    info: 'prod is a boolean',
  },
  {
    fn: () => platform === 'node',
    expect: true,
    info: 'platform is node',
  },
  {
    fn: () => {
      const page = createStaticPage() as any
      // Access a property that falls through to state[prop]
      // The proxy returns state[prop] for unknown props
      const result = page.unknownProp
      return result === undefined
    },
    expect: true,
    info: 'get handler returns state for unknown prop',
  },
  {
    fn: () => {
      const page = createStaticPage() as any
      page.url = 'http://changed.com'
      return page.url.hostname === 'changed.com'
    },
    expect: true,
    info: 'set handler updates url with string',
  },
  {
    fn: () => {
      const page = createStaticPage({ params: { a: 1 } }) as any
      page.params = { b: 2 }
      return page.params.b === 2
    },
    expect: true,
    info: 'set handler updates params',
  },
  {
    fn: () => {
      const page = createStaticPage({ state: { x: 1 } }) as any
      page.state = { y: 2 }
      return page.state.y === 2
    },
    expect: true,
    info: 'set handler updates state',
  },
  // {
  //   fn: () => {
  //     const page = createStaticPage() as any
  //     // Invalid set should still succeed (returns true)
  //     const result = page.url = 123
  //     return result === true
  //   },
  //   expect: true,
  //   info: 'set handler returns true even for invalid url',
  // },
]