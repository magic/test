import is from '@magic/types'
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
      return page.url.hostname
    },
    expect: 'localhost',
    info: 'createStaticPage has default localhost URL',
  },
  {
    fn: () => {
      const page = createStaticPage({ url: 'http://example.com' })
      return page.url.hostname
    },
    expect: 'example.com',
    info: 'createStaticPage accepts custom URL',
  },
  {
    fn: () => {
      const page = createStaticPage({ params: { id: '123' } })
      return page.params.id
    },
    expect: '123',
    info: 'createStaticPage accepts params',
  },
  {
    fn: () => {
      const page = createStaticPage({ state: { count: 1 } })
      return page.state.count
    },
    expect: 1,
    info: 'createStaticPage accepts state',
  },
  {
    fn: () => browser,
    expect: is.bool,
    info: 'browser is a boolean',
  },
  {
    fn: () => dev,
    expect: is.bool,
    info: 'dev is a boolean',
  },
  {
    fn: () => prod,
    expect: is.bool,
    info: 'prod is a boolean',
  },
  {
    fn: () => platform,
    expect: 'node',
    info: 'platform is node',
  },
  {
    fn: () => {
      const page = createStaticPage()
      // Access a property that falls through to state[prop]
      // The proxy returns state[prop] for unknown props
      // @ts-expect-error unknownProp is not defined on page
      return page.unknownProp
    },
    expect: is.undef,
    info: 'get handler returns state for unknown prop',
  },
  {
    fn: () => {
      const page = createStaticPage()
      page.url = new URL('http://changed.com')
      return page.url.hostname
    },
    expect: 'changed.com',
    info: 'set handler updates url with string',
  },
  {
    fn: () => {
      const page = createStaticPage({ params: { a: 1 } })
      page.params = { b: 2 }
      return page.params.b
    },
    expect: 2,
    info: 'set handler updates params',
  },
  {
    fn: () => {
      const page = createStaticPage({ state: { x: 1 } })
      page.state = { y: 2 }
      return page.state.y
    },
    expect: 2,
    info: 'set handler updates state',
  },
  // {
  //   fn: () => {
  //     const page = createStaticPage()
  //     // Invalid set should still succeed (returns true)
  //     const result = page.url = 123
  //     return result === true
  //   },
  //   expect: true,
  //   info: 'set handler returns true even for invalid url',
  // },
]
