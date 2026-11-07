import { type Writable } from 'svelte/store'
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
export interface BeforeNavigate {
  from: URL
  to: URL
  type: string
  willUnload: boolean
  delta: number
  complete: () => void
  cancel: (msg?: string) => void
}
export interface ShimContext {
  page: Writable<Page>
  navigating: Writable<Navigation | null>
  callbacks: {
    before: Array<(nav: Navigation) => void>
    after: Array<(nav: Navigation) => void>
    on: Array<(nav: Navigation) => (() => void) | void>
  }
}
export declare const page: Page
export declare const navigating: Navigation | null
export declare const updated: {
  readonly current: boolean
  check: () => Promise<boolean>
}
export declare const reset: () => void
export declare const createContext: () => ShimContext
export declare const runWithContext: <T>(ctx: ShimContext, fn: () => Promise<T>) => Promise<T>
export declare const getContext: () => ShimContext | undefined
export declare const getDefaultContext: () => ShimContext
export declare const resetDefaultContext: () => void
