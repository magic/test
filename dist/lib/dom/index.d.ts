import type { Window, Document } from 'happy-dom'
export {
  type SimpleEvent,
  type ImageInstance,
  type ImageConstructor,
  type CanvasRenderingContext2D,
  type CustomWindow,
} from './types.ts'
export { imageCache, parsePngDimensions, createImagePolyfill } from './image.js'
export { createCanvasPolyfill } from './canvas.js'
import { define, initGlobals } from './globals.js'
export { define, initGlobals }
export declare const initDOM: () => {
  window: Window
  document: Document
}
export declare const getDocument: () => Document
export declare const getWindow: () => Window
