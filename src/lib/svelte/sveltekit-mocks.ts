import is from '@magic/types'

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

  const handler: ProxyHandler<object> = {
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
        state.params = value
      } else if (prop === 'state' && is.object(value)) {
        state.state = value
      }
      return true
    },
  }

  return new Proxy({}, handler as PageProxy)
}

export const browser = true

export const dev = process.env.NODE_ENV !== 'production'

export const prod = process.env.NODE_ENV === 'production'

export const platform = 'node'
