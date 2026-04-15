// Shim for $app/state
// Provides page, navigating, updated - using Svelte stores
// Uses AsyncLocalStorage for per-mount context isolation
import { AsyncLocalStorage } from 'node:async_hooks'
import { writable, get } from 'svelte/store'
const makeDefaultPage = () => ({
  url: new URL('http://localhost/'),
  params: {},
  routeId: '',
  data: {},
  status: 200,
  error: null,
  form: undefined,
})
const storage = new AsyncLocalStorage()
const defaultContext = {
  page: writable(makeDefaultPage()),
  navigating: writable(null),
  callbacks: { before: [], after: [], on: [] },
}
const getCtx = () => storage.getStore() ?? defaultContext
const makePageProxy = () => {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        return get(getCtx().page)?.[prop]
      },
      has(_target, prop) {
        const page = get(getCtx().page)
        return prop in (page || {})
      },
      ownKeys(_target) {
        const page = get(getCtx().page)
        return Object.keys(page || {})
      },
      getOwnPropertyDescriptor(_target, prop) {
        const page = get(getCtx().page)
        if (prop in (page || {})) {
          return {
            enumerable: true,
            configurable: true,
            value: page?.[prop],
          }
        }
        return undefined
      },
    },
  )
}
const makeNavigatingProxy = () => {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        return get(getCtx().navigating)?.[prop]
      },
      has(_target, prop) {
        const nav = get(getCtx().navigating)
        return prop in (nav || {})
      },
      ownKeys(_target) {
        const nav = get(getCtx().navigating)
        return Object.keys(nav || {})
      },
      getOwnPropertyDescriptor(_target, prop) {
        const nav = get(getCtx().navigating)
        if (prop in (nav || {})) {
          return {
            enumerable: true,
            configurable: true,
            value: nav?.[prop],
          }
        }
        return undefined
      },
    },
  )
}
export const page = makePageProxy()
export const navigating = makeNavigatingProxy()
export const updated = {
  get current() {
    return false
  },
  check: () => Promise.resolve(false),
}
export const reset = () => {
  resetDefaultContext()
}
export const createContext = () => {
  return {
    page: writable(makeDefaultPage()),
    navigating: writable(null),
    callbacks: { before: [], after: [], on: [] },
  }
}
export const runWithContext = (ctx, fn) => {
  return storage.run(ctx, fn)
}
export const getContext = () => {
  return storage.getStore()
}
export const getDefaultContext = () => {
  return defaultContext
}
export const resetDefaultContext = () => {
  defaultContext.page.set(makeDefaultPage())
  defaultContext.navigating.set(null)
  defaultContext.callbacks.before = []
  defaultContext.callbacks.after = []
  defaultContext.callbacks.on = []
}
