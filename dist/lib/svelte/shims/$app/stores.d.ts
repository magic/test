import { type Readable } from 'svelte/store'
import { type Page, type Navigation } from './state.js'
export declare const page: Readable<Page>
export declare const navigating: Readable<Navigation | null>
export declare const updated: Readable<boolean> & {
  check(): Promise<boolean>
}
