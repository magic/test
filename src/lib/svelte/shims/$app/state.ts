// Shim for $app/state
// Provides page, navigating, updated - using Svelte stores

import { writable, get } from 'svelte/store'

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

export const page = writable<Page>(makeDefaultPage())

export const navigating = writable<Navigation | null>(null)

export const updated = {
  get current(): boolean {
    return false
  },
  check: (): Promise<boolean> => Promise.resolve(false),
}

// Getter for direct access (like SvelteKit)
export function getPage(): Page {
  return get(page)
}

// Reset function for test isolation
export function reset() {
  page.set(makeDefaultPage())
  navigating.set(null)
}
