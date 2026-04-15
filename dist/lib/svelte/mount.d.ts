import type { ComponentProps } from '../../types.js'
import type { SvelteComponent } from 'svelte'
/**
 * Create a raw snippet for passing as children prop
 */
export declare const createSnippet: (renderFn: string | (() => string)) => unknown
/**
 * Wait for Svelte to update the DOM after state changes
 */
export declare const tick: () => Promise<void>
interface MountResult {
  target: unknown
  component: SvelteComponent
  unmount: () => Promise<void>
  css: unknown
}
export declare const mount: (
  filePath: string,
  options?: {
    props?: ComponentProps
  },
) => Promise<MountResult>
export {}
