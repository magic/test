import type { Window, Document } from 'happy-dom'
export {
  type SimpleEvent,
  type ImageInstance,
  type ImageConstructor,
  type CanvasRenderingContext2D,
  type CustomWindow,
} from './types.ts'
export { parsePngDimensions, createImagePolyfill } from './image.ts'
export { createCanvasPolyfill } from './canvas.ts'
import { initGlobals } from './globals.ts'
export { initGlobals }
export declare const initDOM: () => {
  window: Window
  document: Document
}
export declare const getDocument: () => Document
export declare const getWindow: () => Window
