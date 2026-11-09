// Shim for $app/navigation
// Provides navigation functions that manipulate the page store
// Context-aware: resolves to current AsyncLocalStorage context
import is from '@magic/types'
import { get } from 'svelte/store'
import { getContext, getDefaultContext } from './state.js'
// OnNavigate extends AfterNavigate for type compatibility
const getCtx = () => getContext() ?? getDefaultContext()
export const goto = async (url, opts = {}) => {
  const ctx = getCtx()
  const currentPage = get(ctx.page)
  const from = currentPage.url
  const targetUrl = is.string(url) ? new URL(url, from.origin) : url
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
      if (is.function(result)) {
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
export const pushState = (url, state = {}) => {
  const ctx = getCtx()
  const currentPage = get(ctx.page)
  const targetUrl = is.string(url) ? new URL(url, currentPage.url.origin) : url
  ctx.page.set({ ...currentPage, url: targetUrl, ...state })
}
export const replaceState = (url, state = {}) => {
  const ctx = getCtx()
  const currentPage = get(ctx.page)
  const targetUrl = is.string(url) ? new URL(url, currentPage.url.origin) : url
  ctx.page.set({ ...currentPage, url: targetUrl, ...state })
}
export const invalidate = _resource => {
  return Promise.resolve()
}
export const invalidateAll = () => Promise.resolve()
export const preloadData = _href => Promise.resolve({ type: 'loaded', status: 200, data: {} })
export const preloadCode = _pathname => Promise.resolve()
export const beforeNavigate = cb => {
  const ctx = getCtx()
  ctx.callbacks.before.push(cb)
  return () => {
    const idx = ctx.callbacks.before.indexOf(cb)
    if (idx !== -1) {
      ctx.callbacks.before.splice(idx, 1)
    }
  }
}
export const afterNavigate = cb => {
  const ctx = getCtx()
  ctx.callbacks.after.push(cb)
  return () => {
    const idx = ctx.callbacks.after.indexOf(cb)
    if (idx !== -1) {
      ctx.callbacks.after.splice(idx, 1)
    }
  }
}
export const onNavigate = cb => {
  const ctx = getCtx()
  ctx.callbacks.on.push(cb)
}
export const disableScrollHandling = () => {
  // no-op
}
export const reset = () => {
  const ctx = getDefaultContext()
  ctx.callbacks.before = []
  ctx.callbacks.after = []
  ctx.callbacks.on = []
}
//# sourceMappingURL=navigation.js.map
