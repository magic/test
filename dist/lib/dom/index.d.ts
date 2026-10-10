import type { Window, Document } from 'happy-dom'
export {
  type SimpleEvent,
  type ImageInstance,
  type ImageConstructor,
  type CanvasRenderingContext2D,
  type CustomWindow,
} from './types.js'
export { parsePngDimensions, createImagePolyfill } from './image.js'
export { createCanvasPolyfill } from './canvas.js'
import { initGlobals } from './globals.js'
export { initGlobals }
export declare const initDOM: () => {
  window: Window
  document: Document
}
export declare const getDocument: () => Document
export declare const getWindow: () => Window
