import type { CssObject } from './compile/types.ts'
import type { ComponentProps } from '../../types.ts'
/**
 * Create a raw snippet for passing as children prop
 */
export declare const createSnippet: (renderFn: string | (() => string)) => unknown
/**
 * Wait for Svelte to update the DOM after state changes
 */
export declare const tick: () => Promise<void>
interface MountResult {
  target: HTMLElement
  component: Record<string, unknown>
  unmount: () => Promise<void>
  css: CssObject | null
}
export declare const mount: (
  filePath: string,
  options?: {
    props?: ComponentProps
  },
) => Promise<MountResult>
export {}
