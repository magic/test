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
]
