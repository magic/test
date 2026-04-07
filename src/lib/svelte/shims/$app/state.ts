// Shim for $app/state
// Provides page, navigating, updated - using Svelte stores
// Uses AsyncLocalStorage for per-mount context isolation

import { AsyncLocalStorage } from 'node:async_hooks'
import { writable, get, type Writable } from 'svelte/store'

export interface Page {
  url: URL
  params: Record<string, string>
  routeId: string
  data: unknown
  status: number
  error: unknown
  form?: unknown
}

export interface Navigation {
  from: URL
  to: URL
  type: string
  willUnload: boolean
  delta: number
  complete: () => void
}

const makeDefaultPage = (): Page => ({
  url: new URL('http://localhost/'),
  params: {},
  routeId: '',
  data: {},
  status: 200,
  error: null,
  form: undefined,
})

export interface ShimContext {
  page: Writable<Page>
  navigating: Writable<Navigation | null>
  callbacks: {
    before: Array<(nav: any) => void>
    after: Array<(nav: any) => void>
    on: Array<(nav: any) => (() => void) | void>
  }
}

const storage = new AsyncLocalStorage<ShimContext>()

const defaultContext: ShimContext = {
  page: writable<Page>(makeDefaultPage()),
  navigating: writable<Navigation | null>(null),
  callbacks: { before: [], after: [], on: [] },
}

const getCtx = (): ShimContext => storage.getStore() ?? defaultContext

const makePageProxy = (): Page => {
  return new Proxy({} as any, {
    get(_target, prop) {
      return get(getCtx().page)?.[prop as keyof (keyof Page)]
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
          value: page?.[prop as keyof (keyof Page)],
        }
      }
      return undefined
    },
  })
}

const makeNavigatingProxy = (): Navigation | null => {
  return new Proxy({} as any, {
    get(_target, prop) {
      return get(getCtx().navigating)?.[prop as keyof (keyof Navigation)]
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
          value: nav?.[prop as keyof (keyof Navigation)],
        }
      }
      return undefined
    },
  })
}

export const page: any = makePageProxy()
export const navigating: any = makeNavigatingProxy()

export const updated = {
  get current(): boolean {
    return false
  },
  check: (): Promise<boolean> => Promise.resolve(false),
}

export function reset() {
  resetDefaultContext()
}

export function createContext(): ShimContext {
  return {
    page: writable<Page>(makeDefaultPage()),
    navigating: writable<Navigation | null>(null),
    callbacks: { before: [], after: [], on: [] },
  }
}

export function runWithContext<T>(ctx: ShimContext, fn: () => Promise<T>): Promise<T> {
  return storage.run(ctx, fn)
}

export function getContext(): ShimContext | undefined {
  return storage.getStore()
}

export function getDefaultContext(): ShimContext {
  return defaultContext
}

export function resetDefaultContext(): void {
  defaultContext.page.set(makeDefaultPage())
  defaultContext.navigating.set(null)
  defaultContext.callbacks.before = []
  defaultContext.callbacks.after = []
  defaultContext.callbacks.on = []
}
