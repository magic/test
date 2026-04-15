// Shim for $app/stores
// Legacy store exports (deprecated, use $app/state instead)
// Provides stores as Svelte stores for backward compatibility
import { writable, get } from 'svelte/store'
import { getDefaultContext } from './state.js'
function createPageStore() {
  const ctx = getDefaultContext()
  const { subscribe } = writable(get(ctx.page))
  return {
    subscribe,
  }
}
function createNavigatingStore() {
  const ctx = getDefaultContext()
  const { subscribe } = writable(get(ctx.navigating))
  return {
    subscribe,
  }
}
export const page = createPageStore()
export const navigating = createNavigatingStore()
export const updated = {
  subscribe: writable(false).subscribe,
  check: () => Promise.resolve(false),
}
