// Shim for $app/navigation
// Provides navigation functions that manipulate the page store
// Context-aware: resolves to current AsyncLocalStorage context
import { get } from 'svelte/store'
import { getContext, getDefaultContext } from './state.js'
// OnNavigate extends AfterNavigate for type compatibility
const getCtx = () => getContext() ?? getDefaultContext()
export async function goto(url, opts = {}) {
  const ctx = getCtx()
  const currentPage = get(ctx.page)
  const from = currentPage.url
  const targetUrl = typeof url === 'string' ? new URL(url, from.origin) : url
  const navObj = {
    from,
    to: targetUrl,
    type: 'goto',
    willUnload: false,
    delta: 0,
    complete: () => {},
    cancel: _msg => {},
  }
  const beforeList = [...ctx.callbacks.before]
  for (const cb of beforeList) {
    try {
      cb(navObj)
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
      cb({
        from,
        to: targetUrl,
        type: 'goto',
        willUnload: false,
        delta: 0,
        complete: () => {},
        cancel: () => {},
      })
    } catch (_e) {
      // ignore nav errors
    }
  }
  const onCleanups = []
  const onList = [...ctx.callbacks.on]
  for (const cb of onList) {
    try {
      const result = cb({
        from,
        to: targetUrl,
        type: 'goto',
        willUnload: false,
        delta: 0,
        complete: () => {},
      })
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
export function pushState(url, state = {}) {
  const ctx = getCtx()
  const currentPage = get(ctx.page)
  const targetUrl = typeof url === 'string' ? new URL(url, currentPage.url.origin) : url
  ctx.page.set({ ...currentPage, url: targetUrl, ...state })
}
export function replaceState(url, state = {}) {
  const ctx = getCtx()
  const currentPage = get(ctx.page)
  const targetUrl = typeof url === 'string' ? new URL(url, currentPage.url.origin) : url
  ctx.page.set({ ...currentPage, url: targetUrl, ...state })
}
export function invalidate(_resource) {
  return Promise.resolve()
}
export function invalidateAll() {
  return Promise.resolve()
}
export function preloadData(_href) {
  return Promise.resolve({ type: 'loaded', status: 200, data: {} })
}
export function preloadCode(_pathname) {
  return Promise.resolve()
}
export function beforeNavigate(cb) {
  const ctx = getCtx()
  ctx.callbacks.before.push(cb)
  return () => {
    const idx = ctx.callbacks.before.indexOf(cb)
    if (idx !== -1) ctx.callbacks.before.splice(idx, 1)
  }
}
export function afterNavigate(cb) {
  const ctx = getCtx()
  ctx.callbacks.after.push(cb)
  return () => {
    const idx = ctx.callbacks.after.indexOf(cb)
    if (idx !== -1) ctx.callbacks.after.splice(idx, 1)
  }
}
export function onNavigate(cb) {
  const ctx = getCtx()
  ctx.callbacks.on.push(cb)
}
export function disableScrollHandling() {
  // no-op
}
export function reset() {
  const ctx = getDefaultContext()
  ctx.callbacks.before = []
  ctx.callbacks.after = []
  ctx.callbacks.on = []
}
