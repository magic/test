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

// OnNavigate extends AfterNavigate for type compatibility

const getCtx = () => getContext() ?? getDefaultContext()

export async function goto(
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
    } catch (_e) {
      // ignore nav errors
    }
  }

  ctx.navigating.set(navObj)

  ctx.page.set({
    ...currentPage,
    url: targetUrl,
    ...(opts.state || {}),
  })

  // Allow Svelte to process the state changes
  await new Promise(r => setTimeout(r, 0))

  ctx.navigating.set(null)

  const afterList = [...ctx.callbacks.after]
  for (const cb of afterList) {
    try {
      cb({ from, to: targetUrl, type: 'goto' })
    } catch (_e) {
      // ignore nav errors
    }
  }

  const onCleanups: (() => void)[] = []
  const onList = [...ctx.callbacks.on]
  for (const cb of onList) {
    try {
      const result = cb({ from, to: targetUrl, type: 'goto' })
      if (typeof result === 'function') {
        onCleanups.push(result)
      }
    } catch (_e) {
      // ignore nav errors
    }
  }

  for (const cleanup of onCleanups) {
    try {
      cleanup()
    } catch (_e) {
      // ignore cleanup errors
    }
  }

  return Promise.resolve()
}

export function pushState(url: string | URL, state: Record<string, unknown> = {}): void {
  const ctx = getCtx()
  const currentPage = get(ctx.page) as Page
  const targetUrl = typeof url === 'string' ? new URL(url, currentPage.url.origin) : url
  ctx.page.set({ ...currentPage, url: targetUrl, ...state })
}

export function replaceState(url: string | URL, state: Record<string, unknown> = {}): void {
  const ctx = getCtx()
  const currentPage = get(ctx.page) as Page
  const targetUrl = typeof url === 'string' ? new URL(url, currentPage.url.origin) : url
  ctx.page.set({ ...currentPage, url: targetUrl, ...state })
}

export function invalidate(_resource: string | URL | ((url: URL) => boolean)): Promise<void> {
  return Promise.resolve()
}

export function invalidateAll(): Promise<void> {
  return Promise.resolve()
}

type PreloadedData =
  | { type: 'loaded'; status: number; data: unknown }
  | { type: 'redirect'; location: string }

export function preloadData(_href: string): Promise<PreloadedData> {
  return Promise.resolve({ type: 'loaded', status: 200, data: {} })
}

export function preloadCode(_pathname: string): Promise<void> {
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
