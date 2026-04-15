import { type Navigation, type BeforeNavigate } from './state.ts'
interface AfterNavigate {
  from: URL
  to: URL
  type: string
}
export declare function goto(
  url: string | URL,
  opts?: {
    replaceState?: boolean
    keepFocus?: boolean
    noScroll?: boolean
    state?: Record<string, unknown>
  },
): Promise<void>
export declare function pushState(url: string | URL, state?: Record<string, unknown>): void
export declare function replaceState(url: string | URL, state?: Record<string, unknown>): void
export declare function invalidate(_resource: string | URL | ((url: URL) => boolean)): Promise<void>
export declare function invalidateAll(): Promise<void>
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
export declare function preloadData(_href: string): Promise<PreloadedData>
export declare function preloadCode(_pathname: string): Promise<void>
export declare function beforeNavigate(cb: (nav: BeforeNavigate) => void): () => void
export declare function afterNavigate(cb: (nav: AfterNavigate) => void): () => void
export declare function onNavigate(cb: (nav: Navigation) => (() => void) | void): void
export declare function disableScrollHandling(): void
export declare function reset(): void
export {}
