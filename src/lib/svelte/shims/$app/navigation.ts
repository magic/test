// Shim for $app/navigation
// Provides navigation functions that manipulate the page store
// Context-aware: resolves to current AsyncLocalStorage context

import { get } from 'svelte/store'
import { getContext, getDefaultContext, type Navigation, type Page } from './state.ts'

interface BeforeNavigate {
  from: URL
  to: URL
  type: string
  willUnload: boolean
  cancel: () => void
}

interface AfterNavigate {
  from: URL
  to: URL
  type: string
}

interface OnNavigate extends AfterNavigate {}

const getCtx = () => getContext() ?? getDefaultContext()

export function goto(
  url: string | URL,
  opts: {
    replaceState?: boolean
    keepFocus?: boolean
    noScroll?: boolean
    state?: Record<string, unknown>
  } = {},
): Promise<void> {
  const ctx = getCtx()
  const currentPage = get(ctx.page) as Page
  const from: URL = currentPage.url
  const targetUrl = typeof url === 'string' ? new URL(url, from.origin) : url

  const navObj: Navigation = {
    from,
    to: targetUrl,
    type: 'goto',
    willUnload: false,
    delta: 0,
    complete: () => {},
  }

  const beforeList = [...ctx.callbacks.before]
  for (const cb of beforeList) {
    try {
      cb({ ...navObj, cancel: () => {} })
    } catch (e) {}
  }

  ctx.navigating.set(navObj)

  ctx.page.update(p => ({
    ...p,
    url: targetUrl,
    ...(opts.state || {}),
  }))

  ctx.navigating.set(null)

  const afterList = [...ctx.callbacks.after]
  for (const cb of afterList) {
    try {
      cb({ from, to: targetUrl, type: 'goto' })
    } catch (e) {}
  }

  const onCleanups: (() => void)[] = []
  const onList = [...ctx.callbacks.on]
  for (const cb of onList) {
    try {
      const result = cb({ from, to: targetUrl, type: 'goto' })
      if (typeof result === 'function') {
        onCleanups.push(result)
      }
    } catch (e) {}
  }

  for (const cleanup of onCleanups) {
    try {
      cleanup()
    } catch {}
  }

  return Promise.resolve()
}

export function pushState(url: string | URL, state: Record<string, unknown> = {}): void {
  const ctx = getCtx()
  const currentPage = get(ctx.page) as Page
  const targetUrl = typeof url === 'string' ? new URL(url, currentPage.url.origin) : url
  ctx.page.update(p => ({ ...p, url: targetUrl, ...state }))
}

export function replaceState(url: string | URL, state: Record<string, unknown> = {}): void {
  const ctx = getCtx()
  const currentPage = get(ctx.page) as Page
  const targetUrl = typeof url === 'string' ? new URL(url, currentPage.url.origin) : url
  ctx.page.update(p => ({ ...p, url: targetUrl, ...state }))
}

export function invalidate(resource: string | URL | ((url: URL) => boolean)): Promise<void> {
  return Promise.resolve()
}

export function invalidateAll(): Promise<void> {
  return Promise.resolve()
}

type PreloadedData =
  | { type: 'loaded'; status: number; data: unknown }
  | { type: 'redirect'; location: string }

export function preloadData(href: string): Promise<PreloadedData> {
  return Promise.resolve({ type: 'loaded', status: 200, data: {} })
}

export function preloadCode(pathname: string): Promise<void> {
  return Promise.resolve()
}

export function beforeNavigate(cb: (nav: BeforeNavigate) => void): () => void {
  const ctx = getCtx()
  ctx.callbacks.before.push(cb)
  return () => {
    const idx = ctx.callbacks.before.indexOf(cb)
    if (idx !== -1) ctx.callbacks.before.splice(idx, 1)
  }
}

export function afterNavigate(cb: (nav: AfterNavigate) => void): () => void {
  const ctx = getCtx()
  ctx.callbacks.after.push(cb)
  return () => {
    const idx = ctx.callbacks.after.indexOf(cb)
    if (idx !== -1) ctx.callbacks.after.splice(idx, 1)
  }
}

export function onNavigate(cb: (nav: OnNavigate) => (() => void) | void): void {
  const ctx = getCtx()
  ctx.callbacks.on.push(cb)
}

export function disableScrollHandling(): void {
  // no-op
}

export function reset() {
  const ctx = getDefaultContext()
  ctx.callbacks.before = []
  ctx.callbacks.after = []
  ctx.callbacks.on = []
}
