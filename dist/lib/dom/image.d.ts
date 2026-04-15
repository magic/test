import type { Window } from 'happy-dom'
import type { ImageInstance } from './types.ts'
export declare const imageCache: Map<string, unknown>
export declare const parsePngDimensions: (dataUrl: string) => {
  width: number
  height: number
}
export declare const createImagePolyfill: (win: Window) => new () => ImageInstance
