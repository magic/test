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

// Proxy objects that delegate to the current context's stores
export const page = {
  subscribe: (run: any, invalidate?: any) => getCtx().page.subscribe(run, invalidate),
  set: (value: Page) => getCtx().page.set(value),
  update: (fn: (value: Page) => Page) => getCtx().page.update(fn),
}

export const navigating = {
  subscribe: (run: any, invalidate?: any) => getCtx().navigating.subscribe(run, invalidate),
  set: (value: Navigation | null) => getCtx().navigating.set(value),
  update: (fn: (value: Navigation | null) => Navigation | null) => getCtx().navigating.update(fn),
}

export const updated = {
  get current(): boolean {
    return false
  },
  check: (): Promise<boolean> => Promise.resolve(false),
}

export function getPage(): Page {
  return get(getCtx().page)
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
