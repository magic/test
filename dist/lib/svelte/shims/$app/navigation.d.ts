import { type Navigation, type BeforeNavigate } from './state.js'
interface AfterNavigate {
  from: URL
  to: URL
  type: string
}
export declare const goto: (
  url: string | URL,
  opts?: {
    replaceState?: boolean
    keepFocus?: boolean
    noScroll?: boolean
    state?: Record<string, unknown>
  },
) => Promise<void>
export declare const pushState: (url: string | URL, state?: Record<string, unknown>) => void
export declare const replaceState: (url: string | URL, state?: Record<string, unknown>) => void
export declare const invalidate: (
  _resource: string | URL | ((url: URL) => boolean),
) => Promise<void>
export declare const invalidateAll: () => Promise<void>
type PreloadedData =
  | {
      type: 'loaded'
      status: number
      data: unknown
    }
  | {
      type: 'redirect'
      location: string
    }
export declare const preloadData: (_href: string) => Promise<PreloadedData>
export declare const preloadCode: (_pathname: string) => Promise<void>
export declare const beforeNavigate: (cb: (nav: BeforeNavigate) => void) => () => void
export declare const afterNavigate: (cb: (nav: AfterNavigate) => void) => () => void
export declare const onNavigate: (cb: (nav: Navigation) => (() => void) | void) => void
export declare const disableScrollHandling: () => void
export declare const reset: () => void
export {}
