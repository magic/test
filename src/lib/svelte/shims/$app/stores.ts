// Shim for $app/stores
// Legacy store exports (deprecated, use $app/state instead)
// Provides stores as Svelte stores for backward compatibility

import { writable, get, type Readable } from 'svelte/store'
import { getDefaultContext, type Page, type Navigation } from './state.ts'

function createPageStore(): Readable<Page> {
  const ctx = getDefaultContext()
  const { subscribe } = writable<Page>(get(ctx.page) as Page)
  return {
    subscribe,
  }
}

function createNavigatingStore(): Readable<Navigation | null> {
  const ctx = getDefaultContext()
  const { subscribe } = writable<Navigation | null>(get(ctx.navigating) as Navigation | null)
  return {
    subscribe,
  }
}

export const page: Readable<Page> = createPageStore()
export const navigating: Readable<Navigation | null> = createNavigatingStore()

export const updated: Readable<boolean> & { check(): Promise<boolean> } = {
  subscribe: writable(false).subscribe,
  check: () => Promise.resolve(false),
}
