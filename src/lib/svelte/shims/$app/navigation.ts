// Shim for $app/navigation
// Provides navigation functions that manipulate the page store

import { get } from 'svelte/store'
import { page, navigating, type Navigation } from './state.ts'

interface CallbackList {
  before: Array<(nav: BeforeNavigate) => void>
  after: Array<(nav: AfterNavigate) => void>
  on: Array<(nav: OnNavigate) => (() => void) | void>
}

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

const callbacks: CallbackList = {
  before: [],
  after: [],
  on: [],
}

export function goto(url: string | URL, opts: any = {}): Promise<void> {
  const currentPage = get(page)
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

  const beforeList = [...callbacks.before]
  for (const cb of beforeList) {
    try {
      cb({ ...navObj, cancel: () => {} })
    } catch (e) {}
  }

  navigating.set(navObj)

  page.update(p => ({
    ...p,
    url: targetUrl,
    ...(opts.state || {}),
  }))

  navigating.set(null)

  const afterList = [...callbacks.after]
  for (const cb of afterList) {
    try {
      cb({ from, to: targetUrl, type: 'goto' })
    } catch (e) {}
  }

  const onCleanups: (() => void)[] = []
  const onList = [...callbacks.on]
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

export function pushState(url: string | URL, state: any = {}): void {
  const currentPage = get(page)
  const targetUrl = typeof url === 'string' ? new URL(url, currentPage.url.origin) : url
  page.update(p => ({ ...p, url: targetUrl, ...state }))
}

export function replaceState(url: string | URL, state: any = {}): void {
  const currentPage = get(page)
  const targetUrl = typeof url === 'string' ? new URL(url, currentPage.url.origin) : url
  page.update(p => ({ ...p, url: targetUrl, ...state }))
}

export function invalidate(resource: string | URL | ((url: URL) => boolean)): Promise<void> {
  return Promise.resolve()
}

export function invalidateAll(): Promise<void> {
  return Promise.resolve()
}

type PreloadedData =
  | { type: 'loaded'; status: number; data: any }
  | { type: 'redirect'; location: string }

export function preloadData(href: string): Promise<PreloadedData> {
  return Promise.resolve({ type: 'loaded', status: 200, data: {} })
}

export function preloadCode(pathname: string): Promise<void> {
  return Promise.resolve()
}

export function beforeNavigate(cb: (nav: BeforeNavigate) => void): () => void {
  callbacks.before.push(cb)
  return () => {
    const idx = callbacks.before.indexOf(cb)
    if (idx !== -1) callbacks.before.splice(idx, 1)
  }
}

export function afterNavigate(cb: (nav: AfterNavigate) => void): () => void {
  callbacks.after.push(cb)
  return () => {
    const idx = callbacks.after.indexOf(cb)
    if (idx !== -1) callbacks.after.splice(idx, 1)
  }
}

export function onNavigate(cb: (nav: OnNavigate) => (() => void) | void): void {
  callbacks.on.push(cb)
}

export function disableScrollHandling(): void {
  // no-op
}

export function reset() {
  callbacks.before = []
  callbacks.after = []
  callbacks.on = []
}
