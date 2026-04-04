import is from '@magic/types'

type PageProxy = {
  url: URL
  params: Record<string, unknown>
  state: Record<string, unknown>
}

/**
 * Create a static page object that mimics $app/state page
 */
export const createStaticPage = (
  initialData: { url?: string; params?: object; state?: object } = {},
) => {
  const state = {
    url: new URL(initialData.url || 'http://localhost'),
    params: initialData.params || {},
    state: initialData.state || {},
  }

  const handler: ProxyHandler<PageProxy> = {
    get: (target, prop, receiver) => {
      if (prop === 'url') {
        return state.url
      }
      if (prop === 'params') {
        return state.params
      }
      if (prop === 'state') {
        return state.state
      }
      return state[prop as keyof typeof state]
    },
    set: (target, prop, value, receiver) => {
      if ((prop === 'url' && is.instance(value, URL)) || is.string(value)) {
        state.url = is.instance(value, URL) ? value : new URL(value)
      } else if (prop === 'params' && is.object(value)) {
        state.params = value as Record<string, unknown>
      } else if (prop === 'state' && is.object(value)) {
        state.state = value as Record<string, unknown>
      }
      return true
    },
  }

  return new Proxy(state as PageProxy, handler)
}

export const browser = true

export const dev = process.env.NODE_ENV !== 'production'

export const prod = process.env.NODE_ENV === 'production'

export const platform = 'node'
