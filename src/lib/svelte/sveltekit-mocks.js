/**
 * @typedef {Object} PageProxy
 * @property {URL} url
 * @property {Object} params
 * @property {Object} state
 */

/**
 * Create a static page object that mimics $app/state page
 * @param {{ url?: string, params?: Object, state?: Object }} [initialData]
 * @returns {PageProxy}
 */
export const createStaticPage = (initialData = {}) => {
  /** @type {{ url: URL, params: Object, state: Object }} */
  const state = {
    url: new URL(initialData.url || 'http://localhost'),
    params: initialData.params || {},
    state: initialData.state || {},
  }

  /** @type {ProxyHandler<Object>} */
  const handler = {
    get: (/** @type {string} */ target, /** @type {string|symbol} */ prop) => {
      if (prop === 'url') {
        return state.url
      }
      if (prop === 'params') {
        return state.params
      }
      if (prop === 'state') {
        return state.state
      }
      return state[/** @type {keyof typeof state} */ (prop)]
    },
    set: (
      /** @type {string} */ target,
      /** @type {string|symbol} */ prop,
      /** @type {any} */ value,
    ) => {
      if (prop === 'url') {
        state.url = value instanceof URL ? value : new URL(value)
      } else if (prop === 'params') {
        state.params = value
      } else if (prop === 'state') {
        state.state = value
      }
      return true
    },
  }

  return /** @type {PageProxy} */ (new Proxy({}, handler))
}

export const browser = true

export const dev = process.env.NODE_ENV !== 'production'

export const prod = process.env.NODE_ENV === 'production'

export const platform = 'node'
