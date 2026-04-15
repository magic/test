import type { Window, Document } from 'happy-dom'
export {
  type SimpleEvent,
  type ImageInstance,
  type ImageConstructor,
  type CanvasRenderingContext2D,
  type CustomWindow,
} from './types.ts'
export { imageCache, parsePngDimensions, createImagePolyfill } from './image.ts'
export { createCanvasPolyfill } from './canvas.ts'
import { define, initGlobals } from './globals.ts'
export { define, initGlobals }
export declare const initDOM: () => {
  window: Window
  document: Document
}
export declare const getDocument: () => Document
export declare const getWindow: () => Window
